import { NextResponse } from "next/server";
import { processAppointmentReminders } from "@/lib/notifications/customer-delivery";
import { jsonUnauthorized, jsonInternal } from "@/lib/api-response";

/**
 * Production: Vercel Cron hits this hourly (see vercel.json). Vercel sends `x-vercel-cron: 1`.
 * External schedulers: GET with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const vercelCron = req.headers.get("x-vercel-cron");

  const bearerOk = Boolean(secret && authHeader === `Bearer ${secret}`);
  const vercelOk = process.env.VERCEL === "1" && vercelCron === "1";

  if (!bearerOk && !vercelOk) {
    return jsonUnauthorized("غير مصرح بتنفيذ مهمة التذكير المجدولة");
  }

  if (!secret && !vercelOk) {
    console.error(
      "[salon-notify][cron] CRON_SECRET is not set (optional when using Vercel cron header only)"
    );
  }

  try {
    const result = await processAppointmentReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[salon-notify][cron] reminder job failed", e);
    return jsonInternal("فشلت مهمة التذكير", e);
  }
}
