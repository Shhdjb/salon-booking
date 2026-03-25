/**
 * Email channel - Nodemailer
 */

import nodemailer from "nodemailer";
import type { SendResult } from "../types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

const SALON_NAME = "صالون شهد";

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<SendResult> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[notifications] SMTP not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  try {
    await transporter.sendMail({
      from: `"${SALON_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlBody,
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[salon-notify][email] send failed", { to, error: msg });
    return { success: false, error: msg };
  }
}
