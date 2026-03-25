import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateAppointmentStatus } from "@/lib/appointment-utils";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import {
  jsonUnauthorized,
  jsonValidationError,
  jsonError,
  jsonTooManyRequests,
  parseJsonBody,
} from "@/lib/api-response";

const patchSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const ip = clientIpFromHeaders(req.headers);
  const rl = await checkRateLimit(
    `admin-apt-patch:${ip}:${session.user.id}`,
    200,
    60 * 60 * 1000
  );
  if (!rl.ok) {
    return jsonTooManyRequests(rl.retryAfterSec);
  }

  const { id } = await params;

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = patchSchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("حالة غير صالحة", parsed.error);
  }

  const result = await updateAppointmentStatus(id, parsed.data.status, {
    actor: "admin-api",
  });
  if (!result.success) {
    return jsonError(result.error ?? "تعذر تحديث الموعد", 400);
  }

  return NextResponse.json({
    success: true,
    ...(result.unchanged ? { unchanged: true } : {}),
    ...(result.message ? { message: result.message } : {}),
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const ip = clientIpFromHeaders(req.headers);
  const rl = await checkRateLimit(`admin-apt-del:${ip}:${session.user.id}`, 60, 60 * 60 * 1000);
  if (!rl.ok) {
    return jsonTooManyRequests(rl.retryAfterSec);
  }

  const { id } = await params;

  await prisma.appointment.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
