/**
 * Customer-facing notifications: official confirmation (admin only), reminders, status, loyalty.
 */

import { addHours, parse } from "date-fns";
import { prisma } from "@/lib/db";
import type { NotificationChannel, NotificationType } from "@prisma/client";
import type { SendResult } from "./types";
import { sendNotification } from "./index";
import { resolveOutboundChannel } from "./channel-resolution";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";
import { logNotificationSkipped } from "./notification-audit";
import { getMessageForType } from "./messages";
import { toIsraeliMobileE164 } from "@/lib/phone-utils";

const LOG = "[salon-notify][delivery]";

type DeliveryBase = {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  userId?: string;
  appointmentId?: string;
  phone?: string | null;
  email?: string | null;
  phoneNotificationsEnabled: boolean;
  preferredChannel: NotificationChannel | null | undefined;
  extra?: string;
};

async function deliver(
  type: NotificationType,
  base: DeliveryBase,
  purpose: string,
  opts?: { bypassMarketingConsent?: boolean }
): Promise<SendResult> {
  const phone = base.phone?.trim() || undefined;
  const email = base.email?.trim() || undefined;
  const bypassConsent = opts?.bypassMarketingConsent ?? false;
  const consentForSend = bypassConsent || base.phoneNotificationsEnabled;

  const resolved = resolveOutboundChannel({
    phoneNotificationsEnabled: base.phoneNotificationsEnabled,
    preferredChannel: base.preferredChannel,
    appointmentPhone: phone,
    email,
    bypassMarketingConsent: bypassConsent,
  });

  if (!resolved.channel) {
    const msg = getMessageForType(type, {
      customerName: base.customerName,
      serviceName: base.serviceName,
      date: base.date,
      time: base.time,
      extra: base.extra,
    });
    const auditChannel = base.preferredChannel ?? "WHATSAPP";
    const phoneE164Audit = phone ? toIsraeliMobileE164(phone) : null;
    const dest = phoneE164Audit ?? email?.trim() ?? phone?.trim() ?? null;
    await logNotificationSkipped({
      userId: base.userId ?? null,
      appointmentId: base.appointmentId ?? null,
      type,
      channel: auditChannel,
      title: msg.title,
      body: msg.smsBody,
      destination: dest,
      failureReason: resolved.reason,
    });
    console.log(`${LOG} skip: ${purpose}`, {
      appointmentId: base.appointmentId,
      type,
      reason: resolved.reason,
    });
    return { success: false, error: resolved.reason };
  }

  console.log(`${LOG} ${purpose}: channel chosen`, {
    appointmentId: base.appointmentId,
    type,
    channel: resolved.channel,
    reason: resolved.reason,
  });

  if (resolved.usePhoneChannel && phone) {
    const phoneForSend = phone.trim();
    const normalized = toIsraeliMobileE164(phoneForSend);
    if (!normalized) {
      const msgMismatch = getMessageForType(type, {
        customerName: base.customerName,
        serviceName: base.serviceName,
        date: base.date,
        time: base.time,
        extra: base.extra,
      });
      await logNotificationSkipped({
        userId: base.userId ?? null,
        appointmentId: base.appointmentId ?? null,
        type,
        channel: resolved.channel,
        title: msgMismatch.title,
        body: msgMismatch.smsBody,
        destination: phoneForSend,
        failureReason: "Could not normalize phone to E.164 for SMS/WhatsApp",
      });
      console.log(`${LOG} skip: ${purpose} (normalize failed)`, {
        appointmentId: base.appointmentId,
        type,
        raw: phoneForSend,
      });
      return { success: false, error: "Invalid phone for E.164", channel: resolved.channel };
    }
    console.log(`${LOG} phone outbound`, {
      appointmentId: base.appointmentId,
      type,
      raw: phoneForSend,
      normalizedE164: normalized,
    });
    return sendNotification({
      type,
      channel: resolved.channel,
      phone: normalized,
      email,
      customerName: base.customerName,
      serviceName: base.serviceName,
      date: base.date,
      time: base.time,
      extra: base.extra,
      userId: base.userId,
      appointmentId: base.appointmentId,
      phoneNotificationsEnabled: consentForSend,
    });
  }

  if (resolved.channel === "EMAIL" && email) {
    return sendNotification({
      type,
      channel: "EMAIL",
      email,
      customerName: base.customerName,
      serviceName: base.serviceName,
      date: base.date,
      time: base.time,
      extra: base.extra,
      userId: base.userId,
      appointmentId: base.appointmentId,
      phoneNotificationsEnabled: consentForSend,
    });
  }

  const msgMismatch = getMessageForType(type, {
    customerName: base.customerName,
    serviceName: base.serviceName,
    date: base.date,
    time: base.time,
    extra: base.extra,
  });
  const mismatchE164 = phone ? toIsraeliMobileE164(phone) : null;
  const destMismatch = mismatchE164 ?? email?.trim() ?? phone?.trim() ?? null;
  await logNotificationSkipped({
    userId: base.userId ?? null,
    appointmentId: base.appointmentId ?? null,
    type,
    channel: resolved.channel,
    title: msgMismatch.title,
    body: msgMismatch.smsBody,
    destination: destMismatch,
    failureReason: "Delivery mismatch after channel resolution",
  });
  console.log(`${LOG} skip: ${purpose} (resolved channel mismatch)`, {
    channel: resolved.channel,
    usePhone: resolved.usePhoneChannel,
  });
  return { success: false, error: "Delivery mismatch" };
}

