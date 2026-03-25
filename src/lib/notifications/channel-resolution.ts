/**
 * Resolve outbound channel: WhatsApp → SMS fallback → Email.
 * Phone channels require opt-in + valid appointment phone + Twilio env.
 */

import type { NotificationChannel } from "@prisma/client";
import { isValidPhone } from "@/lib/phone-utils";

const LOG = "[salon-notify][channel]";

export type ResolvedOutbound =
  | {
      channel: NotificationChannel;
      reason: string;
      /** For SMS/WHATSAPP sends — must match sendNotification expectations */
      usePhoneChannel: boolean;
    }
  | { channel: null; reason: string; usePhoneChannel: false };

export function resolveOutboundChannel(input: {
  phoneNotificationsEnabled: boolean;
  preferredChannel: NotificationChannel | null | undefined;
  appointmentPhone: string | null | undefined;
  email: string | null | undefined;
}): ResolvedOutbound {
  const {
    phoneNotificationsEnabled,
    preferredChannel,
    appointmentPhone,
    email,
  } = input;

  if (!phoneNotificationsEnabled) {
    console.log(`${LOG} all channels skipped — user has not enabled notifications (consent)`);
    return {
      channel: null,
      reason: "phoneNotificationsEnabled is false — consent required for any channel",
      usePhoneChannel: false,
    };
  }

  const hasWhatsapp = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_NUMBER
  );
  const hasSms = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );

  const pref = preferredChannel ?? "WHATSAPP";
  const phoneOk =
    Boolean(appointmentPhone?.trim()) &&
    isValidPhone(appointmentPhone!.trim());

  if (phoneNotificationsEnabled && phoneOk) {
    if (pref === "WHATSAPP") {
      if (hasWhatsapp) {
        return {
          channel: "WHATSAPP",
          reason: "opt-in + preferred WHATSAPP + Twilio WhatsApp configured",
          usePhoneChannel: true,
        };
      }
      if (hasSms) {
        console.log(`${LOG} WhatsApp unavailable, falling back to SMS`, {
          preferred: pref,
        });
        return {
          channel: "SMS",
          reason:
            "opt-in + preferred WHATSAPP but TWILIO_WHATSAPP_NUMBER missing — fallback SMS",
          usePhoneChannel: true,
        };
      }
      console.log(`${LOG} skip phone: WHATSAPP preferred but no Twilio WhatsApp or SMS from number`);
    }

    if (pref === "SMS") {
      if (hasSms) {
        return {
          channel: "SMS",
          reason: "opt-in + preferred SMS + Twilio SMS number configured",
          usePhoneChannel: true,
        };
      }
      if (hasWhatsapp) {
        console.log(`${LOG} SMS number missing, falling back to WhatsApp`, {
          preferred: pref,
        });
        return {
          channel: "WHATSAPP",
          reason:
            "opt-in + preferred SMS but TWILIO_PHONE_NUMBER missing — fallback WhatsApp",
          usePhoneChannel: true,
        };
      }
      console.log(`${LOG} skip phone: SMS preferred but no Twilio SMS or WhatsApp`);
    }
  } else if (!phoneOk) {
    console.log(`${LOG} phone channels skipped (invalid or empty phone)`, {
      raw: appointmentPhone ?? null,
    });
  }

  const em = email?.trim();
  if (em && em.includes("@")) {
    return {
      channel: "EMAIL",
      reason: phoneOk
        ? "email fallback after phone channel unavailable"
        : "email — no valid phone for SMS/WhatsApp",
      usePhoneChannel: false,
    };
  }

  return {
    channel: null,
    reason:
      "no valid channel: need (opt-in + valid phone + Twilio) for WhatsApp/SMS, or a valid email",
    usePhoneChannel: false,
  };
}
