/**
 * WhatsApp channel - Twilio WhatsApp API
 * https://www.twilio.com/docs/whatsapp
 */

import twilio from "twilio";
import type { SendResult } from "../types";

const LOG = "[salon-notify][whatsapp]";

export async function sendWhatsApp(
  phone: string,
  body: string
): Promise<SendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappFrom) {
    console.warn(
      `${LOG} Twilio WhatsApp not configured (missing SID, token, or TWILIO_WHATSAPP_NUMBER)`
    );
    return { success: false, error: "WhatsApp not configured" };
  }

  const fromRaw = whatsappFrom;
  const from = whatsappFrom.startsWith("whatsapp:")
    ? whatsappFrom
    : `whatsapp:${whatsappFrom}`;
  const to = phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;

  console.log(`${LOG} Twilio send started`, {
    fromEnv: fromRaw,
    fromTwilio: from,
    toTwilio: to,
    normalizedE164Input: phone,
  });

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body,
      from,
      to,
    });

    console.log(`${LOG} Twilio send success`, {
      twilioMessageSid: message.sid,
      status: message.status,
    });

    return { success: true, twilioMessageSid: message.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${LOG} Twilio send failed`, {
      error: msg,
      fromTwilio: from,
      toTwilio: to,
    });
    return { success: false, error: msg };
  }
}
