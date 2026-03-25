/**
 * Appointment status, loyalty, and admin/client-driven notifications.
 * APPOINTMENT_CONFIRMED (WhatsApp/SMS) only when:
 * actor === admin-api AND previousStatus === pending AND newStatus === confirmed.
 */

import { prisma } from "@/lib/db";
import { MIN_HOURS_BEFORE_CANCEL } from "./constants";
import { add, parse, isBefore } from "date-fns";
import { toIsraeliMobileE164 } from "@/lib/phone-utils";
import { getDiscountForCount } from "@/lib/loyalty";
import {
  sendOfficialConfirmationByAdmin,
  sendAppointmentCancelledNotice,
  sendAppointmentCompletedNotice,
  sendLoyaltyRewardUnlocked,
} from "@/lib/notifications/customer-delivery";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";

const LOG = "[salon-notify][admin-status]";
const CONFIRM_FLOW = "[salon-notify][admin-confirm-flow]";
const E2E = "[admin-e2e-verify]";

/** Who triggered the status change — WhatsApp confirmation only for `admin-api` + pending→confirmed. */
export type AppointmentStatusActor = "admin-api" | "client-cancel" | "system";

export type UpdateAppointmentStatusResult = {
  success: boolean;
  error?: string;
  /** True when new status equals previous (no DB write, no side effects). */
  unchanged?: boolean;
  /** User-facing hint for admin UI (e.g. already confirmed). */
  message?: string;
};

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: string,
  context: { actor: AppointmentStatusActor }
): Promise<UpdateAppointmentStatusResult> {
  console.log(`${LOG} entered status update handler`, {
    appointmentId,
    newStatus,
    actor: context.actor,
  });

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: true,
      service: true,
      lines: { orderBy: { sortOrder: "asc" }, include: { service: true } },
    },
  });

  if (!appointment) {
    return { success: false, error: "الحجز غير موجود" };
  }

  const prevStatus = appointment.status;
  const phoneRaw = appointment.phone?.trim() ?? null;
  const phoneNormalizedE164 = phoneRaw ? toIsraeliMobileE164(phoneRaw) : null;

  console.log(`${LOG} loaded appointment`, {
    appointmentId,
    previousStatus: prevStatus,
    newStatus,
    actor: context.actor,
    phoneRaw,
    phoneNormalizedE164,
  });

  if (newStatus === prevStatus) {
    const skipDuplicateConfirmation = prevStatus === "confirmed";
    console.log(`${CONFIRM_FLOW}`, {
      appointmentId,
      previousStatus: prevStatus,
      newStatus,
      actor: context.actor,
      phoneRaw,
      phoneNormalizedE164,
      notificationSkippedBecauseAlreadyConfirmed:
        skipDuplicateConfirmation && newStatus === "confirmed",
      notificationAttempted: false,
      selectedChannel: null,
      sendSuccess: null,
      sendError: null,
      note: skipDuplicateConfirmation
        ? "APPOINTMENT_CONFIRMED not sent — status already confirmed (no duplicate sends)"
        : "Same status — no transition",
    });
    return {
      success: true,
      unchanged: true,
      message:
        newStatus === "confirmed"
          ? "تم تأكيد هذا الموعد مسبقاً"
          : undefined,
    };
  }

  let previousCompletedCount: number | undefined;
  let priorLoyaltyUnlockNotifiedPercent = 0;
  if (newStatus === "completed" && prevStatus !== "completed" && appointment.userId) {
    const u = await prisma.user.findUnique({
      where: { id: appointment.userId },
      select: { completedAppointmentsCount: true, loyaltyUnlockNotifiedPercent: true },
    });
    previousCompletedCount = u?.completedAppointmentsCount ?? 0;
    priorLoyaltyUnlockNotifiedPercent = u?.loyaltyUnlockNotifiedPercent ?? 0;
  }

  if (newStatus === "completed" && prevStatus !== "completed") {
    if (appointment.userId) {
      await prisma.user.update({
        where: { id: appointment.userId },
        data: { completedAppointmentsCount: { increment: 1 } },
      });
    }
  }

  if (prevStatus === "completed" && newStatus !== "completed") {
    if (appointment.userId) {
      const user = await prisma.user.findUnique({
        where: { id: appointment.userId },
        select: { completedAppointmentsCount: true },
      });
      if (user && user.completedAppointmentsCount > 0) {
        await prisma.user.update({
          where: { id: appointment.userId },
          data: { completedAppointmentsCount: { decrement: 1 } },
        });
      }
    }
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: newStatus as
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show",
      completedAt: newStatus === "completed" ? new Date() : null,
    },
  });

  const pendingToConfirmedWillNotify =
    context.actor === "admin-api" &&
    prevStatus === "pending" &&
    newStatus === "confirmed";

  console.log(`${LOG} appointment DB status committed`, {
    appointmentId,
    previousStatus: prevStatus,
    newStatus,
    actor: context.actor,
    willSendOfficialConfirmation: pendingToConfirmedWillNotify,
    phoneRaw,
    phoneNormalizedE164,
  });

  const u = appointment.user;
  const email = appointment.email?.trim() || u?.email?.trim() || undefined;
  const deliveryBase = {
    customerName: appointment.customerName,
    serviceName: formatAppointmentServiceNames(appointment),
    date: appointment.date,
    time: appointment.startTime,
    userId: appointment.userId ?? undefined,
    appointmentId: appointment.id,
    phone: appointment.phone?.trim() || null,
    email,
    phoneNotificationsEnabled: u?.phoneNotificationsEnabled ?? false,
    preferredChannel: u?.preferredNotificationChannel ?? "WHATSAPP",
  };

  const pendingToConfirmed =
    prevStatus === "pending" && newStatus === "confirmed";
  const adminSetsConfirmedFromNonPending =
    context.actor === "admin-api" &&
    newStatus === "confirmed" &&
    prevStatus !== "pending" &&
    prevStatus !== "confirmed";

  if (pendingToConfirmed) {
    if (context.actor !== "admin-api") {
      console.log(`${CONFIRM_FLOW}`, {
        appointmentId,
        previousStatus: prevStatus,
        newStatus,
        actor: context.actor,
        phoneRaw,
        phoneNormalizedE164,
        pendingToConfirmed: true,
        notificationSkippedBecauseAlreadyConfirmed: false,
        notificationAttempted: false,
        notificationSkippedReason: "not_admin_actor",
        selectedChannel: null,
        sendSuccess: null,
        sendError: null,
      });
    } else {
      console.log(`${E2E} sendOfficialConfirmationByAdmin invoked (pending→confirmed)`, {
        appointmentId,
        previousStatus: prevStatus,
        newStatus,
      });
      try {
        const notifyResult = await sendOfficialConfirmationByAdmin(deliveryBase);
        console.log(`${CONFIRM_FLOW}`, {
          appointmentId,
          previousStatus: prevStatus,
          newStatus,
          actor: context.actor,
          phoneRaw,
          phoneNormalizedE164,
          pendingToConfirmed: true,
          notificationSkippedBecauseAlreadyConfirmed: false,
          notificationAttempted: true,
          notificationSkippedReason: notifyResult.success
            ? null
            : (notifyResult.error ?? "send_failed"),
          selectedChannel: notifyResult.channel ?? null,
          sendSuccess: notifyResult.success,
          sendError: notifyResult.success ? null : (notifyResult.error ?? null),
          twilioMessageSid: notifyResult.twilioMessageSid ?? null,
        });
        if (notifyResult.success) {
          console.log(`${E2E} confirmation pipeline OK (check dedup window if testing repeats)`, {
            appointmentId,
            channel: notifyResult.channel,
            twilioMessageSid: notifyResult.twilioMessageSid ?? null,
          });
        }
        if (!notifyResult.success) {
          console.error(`${LOG} official confirmation send FAILED`, {
            appointmentId,
            channel: notifyResult.channel,
            error: notifyResult.error,
          });
          console.error(`${E2E} FAILURE REASON`, {
            appointmentId,
            step: "sendOfficialConfirmationByAdmin",
            error: notifyResult.error,
            channel: notifyResult.channel,
          });
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.log(`${CONFIRM_FLOW}`, {
          appointmentId,
          previousStatus: prevStatus,
          newStatus,
          actor: context.actor,
          phoneRaw,
          phoneNormalizedE164,
          pendingToConfirmed: true,
          notificationSkippedBecauseAlreadyConfirmed: false,
          notificationAttempted: true,
          notificationSkippedReason: "exception",
          selectedChannel: null,
          sendSuccess: false,
          sendError: errMsg,
        });
        console.error(`${LOG} official confirmation threw`, { appointmentId, err: e });
        console.error(`${E2E} FAILURE REASON`, {
          appointmentId,
          step: "sendOfficialConfirmationByAdmin_exception",
          error: errMsg,
        });
      }
    }
  } else if (adminSetsConfirmedFromNonPending) {
    console.log(`${CONFIRM_FLOW}`, {
      appointmentId,
      previousStatus: prevStatus,
      newStatus,
      actor: context.actor,
      phoneRaw,
      phoneNormalizedE164,
      pendingToConfirmed: false,
      notificationSkippedBecauseAlreadyConfirmed: false,
      notificationAttempted: false,
      notificationSkippedReason:
        "whatsapp_only_when_previous_was_pending — no APPOINTMENT_CONFIRMED",
      selectedChannel: null,
      sendSuccess: null,
      sendError: null,
    });
    console.log(`${E2E} skip WhatsApp: not pending→confirmed`, {
      appointmentId,
      previousStatus: prevStatus,
      newStatus,
    });
  } else if (newStatus !== "confirmed") {
    console.log(`${LOG} status change (no confirmation notification type)`, {
      appointmentId,
      previousStatus: prevStatus,
      newStatus,
    });
  }

  const transitionToCancelled =
    newStatus === "cancelled" && prevStatus !== "cancelled";
  if (transitionToCancelled) {
    if (context.actor === "admin-api" || context.actor === "client-cancel") {
      console.log(`${LOG} appointment cancelled → notify customer`, {
        appointmentId,
        actor: context.actor,
      });
      try {
        const r = await sendAppointmentCancelledNotice(deliveryBase);
        console.log(`${LOG} cancel notify result`, {
          success: r.success,
          error: r.error,
          channel: r.channel,
        });
      } catch (e) {
        console.error(`${LOG} cancel notify threw`, e);
      }
    } else {
      console.log(`${LOG} skip cancel notify (actor)`, { actor: context.actor });
    }
  }

  const transitionToCompleted =
    newStatus === "completed" && prevStatus !== "completed";
  if (transitionToCompleted && context.actor === "admin-api") {
    console.log(`${LOG} appointment completed → notify customer`, { appointmentId });
    try {
      const r = await sendAppointmentCompletedNotice(deliveryBase);
      console.log(`${LOG} completed notify result`, {
        success: r.success,
        error: r.error,
        channel: r.channel,
      });
    } catch (e) {
      console.error(`${LOG} completed notify threw`, e);
    }

    if (
      previousCompletedCount !== undefined &&
      appointment.userId
    ) {
      const newCount = previousCompletedCount + 1;
      const prevDiscount = getDiscountForCount(previousCompletedCount);
      const newDiscount = getDiscountForCount(newCount);
      if (
        newDiscount > prevDiscount &&
        newDiscount > priorLoyaltyUnlockNotifiedPercent
      ) {
        console.log(`${LOG} loyalty tier unlocked`, {
          userId: appointment.userId,
          newCount,
          newDiscount,
        });
        try {
          const lr = await sendLoyaltyRewardUnlocked(
            deliveryBase,
            newDiscount,
            newCount
          );
          console.log(`${LOG} loyalty unlock notify result`, {
            success: lr.success,
            error: lr.error,
            channel: lr.channel,
          });
          if (lr.success) {
            await prisma.user.update({
              where: { id: appointment.userId },
              data: { loyaltyUnlockNotifiedPercent: newDiscount },
            });
          }
        } catch (e) {
          console.error(`${LOG} loyalty unlock notify threw`, e);
        }
      }
    }
  } else if (transitionToCompleted && context.actor !== "admin-api") {
    console.log(`${LOG} completed transition without admin-api — skip completed/loyalty notify`, {
      actor: context.actor,
    });
  }

  return { success: true };
}

export function canCancelAppointment(dateStr: string, startTime: string): {
  allowed: boolean;
  error?: string;
} {
  const aptDateTime = parse(`${dateStr} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const minCancelTime = add(new Date(), { hours: MIN_HOURS_BEFORE_CANCEL });

  if (isBefore(aptDateTime, minCancelTime)) {
    return {
      allowed: false,
      error: `لا يمكن إلغاء الحجز قبل أقل من ${MIN_HOURS_BEFORE_CANCEL} ساعة من موعد الحجز.`,
    };
  }

  return { allowed: true };
}
