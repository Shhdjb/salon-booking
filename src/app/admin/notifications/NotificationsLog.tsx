"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Row = {
  id: string;
  type: string;
  channel: string;
  status: string;
  destination: string | null;
  title: string | null;
  body: string | null;
  failureReason: string | null;
  providerMessageId: string | null;
  sentAt: string | null;
  createdAt: string;
  appointmentId: string | null;
  userId: string | null;
  user: { name: string; email: string | null; phone: string | null } | null;
  appointment: {
    id: string;
    date: string;
    startTime: string;
    customerName: string;
  } | null;
};

export function NotificationsLog() {
  const sp = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const appointmentId = sp.get("appointmentId") || "";
  const userId = sp.get("userId") || "";
  const status = sp.get("status") || "";

  useEffect(() => {
    const q = new URLSearchParams();
    if (appointmentId) q.set("appointmentId", appointmentId);
    if (userId) q.set("userId", userId);
    if (status) q.set("status", status);
    q.set("limit", "100");
    setLoading(true);
    fetch(`/api/admin/notifications?${q}`)
      .then((r) => r.json())
      .then((d) => setRows(d.notifications || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [appointmentId, userId, status]);

  return (
    <div className="space-y-6">
      <form
        method="get"
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-[#E8DDD4]/80 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-right font-body text-xs text-[#6B5D52]">
            معرّف الحجز
          </label>
          <input
            name="appointmentId"
            defaultValue={appointmentId}
            className="w-full min-w-[200px] rounded-xl border-2 border-[#E8DDD4] px-3 py-2 font-body text-sm"
            placeholder="cuid..."
          />
        </div>
        <div>
          <label className="mb-1 block text-right font-body text-xs text-[#6B5D52]">
            معرّف العميلة
          </label>
          <input
            name="userId"
            defaultValue={userId}
            className="w-full min-w-[200px] rounded-xl border-2 border-[#E8DDD4] px-3 py-2 font-body text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-right font-body text-xs text-[#6B5D52]">
            الحالة
          </label>
          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border-2 border-[#E8DDD4] px-3 py-2 font-body text-sm"
          >
            <option value="">الكل</option>
            <option value="pending">pending</option>
            <option value="sent">sent</option>
            <option value="failed">failed</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[#C9A882] px-6 py-2 font-body text-sm font-medium text-white"
        >
          تصفية
        </button>
      </form>

      {loading ? (
        <p className="font-body text-[#6B5D52]">جاري التحميل...</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-[#6B5D52]">لا توجد سجلات.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E8DDD4]/80 bg-white shadow-lg">
          <table className="w-full min-w-[1000px] text-right font-body text-xs">
            <thead className="bg-[#F8F4EF] text-[#6B5D52]">
              <tr>
                <th className="px-3 py-2">الوقت</th>
                <th className="px-3 py-2">النوع</th>
                <th className="px-3 py-2">القناة</th>
                <th className="px-3 py-2">الوجهة</th>
                <th className="px-3 py-2">الحالة</th>
                <th className="px-3 py-2">العنوان</th>
                <th className="px-3 py-2">سبب الفشل</th>
                <th className="px-3 py-2">مرجع المزوّد</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr key={n.id} className="border-t border-[#E8DDD4]/60 align-top">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleString("ar")}
                  </td>
                  <td className="px-3 py-2">{n.type}</td>
                  <td className="px-3 py-2">{n.channel}</td>
                  <td className="px-3 py-2 max-w-[140px] break-all">{n.destination || "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        n.status === "sent"
                          ? "text-green-700"
                          : n.status === "failed"
                            ? "text-red-600"
                            : "text-amber-700"
                      }
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-[160px] truncate" title={n.title || ""}>
                    {n.title || "—"}
                  </td>
                  <td className="px-3 py-2 max-w-[200px] text-red-700" title={n.failureReason || ""}>
                    {n.failureReason || "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] break-all">
                    {n.providerMessageId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
