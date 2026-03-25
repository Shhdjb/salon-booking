import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import {
  jsonUnauthorized,
  jsonValidationError,
  jsonBadRequest,
  parseJsonBody,
} from "@/lib/api-response";

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "وقت غير صالح"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "وقت غير صالح"),
  reason: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = createSchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("بيانات غير صحيحة", parsed.error);
  }

  const { date, startTime, endTime, reason } = parsed.data;
  if (startTime >= endTime) {
    return jsonBadRequest("وقت النهاية يجب أن يكون بعد البداية");
  }

  const blocked = await prisma.blockedTime.create({
    data: {
      date,
      startTime,
      endTime,
      reason: reason?.trim() || null,
    },
  });

  await logAdminAction(
    {
      action: "blocked_time.create",
      entity: "blocked_time",
      entityId: blocked.id,
      adminUserId: session.user.id,
      details: { date, startTime, endTime },
    },
    req
  );

  return NextResponse.json({ id: blocked.id });
}
