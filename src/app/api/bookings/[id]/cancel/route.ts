import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  canCancelAppointment,
  updateAppointmentStatus,
} from "@/lib/appointment-utils";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import {
  jsonUnauthorized,
  jsonNotFound,
  jsonForbidden,
  jsonError,
  jsonTooManyRequests,
} from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonUnauthorized("يجب تسجيل الدخول");
  }

  const ip = clientIpFromHeaders(_req.headers);
  const rl = await checkRateLimit(`booking-cancel:${ip}:${session.user.id}`, 25, 60 * 60 * 1000);
  if (!rl.ok) {
    return jsonTooManyRequests(rl.retryAfterSec);
  }

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return jsonNotFound("الحجز غير موجود");
  }

  if (appointment.userId !== session.user.id) {
    return jsonForbidden("غير مصرح لكِ بإلغاء هذا الحجز");
  }

  if (appointment.status === "cancelled") {
    return jsonError("الحجز ملغي مسبقاً", 400);
  }

  const cancelCheck = canCancelAppointment(appointment.date, appointment.startTime);
  if (!cancelCheck.allowed) {
    return jsonError(cancelCheck.error ?? "لا يمكن الإلغاء", 400);
  }

  const result = await updateAppointmentStatus(id, "cancelled", {
    actor: "client-cancel",
  });
  if (!result.success) {
    return jsonError(result.error ?? "فشل الإلغاء", 400);
  }

  return NextResponse.json({ success: true });
}
