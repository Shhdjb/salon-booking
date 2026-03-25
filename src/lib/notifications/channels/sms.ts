/**
 * SMS via Twilio (TWILIO_PHONE_NUMBER = E.164 sender)
 */

import twilio from "twilio";
import type { SendResult } from "../types";

const LOG = "[salon-notify][sms]";

export async function sendSMS(phone: string, body: string): Promise<SendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn(`${LOG} Twilio SMS not configured`);
    return { success: false, error: "SMS not configured" };
  }

  console.log(`${LOG} Twilio SMS send started`, {
    from,
    to: phone,
  });

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body,
      from,
      to: phone,
    });
    console.log(`${LOG} Twilio SMS success`, { sid: message.sid });
    return { success: true, twilioMessageSid: message.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${LOG} Twilio SMS failed`, { error: msg, to: phone });
    return { success: false, error: msg };
  }
}
