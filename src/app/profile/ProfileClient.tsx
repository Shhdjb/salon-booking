"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfileBookings } from "./ProfileBookings";
import { LoyaltyCard } from "./LoyaltyCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { LoyaltyInfo } from "@/lib/loyalty";
import type { ProfileBookingItem } from "./ProfileBookings";
import { isValidEmail } from "@/lib/email-utils";

interface ProfileData {
  user: {
    name: string;
    email: string;
    phone: string;
    completedAppointmentsCount: number;
    loyaltyUnlockNotifiedPercent?: number;
    phoneNotificationsEnabled: boolean;
    preferredNotificationChannel: string | null;
  };
  loyalty: LoyaltyInfo;
  upcoming: ProfileBookingItem[];
  past: ProfileBookingItem[];
}

export function ProfileClient() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotifications, setEditNotifications] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadData = () =>
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("فشل تحميل البيانات");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setEditPhone(d.user.phone || "");
        setEditEmail(d.user.email || "");
        setEditNotifications(d.user.phoneNotificationsEnabled ?? false);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePreferences = async () => {
    if (!data) return;
    const em = editEmail.trim();
    if (!em || !isValidEmail(em)) {
      setSaveError("أدخلي بريداً إلكترونياً صالحاً");
      return;
    }
    setSaveError(null);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: em,
          phone: editPhone,
          phoneNotificationsEnabled: editNotifications,
          preferredNotificationChannel: editNotifications ? "WHATSAPP" : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل الحفظ");
      setData({
        ...data,
        user: {
          ...data.user,
          email: em,
          phone: editPhone,
          phoneNotificationsEnabled: editNotifications,
          preferredNotificationChannel: editNotifications ? "WHATSAPP" : null,
        },
      });
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-24">
        <div className="animate-pulse font-body text-[#6B5D52]">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-24 px-6">
        <p className="font-body text-red-500 mb-4">{error || "حدث خطأ"}</p>
        <Link href="/login?callbackUrl=/profile" className="text-[#C9A882] hover:underline font-body">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#4A3F35]">
          حسابي
        </h1>
        <p className="mt-3 font-body text-[#6B5D52] text-lg">
          أهلاً، {data.user.name}
        </p>
      </div>

      {/* Account info + Loyalty card */}
      <div className="grid lg:grid-cols-5 gap-8 mb-16">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] p-8 shadow-premium border border-[#E8DDD4]/50 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-[#4A3F35]">
                معلومات الحساب
              </h2>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="font-body text-sm text-[#C9A882] hover:underline"
                >
                  تعديل
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="font-body text-sm text-[#6B5D52] hover:underline"
                >
                  إلغاء
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-4">
                <p className="text-right font-body">
                  <span className="text-[#6B5D52]">الاسم:</span>{" "}
                  <span className="text-[#4A3F35] font-medium">{data.user.name}</span>
                </p>
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="example@email.com"
                />
                <Input
                  label="رقم الجوال"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                />
                <div className="rounded-xl border-2 border-[#E8DDD4]/60 bg-salon-cream/30 p-4 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 font-body text-[#4A3F35]">
                    <input
                      type="checkbox"
                      checked={editNotifications}
                      onChange={(e) => setEditNotifications(e.target.checked)}
                      className="h-4 w-4 rounded border-[#C9A882] text-[#C9A882]"
                    />
                    <span>أرغب في استلام تحديثات الموعد على واتساب</span>
                  </label>
                </div>
                {saveError && (
                  <p className="font-body text-sm text-red-500">{saveError}</p>
                )}
                <Button
                  variant="primary"
                  onClick={handleSavePreferences}
                  disabled={saveLoading}
                  className="w-full"
                >
                  {saveLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-right font-body">
                <p>
                  <span className="text-[#6B5D52]">الاسم:</span>{" "}
                  <span className="text-[#4A3F35] font-medium">{data.user.name}</span>
                </p>
                <p>
                  <span className="text-[#6B5D52]">البريد:</span>{" "}
                  <span className="text-[#4A3F35] font-medium">{data.user.email}</span>
                </p>
                <p>
                  <span className="text-[#6B5D52]">الجوال:</span>{" "}
                  <span className="text-[#4A3F35] font-medium">{data.user.phone || "—"}</span>
                </p>
                <p>
                  <span className="text-[#6B5D52]">تحديثات الموعد:</span>{" "}
                  <span className="text-[#4A3F35] font-medium">
                    {data.user.phoneNotificationsEnabled ? "واتساب" : "غير مفعّل"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-3">
          <LoyaltyCard
            loyalty={data.loyalty}
            loyaltyUnlockNotifiedPercent={data.user.loyaltyUnlockNotifiedPercent ?? 0}
          />
        </div>
      </div>

      {/* Bookings */}
      <ProfileBookings upcoming={data.upcoming} past={data.past} onChanged={loadData} />

      {/* CTA */}
      <div className="mt-16 text-center">
        <Link
          href="/book"
          className="inline-block px-14 py-5 bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium text-lg shadow-gold-soft hover:shadow-gold-glow transition-all duration-300"
        >
          حجز موعد جديد
        </Link>
      </div>
    </div>
  );
}
