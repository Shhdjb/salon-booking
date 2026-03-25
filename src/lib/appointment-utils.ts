/**
 * Appointment status, loyalty, and admin/client-driven notifications.
 * Official confirmation (APPOINTMENT_CONFIRMED) only when admin sets مؤكد.
 */

import { prisma } from "@/lib/db";
import { MIN_HOURS_BEFORE_CANCEL } from "./constants";
import { add, parse, isBefore } from "date-fns";
import { normalizePhone } from "@/lib/phone-utils";
import { getDiscountForCount } from "@/lib/loyalty";
import {
  sendOfficialConfirmationByAdmin,
  sendAppointmentCancelledNotice,
  sendAppointmentCompletedNotice,
  sendLoyaltyRewardUnlocked,
} from "@/lib/notifications/customer-delivery";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";

const LOG = "[salon-notify][admin-status]";

/** Who triggered the status change — official confirmation only for `admin-api`. */
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
  const phoneNormalizedForLog = appointment.phone
    ? normalizePhone(appointment.phone.trim())
    : null;
  console.log(`${LOG} loaded appointment`, {
    appointmentId,
    previousStatus: prevStatus,
    newStatus,
    actor: context.actor,
    customerPhoneRaw: appointment.phone,
    customerPhoneNormalized: phoneNormalizedForLog,
  });

  if (newStatus === prevStatus) {
    const skipDuplicateConfirmation = prevStatus === "confirmed";
    console.log(`${LOG} status unchanged — skipping DB update and notifications`, {
      appointmentId,
      previousStatus: prevStatus,
      newStatus,
      actor: context.actor,
      confirmationSkippedAlreadyConfirmed: skipDuplicateConfirmation,
      normalizedDestinationPhone: phoneNormalizedForLog,
      note: skipDuplicateConfirmation
        ? "APPOINTMENT_CONFIRMED not sent (already confirmed)"
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

  console.log(`${LOG} appointment DB status committed`, {
    appointmentId,
    previousStatus: prevStatus,
    newStatus,
    actor: context.actor,
    willSendOfficialConfirmation:
      context.actor === "admin-api" &&
      newStatus === "confirmed" &&
      prevStatus !== "confirmed",
    normalizedDestinationPhone: phoneNormalizedForLog,
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

  const transitionToConfirmed =
    newStatus === "confirmed" && prevStatus !== "confirmed";

  if (transitionToConfirmed) {
    if (context.actor !== "admin-api") {
      console.log(`${LOG} skipping official confirmation — not admin flow`, {
        appointmentId,
        previousStatus: prevStatus,
        newStatus,
        actor: context.actor,
        normalizedDestinationPhone: phoneNormalizedForLog,
        note: "APPOINTMENT_CONFIRMED only when admin-api sets مؤكد",
      });
    } else {
      console.log(`${LOG} admin transition → CONFIRMED — sending official confirmation`, {
        appointmentId,
        previousStatus: prevStatus,
        newStatus,
        destinationPhoneRaw: appointment.phone,
        destinationPhoneNormalized: phoneNormalizedForLog,
      });
      try {
        const notifyResult = await sendOfficialConfirmationByAdmin(deliveryBase);
        if (!notifyResult.success) {
          console.error(`${LOG} official confirmation send FAILED`, {
            appointmentId,
            previousStatus: prevStatus,
            newStatus,
            normalizedDestinationPhone: phoneNormalizedForLog,
            channel: notifyResult.channel,
            error: notifyResult.error,
          });
        } else {
          console.log(`${LOG} official confirmation send SUCCESS`, {
            appointmentId,
            previousStatus: prevStatus,
            newStatus,
            normalizedDestinationPhone: phoneNormalizedForLog,
            channel: notifyResult.channel,
            twilioMessageSid: notifyResult.twilioMessageSid,
          });
        }
      } catch (e) {
        console.error(`${LOG} official confirmation threw`, {
          appointmentId,
          normalizedDestinationPhone: phoneNormalizedForLog,
          err: e,
        });
      }
    }
  } else {
    console.log(`${LOG} no APPOINTMENT_CONFIRMED (not first transition to confirmed)`, {
      appointmentId,
      previousStatus: prevStatus,
      newStatus,
      reason: "Either newStatus is not confirmed, or previous was already confirmed (handled earlier if same status)",
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