export async function sendOfficialConfirmationByAdmin(base: DeliveryBase): Promise<SendResult> {
  return deliver("APPOINTMENT_CONFIRMED", base, "official confirmation (admin مؤكد)", {
    bypassMarketingConsent: true,
  });
}

export async function sendAppointmentCancelledNotice(base: DeliveryBase): Promise<SendResult> {
  return deliver("APPOINTMENT_CANCELLED", base, "appointment cancelled");
}

export async function sendAppointmentCompletedNotice(base: DeliveryBase): Promise<SendResult> {
  return deliver("APPOINTMENT_COMPLETED", base, "appointment completed");
}

export async function sendLoyaltyRewardUnlocked(
  base: DeliveryBase,
  discountPercent: number,
  completedCount: number
): Promise<SendResult> {
  const extra = `تهانينا! وصلتِ إلى ${completedCount} زيارات مكتملة — خصمكِ الحالي ${discountPercent}% على الزيارة القادمة.`;
  return deliver(
    "LOYALTY_REWARD_UNLOCKED",
    { ...base, extra },
    `loyalty tier unlocked (${discountPercent}%)`
  );
}

/**
 * Send reminders for confirmed appointments starting in ~24 hours (23–25h window).
 * Idempotent per appointment via `reminderSentAt` (and notification dedup).
 */
export async function processAppointmentReminders(): Promise<{
  scanned: number;
  sent: number;
  skipped: number;
  details: string[];
}> {
  const LOG_REM = "[salon-notify][reminder-cron]";
  const now = new Date();
  const windowStart = addHours(now, 23);
  const windowEnd = addHours(now, 25);

  const appointments = await prisma.appointment.findMany({
    where: { status: "confirmed", reminderSentAt: null },
    include: {
      user: true,
      service: true,
      lines: { orderBy: { sortOrder: "asc" }, include: { service: true } },
    },
  });

  let sent = 0;
  let skipped = 0;
  let inWindow = 0;
  const details: string[] = [];

  for (const apt of appointments) {
    const start = parse(
      `${apt.date} ${apt.startTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    if (start < windowStart || start > windowEnd) {
      continue;
    }
    inWindow++;

    const u = apt.user;
    const email = apt.email?.trim() || u?.email?.trim() || undefined;
    const base: DeliveryBase = {
      customerName: apt.customerName,
      serviceName: formatAppointmentServiceNames(apt),
      date: apt.date,
      time: apt.startTime,
      userId: apt.userId ?? undefined,
      appointmentId: apt.id,
      phone: apt.phone,
      email,
      phoneNotificationsEnabled: u?.phoneNotificationsEnabled ?? false,
      preferredChannel: u?.preferredNotificationChannel ?? "WHATSAPP",
    };

    console.log(`${LOG_REM} sending reminder`, {
      appointmentId: apt.id,
      at: start.toISOString(),
    });

    const result = await deliver(
      "APPOINTMENT_REMINDER",
      base,
      "24h reminder"
    );
    if (result.success) {
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
      details.push(`sent:${apt.id}`);
    } else {
      skipped++;
      details.push(`fail:${apt.id}:${result.error}`);
      console.log(`${LOG_REM} reminder not delivered`, {
        appointmentId: apt.id,
        error: result.error,
      });
    }
  }

  console.log(`${LOG_REM} run complete`, {
    confirmedAppointmentsTotal: appointments.length,
    inReminderWindow: inWindow,
    sent,
    skipped,
    window: { start: windowStart.toISOString(), end: windowEnd.toISOString() },
  });

  return { scanned: inWindow, sent, skipped, details };
}
