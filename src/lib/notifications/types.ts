/**
 * Notification types for SALON SHAHD
 * موعد / زيارة / حجز - appointment / visit / booking
 */

import type { NotificationChannel, NotificationType } from "@prisma/client";

export type { NotificationChannel, NotificationType };

export interface NotificationPayload {
  userId?: string;
  appointmentId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  phone?: string;
  email?: string;
  title?: string;
  body: string;
  metadata?: Record<string, string>;
}

export interface SendResult {
  success: boolean;
  notificationId?: string;
  error?: string;
  /** Channel used or attempted (for UI messaging). */
  channel?: NotificationChannel;
  /** Twilio Message SID when WhatsApp/SMS send succeeds. */
  twilioMessageSid?: string;
}
