import { NextResponse } from "next/server";
import { z } from "zod";
import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateAppointmentStatus } from "@/lib/appointment-utils";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import {
  jsonUnauthorized,
  jsonValidationError,
  jsonError,
  jsonTooManyRequests,
  jsonInternal,
  parseJsonBody,
} from "@/lib/api-response";

const patchSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
});

const LOG = "[api][admin-appointments]";
const E2E = "[admin-e2e-verify]";

export const PATCH = auth(async (req: NextAuthRequest, context) => {
  const session = req.auth;
  const { id } = await context.params;

  console.log(`${LOG} PATCH reached`, {
    appointmentId: id,
    authenticatedUserId: session?.user?.id ?? null,
    authenticatedRole: session?.user?.role ?? null,
  });

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    console.log(`${LOG} PATCH rejected — not admin session`);
    return jsonUnauthorized("يجب تسجيل الدخول كمسؤول");
  }

  try {
    const ip = clientIpFromHeaders(req.headers);
    const rl = await checkRateLimit(
      `admin-apt-patch:${ip}:${session.user.id}`,
      200,
      60 * 60 * 1000
    );
    if (!rl.ok) {
      console.log(`${LOG} PATCH rate limited`, { appointmentId: id, userId: session.user.id });
      return jsonTooManyRequests(rl.retryAfterSec);
    }

    const raw = await parseJsonBody<unknown>(req);
    if (!raw.ok) return raw.response;

    const parsed = patchSchema.safeParse(raw.data);
    if (!parsed.success) {
      console.log(`${LOG} PATCH validation failed`, { appointmentId: id, issues: parsed.error.flatten() });
      return jsonValidationError("حالة غير صالحة", parsed.error);
    }

    const targetStatus = parsed.data.status;
    console.log(`${LOG} PATCH applying`, {
      appointmentId: id,
      targetStatus,
      userId: session.user.id,
    });

    const result = await updateAppointmentStatus(id, targetStatus, {
      actor: "admin-api",
    });

    if (!result.success) {
      console.log(`${LOG} PATCH update failed`, {
        appointmentId: id,
        targetStatus,
        error: result.error,
      });
      return jsonError(result.error ?? "تعذر تحديث الموعد", 400);
    }

    console.log(`${LOG} PATCH success`, {
      appointmentId: id,
      targetStatus,
      unchanged: Boolean(result.unchanged),
    });
    console.log(`${E2E} PATCH 200`, {
      appointmentId: id,
      targetStatus,
      unchanged: Boolean(result.unchanged),
      note:
        targetStatus === "confirmed"
          ? "WhatsApp APPOINTMENT_CONFIRMED only if DB row was pending before this PATCH (see appointment-utils logs)"
          : undefined,
    });

    return NextResponse.json({
      success: true,
      ...(result.unchanged ? { unchanged: true } : {}),
      ...(result.message ? { message: result.message } : {}),
    });
  } catch (e) {
    console.error(`${LOG} PATCH exception`, { appointmentId: id, err: e });
    return jsonInternal("حدث خطأ في الخادم، حاول مرة أخرى", { appointmentId: id, err: e });
  }
});

export const DELETE = auth(async (req: NextAuthRequest, context) => {
  const session = req.auth;
  const { id } = await context.params;

  console.log(`${LOG} DELETE reached`, {
    appointmentId: id,
    authenticatedUserId: session?.user?.id ?? null,
    authenticatedRole: session?.user?.role ?? null,
  });

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized("يجب تسجيل الدخول كمسؤول");
  }

  try {
    const ip = clientIpFromHeaders(req.headers);
    const rl = await checkRateLimit(`admin-apt-del:${ip}:${session.user.id}`, 60, 60 * 60 * 1000);
    if (!rl.ok) {
      return jsonTooManyRequests(rl.retryAfterSec);
    }

    await prisma.appointment.delete({
      where: { id },
    });

    console.log(`${LOG} DELETE success`, { appointmentId: id });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(`${LOG} DELETE exception`, { appointmentId: id, err: e });
    return jsonInternal("حدث خطأ في الخادم، حاول مرة أخرى", { appointmentId: id, err: e });
  }
});
