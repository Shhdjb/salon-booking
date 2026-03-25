"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment, AppointmentLine, Service } from "@prisma/client";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";

type LineWithService = AppointmentLine & { service: Service };

export type CalendarAppointment = Appointment & {
  service: Service;
  lines: LineWithService[];
  user: { name: string } | null;
};

const statusLabels: Record<string, string> = {
  pending: "انتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم تحضر",
};

const statusClass: Record<string, string> = {
  pending: "border-amber-300 bg-amber-50/90",
  confirmed: "border-blue-300 bg-blue-50/90",
  completed: "border-green-300 bg-green-50/90",
  cancelled: "border-gray-300 bg-gray-100/80",
  no_show: "border-red-300 bg-red-50/90",
};

function aptTitle(a: CalendarAppointment): string {
  return formatAppointmentServiceNames({
    service: a.service,
    lines: a.lines.map((l) => ({ sortOrder: l.sortOrder, service: l.service })),
  });
}

export function AdminCalendar({
  view,
  anchorDate,
  dates,
  initialAppointments,
}: {
  view: "day" | "week";
  anchorDate: string;
  dates: string[];
  initialAppointments: CalendarAppointment[];
}) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const m = new Map<string, CalendarAppointment[]>();
    for (const d of dates) m.set(d, []);
    for (const a of initialAppointments) {
      const list = m.get(a.date) ?? [];
      list.push(a);
      m.set(a.date, list);
    }
    dates.forEach((d) => {
      const list = m.get(d);
      if (list) list.sort((x, y) => x.startTime.localeCompare(y.startTime));
    });
    return m;
  }, [initialAppointments, dates]);

  const navigate = (delta: number) => {
    const base = parseISO(anchorDate);
    const next =
      view === "day"
        ? new Date(base.getTime() + delta * 86400000)
        : new Date(base.getTime() + delta * 7 * 86400000);
    const d = format(next, "yyyy-MM-dd");
    router.push(`/admin/calendar?view=${view}&date=${d}`);
  };

  const patchStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-[#E8DDD4] bg-white p-1">
          <Link
            href={`/admin/calendar?view=day&date=${anchorDate}`}
            className={`rounded-lg px-4 py-2 font-body text-sm ${
              view === "day"
                ? "bg-[#C9A882] text-white"
                : "text-[#6B5D52] hover:bg-[#F8F4EF]"
            }`}
          >
            يوم
          </Link>
          <Link
            href={`/admin/calendar?view=week&date=${anchorDate}`}
            className={`rounded-lg px-4 py-2 font-body text-sm ${
              view === "week"
                ? "bg-[#C9A882] text-white"
                : "text-[#6B5D52] hover:bg-[#F8F4EF]"
            }`}
          >
            أسبوع
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-[#E8DDD4] p-2 hover:bg-[#F8F4EF]"
            aria-label="السابق"
          >
            <ChevronRight size={22} className="text-[#4A3F35]" />
          </button>
          <span className="min-w-[180px] text-center font-body text-sm font-medium text-[#4A3F35]">
            {view === "day"
              ? format(parseISO(anchorDate), "EEEE d MMMM yyyy", { locale: ar })
              : `أسبوع حول ${format(parseISO(anchorDate), "d MMM", { locale: ar })}`}
          </span>
          <button
            type="button"
            onClick={() => navigate(1)}
            className="rounded-xl border border-[#E8DDD4] p-2 hover:bg-[#F8F4EF]"
            aria-label="التالي"
          >
            <ChevronLeft size={22} className="text-[#4A3F35]" />
          </button>
        </div>

        <Link
          href="/admin/appointments"
          className="font-body text-sm text-[#C9A882] hover:underline"
        >
          ← الجدول
        </Link>
      </div>

      <div
        className={`grid gap-4 ${
          view === "day" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-7"
        }`}
      >
        {dates.map((dateStr) => {
          const list = byDate.get(dateStr) ?? [];
          return (
            <div
              key={dateStr}
              className="min-h-[200px] rounded-2xl border border-[#E8DDD4]/80 bg-white p-4 shadow-sm"
            >
              <h3 className="mb-3 border-b border-[#E8DDD4] pb-2 text-center font-display text-lg font-bold text-[#4A3F35]">
                {format(parseISO(dateStr), "EEE d MMM", { locale: ar })}
              </h3>
              <div className="space-y-3">
                {list.length === 0 ? (
                  <p className="text-center font-body text-xs text-[#6B5D52]">لا مواعيد</p>
                ) : (
                  list.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-xl border-2 p-3 text-right ${statusClass[a.status] ?? "border-[#E8DDD4] bg-white"}`}
                    >
                      <p className="font-body text-xs font-bold text-[#4A3F35]">
                        {a.startTime} – {a.endTime}
                      </p>
                      <p className="mt-1 font-body text-sm font-medium text-[#4A3F35]">
                        {a.customerName}
                      </p>
                      <p className="font-body text-xs text-[#6B5D52] line-clamp-2">
                        {aptTitle(a)}
                      </p>
                      <p className="mt-1 text-xs text-[#6B5D52]">
                        {statusLabels[a.status] ?? a.status}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {a.status !== "confirmed" && a.status !== "cancelled" && (
                          <button
                            type="button"
                            disabled={updatingId === a.id}
                            onClick={() => patchStatus(a.id, "confirmed")}
                            className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] text-white disabled:opacity-50"
                          >
                            تأكيد
                          </button>
                        )}
                        {a.status !== "cancelled" && (
                          <button
                            type="button"
                            disabled={updatingId === a.id}
                            onClick={() => patchStatus(a.id, "cancelled")}
                            className="rounded-md bg-gray-600 px-2 py-0.5 text-[10px] text-white disabled:opacity-50"
                          >
                            إلغاء
                          </button>
                        )}
                        {a.status !== "completed" && a.status !== "cancelled" && (
                          <button
                            type="button"
                            disabled={updatingId === a.id}
                            onClick={() => patchStatus(a.id, "completed")}
                            className="rounded-md bg-green-600 px-2 py-0.5 text-[10px] text-white disabled:opacity-50"
                          >
                            مكتمل
                          </button>
                        )}
                        {a.status !== "no_show" && a.status !== "cancelled" && a.status !== "completed" && (
                          <button
                            type="button"
                            disabled={updatingId === a.id}
                            onClick={() => patchStatus(a.id, "no_show")}
                            className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] text-white disabled:opacity-50"
                          >
                            لم تحضر
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
