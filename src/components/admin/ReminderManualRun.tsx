"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  adminApiErrorMessage,
  parseAdminApiJson,
  ADMIN_ACTION_DISABLED_TITLE,
} from "@/lib/admin-api-errors";

/**
 * Hobby / no-cron: same logic as the scheduled reminder job (24h window, idempotent).
 */
export function ReminderManualRun() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locked =
    status === "loading" ||
    status === "unauthenticated" ||
    session?.user?.role !== "ADMIN";

  const run = async () => {
    if (locked) {
      setError(ADMIN_ACTION_DISABLED_TITLE);
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/appointment-reminders/run", {
        method: "POST",
        credentials: "include",
      });
      const data = await parseAdminApiJson(res);
      if (!res.ok) {
        setError(adminApiErrorMessage(res, data));
        return;
      }
      const parts = [
        `تم الفحص: ${data.scanned ?? 0}`,
        `أُرسل: ${data.sent ?? 0}`,
        `تخطّي/فشل: ${data.skipped ?? 0}`,
      ];
      setMessage(parts.join(" · "));
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mb-8 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 text-right font-body"
      dir="rtl"
    >
      <h2 className="font-display text-lg font-bold text-[#4A3F35]">
        تذكيرات المواعيد (تشغيل يدوي)
      </h2>
      <p className="mt-2 text-sm text-[#6B5D52] leading-relaxed">
        على خطة Vercel Hobby لا تتوفر Cron مجدولة من{" "}
        <code className="rounded bg-white/80 px-1 text-xs">vercel.json</code>. يمكنكِ
        الضغط هنا لتشغيل نفس مهمة التذكير (~24 ساعة قبل الموعد المؤكد). آمن للتكرار:
        المواعيد التي أُرسل لها تذكير لا تُعاد.
      </p>
      <p className="mt-2 text-xs text-[#8B7355]">
        بديل خارجي:{" "}
        <code className="rounded bg-white/80 px-1">GET /api/cron/appointment-reminders</code> مع{" "}
        <code className="rounded bg-white/80 px-1">Authorization: Bearer CRON_SECRET</code>
      </p>
      <button
        type="button"
        disabled={locked || loading}
        title={locked ? ADMIN_ACTION_DISABLED_TITLE : undefined}
        onClick={run}
        className="mt-4 rounded-xl bg-[#C9A882] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#B8956F] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "جاري التشغيل…" : "تشغيل فحص التذكيرات الآن"}
      </button>
      {message && (
        <p className="mt-3 text-sm text-green-800" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
