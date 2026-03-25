import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import { jsonUnauthorized, jsonValidationError, parseJsonBody } from "@/lib/api-response";

const rowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean(),
});

const bodySchema = z.array(rowSchema).min(1).max(7);

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = bodySchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("بيانات غير صحيحة", parsed.error);
  }

  for (const row of parsed.data) {
    await prisma.workingHour.upsert({
      where: { dayOfWeek: row.dayOfWeek },
      create: {
        dayOfWeek: row.dayOfWeek,
        openTime: row.openTime,
        closeTime: row.closeTime,
        isClosed: row.isClosed,
      },
      update: {
        openTime: row.openTime,
        closeTime: row.closeTime,
        isClosed: row.isClosed,
      },
    });
  }

  await logAdminAction(
    {
      action: "working_hours.update",
      entity: "working_hour",
      adminUserId: session.user.id,
      details: { days: parsed.data.length },
    },
    req
  );

  return NextResponse.json({ success: true });
}
