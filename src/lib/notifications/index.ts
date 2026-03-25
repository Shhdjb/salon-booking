/**
 * Notification service for SALON SHAHD
 * Phone-first: SMS / WhatsApp. Email as fallback.
 * Every send or skip is persisted when possible for admin audit.
 */

import { prisma } from "@/lib/db";
import { toIsraeliMobileE164 } from "@/lib/phone-utils";
import type { NotificationChannel, NotificationType } from "@prisma/client";
import type { NotificationPayload, SendResult } from "./types";
import { sendSMS } from "./channels/sms";
import { sendWhatsApp } from "./channels/whatsapp";
import { sendEmail } from "./channels/email";
import { getMessageForType } from "./messages";
import { logNotificationSkipped } from "./notification-audit";

const DEDUP_WINDOW_MS = 60 * 60 * 1000;
const LOG = "[salon-notify]";

function destinationForPayload(
  channel: NotificationChannel,
  phone?: string,
  email?: string
): string | null {
  if (channel === "SMS" || channel === "WHATSAPP") {
    const p = phone?.trim();
    if (!p) return null;
    const e164 = toIsraeliMobileE164(p);
    return e164 ?? p;
  }
  return email?.trim() || null;
}

async function wasRecentlySent(
  userId: string | undefined,
  appointmentId: string | undefined,
  type: NotificationType
): Promise<boolean> {
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const existing = await prisma.notification.findFirst({
    where: {
      userId: userId || null,
      appointmentId: appointmentId || null,
      type,
      status: "sent",
      sentAt: { gte: since },
    },
  });
  return !!existing;
}

async function createNotificationRecord(
  payload: NotificationPayload,
  status: "pending" | "sent" | "failed",
  opts?: { destination?: string | null; failureReason?: string | null; sentAt?: Date | null; providerMessageId?: string | null }
): Promise<string> {
  const dest =
    opts?.destination ??
    destinationForPayload(payload.channel, payload.phone, payload.email);
  const n = await prisma.notification.create({
    data: {
      userId: payload.userId || null,
      appointmentId: payload.appointmentId || null,
      type: payload.type,
      channel: payload.channel,
      title: payload.title || null,
      body: payload.body,
      destination: dest,
      status,
      sentAt: opts?.sentAt ?? (status === "sent" ? new Date() : null),
      failureReason: opts?.failureReason ?? null,
      providerMessageId: opts?.providerMessageId ?? null,
    },
  });
  return n.id;
}

async function markNotificationSent(
  id: string,
  providerMessageId?: string | null
): Promise<void> {
  await prisma.notification.update({
    where: { id },
    data: {
      status: "sent",
      sentAt: new Date(),
      ...(providerMessageId ? { providerMessageId } : {}),
    },
  });
}

async function markNotificationFailed(id: string, errMsg: string): Promise<void> {
  const failureReason = errMsg.slice(0, 500);
  await prisma.notification.update({
    where: { id },
    data: { status: "failed", failureReason },
  });
  console.error(`[notifications] Failed ${id}:`, errMsg);
}

export interface SendNotificationOptions {
  type: NotificationType;
  channel: NotificationChannel;
  phone?: string;
  email?: string;
  customerName?: string;
  serviceName?: string;
  date?: string;
  time?: string;
  extra?: string;
  userId?: string;
  appointmentId?: string;
  phoneNotificationsEnabled?: boolean;
}

