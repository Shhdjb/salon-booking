"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import type { Appointment, AppointmentLine, Service, User } from "@prisma/client";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";
import { formatIls } from "@/lib/format-currency";
import {
  adminApiErrorMessage,
  parseAdminApiJson,
  ADMIN_ACTION_DISABLED_TITLE,
} from "@/lib/admin-api-errors";

const CLIENT_LOG = "[admin-client][appointments]";

type LineWithService = AppointmentLine & { service: Service };

export type AdminAppointmentRow = Appointment & {
  service: Service;
  user: Pick<User, "id" | "name" | "phone" | "email"> | null;
  lines: LineWithService[];
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم تحضر",
};

const STATUS_OPTIONS = [
  { value: "all", label: "كل الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
  { value: "no_show", label: "لم تحضر" },
] as const;

/** Quick actions except «تأكيد» — rendered separately so confirmed rows show a clear non-repeat state. */
const QUICK_STATUS_NO_CONFIRM = [
  { value: "cancelled", label: "إلغاء", color: "bg-gray-200 text-gray-700" },
  { value: "completed", label: "مكتمل", color: "bg-green-100 text-green-800" },
  { value: "no_show", label: "لم تحضر", color: "bg-red-100 text-red-800" },
] as const;

function rowLabel(row: AdminAppointmentRow): string {
  return formatAppointmentServiceNames({
    service: row.service,
    lines: row.lines.map((l) => ({
      sortOrder: l.sortOrder,
      service: l.service,
    })),
  });
}

function discountApplied(row: AdminAppointmentRow): number | null {
  if (row.discountPercent != null && row.discountPercent > 0) {
    return row.discountPercent;
  }
  if (row.originalPrice > 0 && row.finalPrice < row.originalPrice) {
    const p = Math.round((1 - row.finalPrice / row.originalPrice) * 1000) / 10;
    return p > 0 ? p : null;
  }
  return null;
}

export function AppointmentsList({
  initialAppointments,
  filters,
}: {
  initialAppointments: AdminAppointmentRow[];
  filters: { date: string; status: string; q: string; userId: string };
}) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"info" | "error">("info");
  const toastClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actionsLocked =
    sessionStatus === "loading" ||
    sessionStatus === "unauthenticated" ||
    session?.user?.role !== "ADMIN";

  const showAdminToast = (text: string, variant: "info" | "error" = "info") => {
    if (toastClearRef.current) clearTimeout(toastClearRef.current);
    setToastVariant(variant);
    setAdminToast(text);
    toastClearRef.current = setTimeout(() => {
      setAdminToast(null);
      toastClearRef.current = null;
    }, variant === "error" ? 6500 : 4500);
  };

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  useEffect(() => {
    return () => {
      if (toastClearRef.current) clearTimeout(toastClearRef.current);
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (actionsLocked) {
      showAdminToast(ADMIN_ACTION_DISABLED_TITLE, "error");
      return;
    }
    setUpdatingId(id);
    try {
      console.log(`${CLIENT_LOG} PATCH start`, { appointmentId: id, targetStatus: status });
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await parseAdminApiJson(res);
      console.log(`${CLIENT_LOG} PATCH response`, {
        appointmentId: id,
        targetStatus: status,
        httpStatus: res.status,
        body: data,
      });
      if (res.ok) {
        if (typeof data.message === "string" && data.message) {
          showAdminToast(data.message, "info");
        }
        if (!data.unchanged) {
          setAppointments((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, status: status as Appointment["status"] } : a
            )
          );
        }
        router.refresh();
      } else {
        showAdminToast(adminApiErrorMessage(res, data), "error");
      }
    } catch (e) {
      console.error(`${CLIENT_LOG} PATCH network/failure`, { appointmentId: id, err: e });
      showAdminToast("تعذر الاتصال بالخادم", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (actionsLocked) {
      showAdminToast(ADMIN_ACTION_DISABLED_TITLE, "error");
      return;
    }
    if (!confirm("هل أنت متأكد من حذف هذا الموعد؟")) return;
    try {
      console.log(`${CLIENT_LOG} DELETE start`, { appointmentId: id });
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseAdminApiJson(res);
      console.log(`${CLIENT_LOG} DELETE response`, { appointmentId: id, httpStatus: res.status, body: data });
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        showAdminToast(adminApiErrorMessage(res, data), "error");
      }
    } catch (e) {
      console.error(`${CLIENT_LOG} DELETE network/failure`, { appointmentId: id, err: e });
      showAdminToast("تعذر الاتصال بالخادم", "error");
    }
  };

  return (
    <div className="space-y-6">
      {adminToast ? (
        <div
          className={`fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border px-5 py-3 text-center font-body text-sm text-white shadow-lg ${
            toastVariant === "error"
              ? "border-red-400/50 bg-[#7c2d2d]"
              : "border-[#C9A882]/40 bg-[#4A3F35]"
          }`}
          role="alert"
          dir="rtl"
        >
          {adminToast}
        </div>
      ) : null}

      <form
        method="get"
        action="/admin/appointments"
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-[#E8DDD4]/80 bg-white p-5 shadow-sm"
      >
        <div className="min-w-[140px]">
          <label className="mb-1 block text-right font-body text-xs text-[#6B5D52]">
            التاريخ
          </label>
          <input
            type="date"
            name="date"
            defaultValue={filters.date}
            className="w-full rounded-xl border-2 border-[#E8DDD4] px-3 py-2 font-body text-sm text-[#4A3F35]"
          />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-right font-body text-xs text-[#6B5D52]">
            الحالة
          </label>
          <select
            name="status"
            defaultValue={filters.status}
            className="w-full rounded-xl border-2 border-[#E8DDD4] px-3 py-2 font-body text-sm text-[#4A3F35]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-right font-body text-xs text-[#6B5D52]">
            بحث (اسم / جوال)
          </label>
          <input
            type="search"
            name="q"
            placeholder="اسم العميلة أو رقم الجوال"
            defaultValue={filters.q}
            className="w-full rounded-xl border-2 border-[#E8DDD4] px-3 py-2 font-body text-sm text-[#4A3F35]"
          />
        </div>
        {filters.userId ? (
          <input type="hidden" name="userId" value={filters.userId} />
        ) : null}
        <button
          type="submit"
          className="rounded-xl bg-[#C9A882] px-6 py-2 font-body text-sm font-medium text-white hover:bg-[#B8956F]"
        >
          تطبيق
        </button>
        <a
          href="/admin/appointments"
          className="rounded-xl border-2 border-[#E8DDD4] px-4 py-2 font-body text-sm text-[#6B5D52] hover:bg-[#F8F4EF]"
        >
          مسح
        </a>
      </form>

      {appointments.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center font-body text-[#6B5D52] shadow-lg">
          لا توجد مواعيد تطابق التصفية.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E8DDD4]/80 bg-white shadow-lg">
          <table className="w-full min-w-[960px] border-collapse text-right font-body text-sm">
            <thead>
              <tr className="border-b border-[#E8DDD4] bg-[#F8F4EF]/80 text-[#6B5D52]">
                <th className="px-4 py-3 font-medium">التاريخ</th>
                <th className="px-4 py-3 font-medium">الوقت</th>
                <th className="px-4 py-3 font-medium">العميلة</th>
                <th className="px-4 py-3 font-medium">الجوال</th>
                <th className="px-4 py-3 font-medium">الخدمات</th>
                <th className="px-4 py-3 font-medium">السعر الأصلي</th>
                <th className="px-4 py-3 font-medium">الخصم %</th>
                <th className="px-4 py-3 font-medium">النهائي</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">مكتمل في</th>
                <th className="px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => {
                const disc = discountApplied(apt);
                return (
                  <tr
                    key={apt.id}
                    className="border-b border-[#E8DDD4]/60 align-top hover:bg-[#F8F4EF]/40"
                  >
                    <td className="px-4 py-3 text-[#4A3F35]">
                      {format(new Date(apt.date), "EEE d MMM yyyy", { locale: ar })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#4A3F35]">
                      {apt.startTime} – {apt.endTime}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#4A3F35]">{apt.customerName}</div>
                      {apt.user && (
                        <div className="text-xs text-[#6B5D52]">حساب: {apt.user.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#6B5D52]">
                      {apt.phone}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-[#4A3F35]">
                      {rowLabel(apt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatIls(apt.originalPrice)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {disc != null ? `${disc}%` : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-[#4A3F35]">
                      {formatIls(apt.finalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          apt.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : apt.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : apt.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : apt.status === "cancelled"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {statusLabels[apt.status] ?? apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B5D52] whitespace-nowrap">
                      {apt.completedAt
                        ? format(new Date(apt.completedAt), "d MMM HH:mm", { locale: ar })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {apt.status === "confirmed" ? (
                          <button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-lg border border-blue-200 bg-blue-50/90 px-2 py-1 text-xs font-semibold text-blue-800 opacity-90"
                            title="تم تأكيد هذا الموعد مسبقاً"
                            aria-label="تم تأكيد هذا الموعد مسبقاً"
                          >
                            مؤكد ✓
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={actionsLocked || updatingId === apt.id}
                            title={actionsLocked ? ADMIN_ACTION_DISABLED_TITLE : undefined}
                            onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                            className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            تأكيد
                          </button>
                        )}
                        {QUICK_STATUS_NO_CONFIRM.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={
                              actionsLocked ||
                              updatingId === apt.id ||
                              apt.status === opt.value
                            }
                            title={actionsLocked ? ADMIN_ACTION_DISABLED_TITLE : undefined}
                            onClick={() => handleUpdateStatus(apt.id, opt.value)}
                            className={`rounded-lg px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${opt.color}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          disabled={actionsLocked}
                          title={actionsLocked ? ADMIN_ACTION_DISABLED_TITLE : undefined}
                          onClick={() => handleDelete(apt.id)}
                        >
                          <Trash2 size={14} className="ml-1" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
