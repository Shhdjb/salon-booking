"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Save, Loader2, Calendar } from "lucide-react";

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  completedAppointmentsCount: number;
};

export function ClientsManager({
  initialUsers,
  initialQuery = "",
  initialArchived = false,
}: {
  initialUsers: ClientRow[];
  initialQuery?: string;
  initialArchived?: boolean;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [edits, setEdits] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialUsers.map((u) => [u.id, String(u.completedAppointmentsCount)]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleSave = async (userId: string) => {
    const raw = edits[userId]?.trim() ?? "0";
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 0 || n > 500) {
      setError("أدخلي رقماً بين 0 و 500");
      return;
    }
    setError(null);
    setSavingId(userId);
    setSuccessId(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/loyalty`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAppointmentsCount: n }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل الحفظ");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, completedAppointmentsCount: n } : u
        )
      );
      setEdits((e) => ({ ...e, [userId]: String(n) }));
      setSuccessId(userId);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#C9A882]/15 flex items-center justify-center">
          <Users className="w-6 h-6 text-[#C9A882]" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#4A3F35]">
            العملاء وبطاقة الولاء
          </h1>
          <p className="font-body text-sm text-[#6B5D52] mt-0.5">
            تعديل عدد الجلسات المكتملة في بطاقة الولاء لكل عميلة (0–500)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 font-body text-sm">
        <Link
          href="/admin/clients"
          className={`rounded-lg px-3 py-1.5 ${!initialArchived ? "bg-[#C9A882] text-white" : "border border-[#E8DDD4] text-[#6B5D52]"}`}
        >
          العملاء النشطون
        </Link>
        <Link
          href="/admin/clients?archived=1"
          className={`rounded-lg px-3 py-1.5 ${initialArchived ? "bg-[#C9A882] text-white" : "border border-[#E8DDD4] text-[#6B5D52]"}`}
        >
          المؤرشفون
        </Link>
      </div>

      <form
        method="get"
        action="/admin/clients"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-[#E8DDD4] bg-white p-4"
      >
        {initialArchived ? <input type="hidden" name="archived" value="1" /> : null}
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-right font-body text-xs text-[#6B5D52]">
            بحث (اسم / بريد / جوال)
          </label>
          <input
            name="q"
            defaultValue={initialQuery}
            className="w-full rounded-lg border border-[#E8DDD4] px-3 py-2 font-body text-sm text-[#4A3F35]"
            placeholder="ابحثي..."
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#C9A882] px-5 py-2 font-body text-sm text-white hover:bg-[#B8956F]"
        >
          بحث
        </button>
        {initialQuery ? (
          <a
            href="/admin/clients"
            className="rounded-lg border border-[#E8DDD4] px-4 py-2 font-body text-sm text-[#6B5D52]"
          >
            مسح
          </a>
        ) : null}
      </form>

      <div className="mt-8 rounded-2xl border border-[#E8DDD4] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right font-body text-sm">
            <thead>
              <tr className="bg-[#F8F4EF] border-b border-[#E8DDD4] text-[#6B5D52]">
                <th className="px-4 py-3 font-medium">الاسم</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">البريد</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">الجوال</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">جلسات مكتملة</th>
                <th className="px-4 py-3 font-medium">مواعيد</th>
                <th className="px-4 py-3 font-medium w-32">حفظ</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#6B5D52]">
                    {initialArchived ? "لا يوجد عملاء مؤرشفون" : "لا يوجد عملاء مسجّلون"}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#E8DDD4]/60 hover:bg-[#F8F4EF]/40"
                  >
                    <td className="px-4 py-3 text-[#4A3F35] font-medium">
                      <Link
                        href={`/admin/clients/${u.id}`}
                        className="hover:text-[#C9A882] hover:underline"
                      >
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#6B5D52] hidden md:table-cell">
                      {u.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-[#6B5D52] hidden sm:table-cell">
                      {u.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={500}
                        dir="ltr"
                        className="w-20 px-2 py-1.5 rounded-lg border border-[#E8DDD4] text-center text-[#4A3F35] focus:ring-2 focus:ring-[#C9A882]/40 focus:border-[#C9A882] outline-none"
                        value={edits[u.id] ?? ""}
                        onChange={(e) =>
                          setEdits((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                        aria-label={`عدد الجلسات — ${u.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/appointments?userId=${u.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#C9A882] hover:underline"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        عرض
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSave(u.id)}
                        disabled={savingId === u.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A882] text-white text-xs font-medium hover:bg-[#B8956F] disabled:opacity-50 transition-colors"
                      >
                        {savingId === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        حفظ
                      </button>
                      {successId === u.id && (
                        <span className="mr-2 text-xs text-green-600">✓</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 font-body text-xs text-[#6B5D52] leading-relaxed max-w-2xl">
        ملاحظة: هذا الرقم يحدّث عرض بطاقة الولاء والخصومات عند الحجز. الجلسات المسجّلة تلقائياً عند
        تغيير حالة الموعد إلى «مكتمل» تزيد هذا العدد — يمكنكِ هنا تصحيح العدد يدوياً عند الحاجة.
      </p>
    </div>
  );
}