export async function sendNotification(
  options: SendNotificationOptions
): Promise<SendResult> {
  const {
    type,
    channel,
    phone,
    email,
    customerName,
    serviceName,
    date,
    time,
    extra,
    userId,
    appointmentId,
    phoneNotificationsEnabled = false,
  } = options;

  const msg = getMessageForType(type, {
    customerName,
    serviceName,
    date,
    time,
    extra,
  });
  const body = channel === "EMAIL" ? msg.body : msg.smsBody;

  /** Set after SMS/WhatsApp validation — always E.164 for Twilio. */
  let phoneE164ForSend: string | undefined;

  if (channel === "SMS" || channel === "WHATSAPP") {
    if (!phoneNotificationsEnabled) {
      await logNotificationSkipped({
        userId: userId ?? null,
        appointmentId: appointmentId ?? null,
        type,
        channel,
        title: msg.title,
        body,
        destination: phone?.trim() ? destinationForPayload(channel, phone, undefined) : null,
        failureReason: "No consent (phoneNotificationsEnabled)",
      });
      console.log(`${LOG} skip (phone channel blocked by consent)`, {
        type,
        channel,
        appointmentId,
      });
      return { success: false, error: "No consent", channel };
    }
    const parsedE164 = phone?.trim() ? toIsraeliMobileE164(phone.trim()) : null;
    if (!phone?.trim() || !parsedE164) {
      await logNotificationSkipped({
        userId: userId ?? null,
        appointmentId: appointmentId ?? null,
        type,
        channel,
        title: msg.title,
        body,
        destination: phone?.trim() || null,
        failureReason: "Invalid or empty phone for SMS/WhatsApp (E.164)",
      });
      console.log(`${LOG} skip (invalid phone for SMS/WhatsApp)`, {
        type,
        channel,
        appointmentId,
        phoneRaw: phone?.trim() ?? null,
        phoneNormalizedE164: parsedE164,
      });
      return { success: false, error: "Invalid phone", channel };
    }
    phoneE164ForSend = parsedE164;
  } else if (channel === "EMAIL") {
    if (!phoneNotificationsEnabled) {
      await logNotificationSkipped({
        userId: userId ?? null,
        appointmentId: appointmentId ?? null,
        type,
        channel,
        title: msg.title,
        body,
        destination: email?.trim() || null,
        failureReason: "No consent for email notifications",
      });
      console.log(`${LOG} skip (email blocked by consent)`, { type, appointmentId });
      return { success: false, error: "No consent", channel };
    }
    if (!email || !email.includes("@")) {
      await logNotificationSkipped({
        userId: userId ?? null,
        appointmentId: appointmentId ?? null,
        type,
        channel,
        title: msg.title,
        body,
        destination: email?.trim() || null,
        failureReason: "Invalid email",
      });
      console.log(`${LOG} skip (invalid email)`, { type, appointmentId });
      return { success: false, error: "Invalid email", channel };
    }
  }

  const duplicate = await wasRecentlySent(userId, appointmentId, type);
  if (duplicate) {
    await logNotificationSkipped({
      userId: userId ?? null,
      appointmentId: appointmentId ?? null,
      type,
      channel,
      title: msg.title,
      body,
      destination: destinationForPayload(channel, phone, email),
      failureReason: `Duplicate ${type} within ${DEDUP_WINDOW_MS / 60000}min window`,
    });
    console.log(`${LOG} skip (duplicate notification within window)`, {
      type,
      appointmentId,
      channel,
      phoneRaw: phone?.trim() ?? null,
      phoneNormalizedE164:
        phone?.trim() && (channel === "SMS" || channel === "WHATSAPP")
          ? toIsraeliMobileE164(phone.trim())
          : null,
    });
    if (type === "APPOINTMENT_CONFIRMED") {
      console.log(`${LOG} confirm-flow dedup`, {
        appointmentId,
        channel,
        previousStatusHint: "dedup_window_blocks_second_send",
      });
    }
    return { success: false, error: "Duplicate notification", channel };
  }

  const payload: NotificationPayload = {
    userId,
    appointmentId,
    type,
    channel,
    title: msg.title,
    body,
    phone: phoneE164ForSend ?? phone,
    email,
  };

  const notificationId = await createNotificationRecord(payload, "pending");

  let result: SendResult;

  if (channel === "SMS" && phoneE164ForSend) {
    console.log(`${LOG} SMS path`, {
      type,
      appointmentId,
      phoneRaw: phone?.trim() ?? null,
      destinationPhoneNormalized: phoneE164ForSend,
    });
    result = await sendSMS(phoneE164ForSend, body);
  } else if (channel === "WHATSAPP" && phoneE164ForSend) {
    console.log(`${LOG} WhatsApp path`, {
      type,
      appointmentId,
      phoneRaw: phone?.trim() ?? null,
      destinationPhoneNormalized: phoneE164ForSend,
    });
    result = await sendWhatsApp(phoneE164ForSend, body);
  } else if (channel === "EMAIL" && email) {
    const html = `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 500px;">
        <h2 style="color: #4A3F35;">${msg.title}</h2>
        <p>${msg.body.replace(/\n/g, "</p><p>")}</p>
        <p style="color: #6B5D52; font-size: 14px;">صالون شهد</p>
      </div>
    `;
    result = await sendEmail(email, msg.title, html);
  } else {
    await markNotificationFailed(notificationId, "Missing recipient");
    return { success: false, error: "Missing recipient", channel };
  }

  if (result.success) {
    await markNotificationSent(notificationId, result.twilioMessageSid ?? null);
    console.log(`${LOG} notification sent OK`, { channel, type, appointmentId });
    if (type === "APPOINTMENT_CONFIRMED") {
      console.log("[admin-e2e-verify] APPOINTMENT_CONFIRMED sent once (dedup blocks duplicate within 60min)", {
        appointmentId: appointmentId ?? null,
        channel,
        notificationId,
        twilioMessageSid: result.twilioMessageSid ?? null,
      });
    }
    return {
      success: true,
      notificationId,
      channel,
      twilioMessageSid: result.twilioMessageSid,
    };
  } else {
    await markNotificationFailed(notificationId, result.error || "Unknown");
    if (type === "APPOINTMENT_CONFIRMED") {
      console.error("[admin-e2e-verify] APPOINTMENT_CONFIRMED provider send FAILED", {
        appointmentId: appointmentId ?? null,
        channel,
        notificationId,
        error: result.error,
      });
    }
    return { success: false, error: result.error, channel };
  }
}
