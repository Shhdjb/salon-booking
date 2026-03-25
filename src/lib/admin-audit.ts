import { prisma } from "@/lib/db";
import { clientIpFromHeaders } from "@/lib/rate-limit";

export async function logAdminAction(
  input: {
    action: string;
    entity?: string;
    entityId?: string;
    adminUserId: string;
    details?: unknown;
  },
  req?: Request
): Promise<void> {
  try {
    const ip = req ? clientIpFromHeaders(req.headers) : null;
    await prisma.activityLog.create({
      data: {
        action: input.action,
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
        userId: input.adminUserId,
        details: input.details !== undefined ? JSON.stringify(input.details) : null,
        ip,
      },
    });
  } catch (e) {
    console.error("[admin-audit] failed to write log", e);
  }
}
