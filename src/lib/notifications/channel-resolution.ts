/**
 * Outbound channel: WhatsApp only for phone (no SMS).
 * Email is used only as fallback when WhatsApp cannot be used (missing Twilio config or invalid phone).
 */

import type { NotificationChannel } from "@prisma/client";
import { toIsraeliMobileE164 } from "@/lib/phone-utils";
import { isValidEmail } from "@/lib/email-utils";

const LOG = "[salon-notify][channel]";

export type ResolvedOutbound =
  | {
      channel: NotificationChannel;
      reason: string;
      usePhoneChannel: boolean;
    }
  | { channel: null; reason: string; usePhoneChannel: false };

function hasTwilioWhatsApp(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_WHATSAPP_NUMBER?.trim()
  );
}

export function resolveOutboundChannel(input: {
  phoneNotificationsEnabled: boolean;
  preferredChannel: NotificationChannel | null | undefined;
  appointmentPhone: string | null | undefined;
  email: string | null | undefined;
  bypassMarketingConsent?: boolean;
}): ResolvedOutbound {
  const {
    phoneNotificationsEnabled,
    preferredChannel,
    appointmentPhone,
    email,
    bypassMarketingConsent = false,
  } = input;

  console.log(`${LOG} resolving`, {
    bypassMarketingConsent,
    phoneNotificationsEnabled,
    preferredChannel: preferredChannel ?? null,
  });

  const consentOk = phoneNotificationsEnabled || bypassMarketingConsent;
  if (!consentOk) {
    console.log(`${LOG} skipped — phone notification consent off (set phoneNotificationsEnabled or use transactional bypass)`);
    return {
      channel: null,
      reason:
        "phoneNotificationsEnabled is false — enable notifications or use admin transactional send",
      usePhoneChannel: false,
    };
  }

  const trimmedPhone = appointmentPhone?.trim() ?? "";
  const phoneE164 = trimmedPhone ? toIsraeliMobileE164(trimmedPhone) : null;
  const phoneOk = Boolean(phoneE164);
  const hasWa = hasTwilioWhatsApp();

  if (consentOk && phoneOk && hasWa) {
    return {
      channel: "WHATSAPP",
      reason: "WhatsApp — valid E.164 + Twilio WhatsApp configured",
      usePhoneChannel: true,
    };
  }

  if (consentOk && phoneOk && !hasWa) {
    console.error(
      `${LOG} WhatsApp unavailable — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER (e.g. whatsapp:+14155238886)`,
      { rawPhone: trimmedPhone }
    );
  } else if (consentOk && !phoneOk) {
    console.log(`${LOG} phone channel skipped — invalid or empty phone (need Israeli mobile E.164)`, {
      raw: appointmentPhone ?? null,
    });
  }

  const em = email?.trim() ?? "";
  if (isValidEmail(em)) {
    if (consentOk && phoneOk && !hasWa) {
      console.warn(`${LOG} falling back to EMAIL — WhatsApp/Twilio not configured`, {
        destinationHint: "email",
      });
    } else if (consentOk && !phoneOk) {
      console.warn(`${LOG} using EMAIL — no valid phone for WhatsApp`, {});
    }
    return {
      channel: "EMAIL",
      reason: phoneOk && !hasWa
        ? "email fallback — Twilio WhatsApp not configured"
        : "email — no valid phone for WhatsApp",
      usePhoneChannel: false,
    };
  }

  const reason = !hasWa
    ? "no channel: Twilio WhatsApp not configured and email missing/invalid"
    : !phoneOk
      ? "no channel: invalid phone and email missing/invalid"
      : "no channel: consent or configuration";

  console.error(`${LOG} no outbound channel`, { reason, hasTwilioWhatsApp: hasWa, phoneOk });
  return {
    channel: null,
    reason,
    usePhoneChannel: false,
  };
}
