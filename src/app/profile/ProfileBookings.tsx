"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, X, CalendarClock } from "lucide-react";
import { formatIls } from "@/lib/format-currency";

export interface ProfileBookingItem {
  id: string;
  serviceName: string;
  serviceIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  originalPrice: number;
  finalPrice: number;
  discountApplied: number | null;
  completedAt: string | null;
  lastRescheduledAt: string | null;
  canReschedule: boolean;
}

interface ProfileBookingsProps {
  upcoming: ProfileBookingItem[];
  past: ProfileBookingItem[];
  onChanged?: () => void;
}

export function ProfileBookings({ upcoming, past, onChanged }: ProfileBookingsProps) {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [items, setItems] = useState({ upcoming, past });
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<ProfileBookingItem | null>(null);
  const [pickDate, setPickDate] = useState<string>("");
  const [slots, setSlots] = useState<{ time: string; disabled: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  useEffect(() => {
    setItems({ upcoming, past });
  }, [upcoming, past]);

  useEffect(() => {
    if (!rescheduleTarget) {
      setSlots([]);
      return;
    }
    if (!pickDate) return;
    const q = new URLSearchParams({
      date: pickDate,
      serviceIds: rescheduleTarget.serviceIds.join(","),
    });
    setLoadingSlots(true);
    fetch(`/api/booking/slots?${q}`)
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [rescheduleTarget, pickDate]);

  const openReschedule = (apt: ProfileBookingItem) => {
    setRescheduleTarget(apt);
    setPickDate(apt.date);
    setRescheduleError(null);
  };

  const closeReschedule = () => {
    setRescheduleTarget(null);
    setRescheduleError(null);
    setSlots([]);
  };

  const submitReschedule = async (startTime: string) => {
    if (!rescheduleTarget) return;
    setRescheduleSubmitting(true);
    setRescheduleError(null);
    try {
      const res = await fetch(`/api/bookings/${rescheduleTarget.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: pickDate, startTime }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRescheduleError(data.error || "فشل تغيير الموعد");
        return;
      }
      closeReschedule();
      onChanged?.();
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(id);
    setCancelError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setItems((prev) => ({
          ...prev,
          upcoming: prev.upcoming.filter((a) => a.id !== id),
        }));
        onChanged?.();
      } else {
        setCancelError(data.error || "فشل الإلغاء");
      }
    } finally {
      setCancelling(null);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    completed: "منتهي",
    cancelled: "ملغي",
    no_show: "لم تحضر",
  };

  const priceBlock = (apt: ProfileBookingItem) => (
    <div className="mt-2 font-body text-xs text-[#6B5D52] space-y-0.5">
      <p>
        الأصلي: {formatIls(apt.originalPrice)} · النهائي:{" "}
        <span className="font-semibold text-[#4A3F35]">{formatIls(apt.finalPrice)}</span>
        {apt.discountApplied != null && apt.discountApplied > 0 && (
          <span className="mr-1 text-salon-gold-dark">(خصم {apt.discountApplied}%)</span>
        )}
      </p>
      {apt.completedAt && (
        <p>اكتمل: {format(new Date(apt.completedAt), "d MMM yyyy HH:mm", { locale: ar })}</p>
      )}
      {apt.lastRescheduledAt && (
        <p>آخر تعديل موعد: {format(new Date(apt.lastRescheduledAt), "d MMM yyyy HH:mm", { locale: ar })}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            dir="rtl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-[#4A3F35] flex items-center gap-2">
                <CalendarClock className="h-6 w-6 text-[#C9A882]" />
                إعادة جدولة
              </h3>
              <button
                type="button"
                onClick={closeReschedule}
                className="rounded-full p-2 hover:bg-[#F8F4EF]"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="font-body text-sm text-[#6B5D52] mb-4">
              {rescheduleTarget.serviceName}
            </p>
            <label className="mb-2 block font-body text-sm text-[#4A3F35]">التاريخ الجديد</label>
            <input
              type="date"
              value={pickDate}
              onChange={(e) => setPickDate(e.target.value)}
              className="mb-4 w-full rounded-xl border-2 border-[#E8DDD4] px-3 py-2 font-body"
            />
            {rescheduleError && (
              <p className="mb-3 rounded-xl bg-red-50 p-3 font-body text-sm text-red-600">
                {rescheduleError}
              </p>
            )}
            {loadingSlots ? (
              <p className="font-body text-[#6B5D52]">جاري تحميل الأوقات...</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.disabled || rescheduleSubmitting}
                    onClick={() => !slot.disabled && submitReschedule(slot.time)}
                    className={`rounded-xl p-2 text-sm font-medium ${
                      slot.disabled
                        ? "cursor-not-allowed bg-[#F8F4EF]/50 text-[#C9C9C9]"
                        : "border-2 border-[#E8DDD4] text-[#4A3F35] hover:border-[#C9A882]"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-2xl font-bold text-[#4A3F35] mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#C9A882]" />
          مواعيدي القادمة
        </h2>
        {cancelError && (
          <p className="mb-4 font-body text-sm text-red-500 p-4 bg-red-50 rounded-xl">
            {cancelError}
          </p>
        )}
        {items.upcoming.length === 0 ? (
          <p className="font-body text-[#6B5D52]">
            لا توجد مواعيد قادمة.{" "}
            <a href="/book" className="text-salon-gold hover:underline">
              احجزي موعداً
            </a>
          </p>
        ) : (
          <div className="space-y-4">
            {items.upcoming.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#F8F4EF]/60 border border-[#E8DDD4]/60"
              >
                <div className="text-right flex-1">
                  <p className="font-body font-bold text-[#4A3F35]">{apt.serviceName}</p>
                  <p className="font-body text-sm text-[#6B5D52]">
                    {format(new Date(apt.date), "EEEE d MMMM yyyy", { locale: ar })} ·{" "}
                    {apt.startTime} – {apt.endTime}
                  </p>
                  {priceBlock(apt)}
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {statusLabel[apt.status] || apt.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {apt.canReschedule && (
                    <button
                      type="button"
                      onClick={() => openReschedule(apt)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-[#C9A882] text-[#4A3F35] hover:bg-[#F8F4EF] font-body text-sm"
                    >
                      <CalendarClock className="w-4 h-4" />
                      إعادة جدولة
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(apt.id)}
                    disabled={cancelling === apt.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-body text-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {cancelling === apt.id ? "جاري الإلغاء..." : "إلغاء"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.past.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-[#4A3F35] mb-6">
            المواعيد السابقة
          </h2>
          <div className="space-y-4">
            {items.past.map((apt) => (
              <div
                key={apt.id}
                className="p-6 rounded-2xl bg-[#F8F4EF]/50 border border-[#E8DDD4]/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-right">
                    <p className="font-body font-bold text-[#4A3F35]">{apt.serviceName}</p>
                    <p className="font-body text-sm text-[#6B5D52]">
                      {format(new Date(apt.date), "EEEE d MMMM yyyy", { locale: ar })} ·{" "}
                      {apt.startTime} – {apt.endTime}
                    </p>
                    {priceBlock(apt)}
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : apt.status === "no_show"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabel[apt.status] || apt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
