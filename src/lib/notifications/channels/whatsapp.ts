/**
 * WhatsApp channel - Twilio WhatsApp API
 * https://www.twilio.com/docs/whatsapp
 */

import twilio from "twilio";
import type { SendResult } from "../types";

const LOG = "[salon-notify][whatsapp]";

const SANDBOX_FROM_SUBSTR = "14155238886";

/** Twilio `to` / `from` must look like whatsapp:+<E.164> */
export function formatTwilioWhatsAppAddress(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("whatsapp:")) {
    const rest = t.slice("whatsapp:".length).trim();
    const digits = rest.replace(/\D/g, "");
    if (!digits) return t;
    return `whatsapp:+${digits}`;
  }
  const digits = t.replace(/\D/g, "");
  if (!digits) return `whatsapp:${t}`;
  return `whatsapp:+${digits}`;
}

function logSandboxGuidance(code: number | undefined, message: string): void {
  const m = message.toLowerCase();
  const looksLikeSandbox =
    code === 63007 ||
    code === 63016 ||
    code === 63018 ||
    code === 21211 ||
    m.includes("sandbox") ||
    m.includes("join ") ||
    m.includes("not a valid whatsapp") ||
    m.includes("unsubscribed");

  if (!looksLikeSandbox) return;

  console.warn(`${LOG} SANDBOX / opt-in hint: If using Twilio WhatsApp Sandbox, the customer must reply with your sandbox join phrase to +1 415 523 8886 (or your console keyword) before they receive messages. Production requires an approved WhatsApp Business sender.`, {
    twilioCode: code,
  });
}

export async function sendWhatsApp(
  phone: string,
  body: string
): Promise<SendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappFrom) {
    const err = "WhatsApp not configured (missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_NUMBER)";
    console.error(`${LOG} ${err}`);
    return { success: false, error: err };
  }

  const from = formatTwilioWhatsAppAddress(whatsappFrom);
  const to = formatTwilioWhatsAppAddress(phone);

  if (from.includes(SANDBOX_FROM_SUBSTR)) {
    console.log(`${LOG} using Twilio Sandbox-style sender — recipients must have joined the sandbox unless you use a production WhatsApp sender`, {
      fromTwilio: from,
    });
  }

  console.log(`${LOG} Twilio send started`, {
    fromTwilio: from,
    toTwilio: to,
    e164Target: phone,
  });

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body,
      from,
      to,
    });

    console.log(`${LOG} Twilio API success`, {
      twilioMessageSid: message.sid,
      status: message.status,
      channel: "whatsapp",
    });

    return { success: true, twilioMessageSid: message.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const rest = err as {
      code?: number;
      status?: number;
      moreInfo?: string;
      details?: unknown;
    };
    console.error(`${LOG} Twilio send failed`, {
      message: msg,
      twilioCode: rest.code,
      httpStatus: rest.status,
      moreInfo: rest.moreInfo,
      details: rest.details,
      fromTwilio: from,
      toTwilio: to,
    });
    logSandboxGuidance(rest.code, msg);
    return { success: false, error: msg };
  }
}
