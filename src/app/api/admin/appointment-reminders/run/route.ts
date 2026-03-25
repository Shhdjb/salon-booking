import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { processAppointmentReminders } from "@/lib/notifications/customer-delivery";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { jsonUnauthorized, jsonInternal, jsonTooManyRequests } from "@/lib/api-response";

const LOG = "[api][admin-reminders-run]";

/**
 * Manual trigger for 24h appointment reminders (same logic as GET /api/cron/appointment-reminders).
 * Use on Vercel Hobby where `vercel.json` crons are not available, or ad-hoc from the admin panel.
 */
export const POST = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const ip = clientIpFromHeaders(req.headers);
  const rl = await checkRateLimit(
    `admin-reminders-run:${ip}:${session.user.id}`,
    30,
    60 * 60 * 1000
  );
  if (!rl.ok) {
    return jsonTooManyRequests(rl.retryAfterSec);
  }

  try {
    console.log(`${LOG} manual run started`, { userId: session.user.id });
    const result = await processAppointmentReminders();
    console.log(`${LOG} manual run done`, result);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error(`${LOG} failed`, e);
    return jsonInternal("فشل تشغيل التذكيرات", e);
  }
});
