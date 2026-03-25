/**
 * Persist notification attempts for compliance and admin inspection.
 */

import { prisma } from "@/lib/db";
import type { NotificationChannel, NotificationType } from "@prisma/client";

export async function createNotificationAuditRecord(input: {
  userId?: string | null;
  appointmentId?: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  title?: string | null;
  body: string;
  status: "pending" | "sent" | "failed";
  destination?: string | null;
  failureReason?: string | null;
  providerMessageId?: string | null;
  sentAt?: Date | null;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId ?? null,
      appointmentId: input.appointmentId ?? null,
      type: input.type,
      channel: input.channel,
      title: input.title ?? null,
      body: input.body,
      destination: input.destination ?? null,
      status: input.status,
      sentAt: input.sentAt ?? null,
      providerMessageId: input.providerMessageId ?? null,
      failureReason: input.failureReason ?? null,
    },
  });
}

/** Log a send that never reached a provider (validation, consent, routing). */
export async function logNotificationSkipped(input: {
  userId?: string | null;
  appointmentId?: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  title?: string | null;
  body: string;
  destination?: string | null;
  failureReason: string;
}) {
  return createNotificationAuditRecord({
    ...input,
    status: "failed",
    sentAt: null,
    failureReason: input.failureReason.slice(0, 500),
  });
}
