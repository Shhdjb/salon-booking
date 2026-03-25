import { z } from "zod";
import { auth } from "@/auth";
import { rescheduleCustomerAppointment } from "@/lib/reschedule-appointment";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import {
  jsonUnauthorized,
  jsonTooManyRequests,
  jsonValidationError,
  jsonError,
  parseJsonBody,
} from "@/lib/api-response";
import { NextResponse } from "next/server";

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 15;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonUnauthorized("يجب تسجيل الدخول");
  }

  const ip = clientIpFromHeaders(req.headers);
  const rl = await checkRateLimit(`reschedule:${ip}:${session.user.id}`, MAX_PER_WINDOW, WINDOW_MS);
  if (!rl.ok) {
    return jsonTooManyRequests(rl.retryAfterSec);
  }

  const { id } = await params;

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = bodySchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("تاريخ أو وقت غير صالح", parsed.error);
  }

  const result = await rescheduleCustomerAppointment({
    appointmentId: id,
    userId: session.user.id,
    newDate: parsed.data.date,
    newStartTime: parsed.data.startTime,
  });

  if (!result.ok) {
    return jsonError(result.error, 400);
  }

  return NextResponse.json({ success: true });
}
