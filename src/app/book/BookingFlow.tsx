"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createAppointment } from "@/app/actions/booking";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import type { Service } from "@prisma/client";

type Step = 1 | 2 | 3 | 4 | 5;

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  phoneNotificationsEnabled?: boolean;
  preferredNotificationChannel?: string | null;
}

interface BookingFlowProps {
  services: Service[];
  availableDates: string[];
  user?: UserInfo | null;
}

export function BookingFlow({ services, availableDates, user }: BookingFlowProps) {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");

  const bookableServices = services.filter((s) => s.isActive);

  const [step, setStep] = useState<Step>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    if (preselectedService && bookableServices.some((s) => s.id === preselectedService)) {
      return [preselectedService];
    }
    return [];
  });
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<{ time: string; disabled: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [submitState, setSubmitState] = useState<{ success?: boolean; error?: string }>({});
  const [phoneNotificationsConsent, setPhoneNotificationsConsent] = useState(
    user?.phoneNotificationsEnabled ?? false
  );

  const selectedServicesData = selectedServices
    .map((id) => bookableServices.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const servicesLabel = selectedServicesData.map((s) => s.name).join(" + ");

  useEffect(() => {
    const loadUser = (data: {
      name?: string;
      email?: string;
      phone?: string;
      phoneNotificationsEnabled?: boolean;
      preferredNotificationChannel?: string | null;
    } | null) => {
      if (!data) return;
      if (data.name) {
        const name = data.name;
        setCustomerName((prev) => prev || name);
      }
      if (data.email) {
        const email = data.email;
        setCustomerEmail((prev) => prev || email);
      }
      if (data.phone) {
        const phone = data.phone;
        setCustomerPhone((prev) => prev || phone);
      }
      if (data.phoneNotificationsEnabled !== undefined) setPhoneNotificationsConsent(data.phoneNotificationsEnabled);
    };
    if (user) {
      loadUser({
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneNotificationsEnabled: user.phoneNotificationsEnabled,
        preferredNotificationChannel: user.preferredNotificationChannel,
      });
    }
    fetch("/api/book/user")
      .then((res) => res.json())
      .then(loadUser)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!date || selectedServices.length === 0) {
      setTimeSlots([]);
      return;
    }
    setLoadingSlots(true);
    const q = new URLSearchParams({
      date,
      serviceIds: selectedServices.join(","),
    });
    fetch(`/api/booking/slots?${q.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTimeSlots(Array.isArray(data) ? data : []);
        setTime(null);
      })
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, selectedServices]);

  const validateStep = (s: Step): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1 && selectedServices.length === 0)
      newErrors.service = "الرجاء اختيار خدمة واحدة على الأقل";
    if (s === 2 && !date) newErrors.date = "الرجاء اختيار تاريخ";
    if (s === 3 && !time) newErrors.time = "الرجاء اختيار وقت";
    if (s === 4) {
      if (!customerName.trim()) newErrors.customerName = "الاسم مطلوب";
      if (!customerPhone.trim()) newErrors.customerPhone = "رقم الجوال مطلوب";
      else if (!/^[\d\s\-\+\(\)]+$/.test(customerPhone))
        newErrors.customerPhone = "أدخلي رقم جوال صحيح";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (selectedServices.length === 0 || !date || !time || !customerName || !customerPhone)
      return;

    const formData = new FormData();
    formData.set("serviceIds", JSON.stringify(selectedServices));
    formData.set("date", date);
    formData.set("startTime", time);
    formData.set("customerName", customerName.trim());
    formData.set("phone", customerPhone.trim());
    if (customerEmail.trim()) formData.set("email", customerEmail.trim());
    if (notes.trim()) formData.set("notes", notes.trim());
    formData.set("phoneNotificationsConsent", phoneNotificationsConsent ? "1" : "0");

    const result = await createAppointment({}, formData);

    if (result.success) {
      setConfirmed(true);
    } else {
      setSubmitState({ error: result.error });
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setSubmitState({});
    if (step < 5) setStep((s) => (s + 1) as Step);
    else handleConfirm();
  };

  const handleBack = () => {
    setErrors({});
    setSubmitState({});
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const steps = [
    { num: 1, label: "الخدمة" },
    { num: 2, label: "التاريخ" },
    { num: 3, label: "الوقت" },
    { num: 4, label: "البيانات" },
    { num: 5, label: "التأكيد" },
  ];

  const dateObjects = availableDates.map((d) => new Date(d));

  const confirmationFollowUpText =
    "طلبكِ قيد المراجعة. بعد موافقة الصالون على الموعد (مؤكد) ستصلكِ رسالة تأكيد رسمية على الجوال أو البريد حسب إعداداتكِ. يمكنكِ متابعة الحالة من «مواعيدي». إذا فعّلتِ التنبيهات، سنرسل لكِ أيضاً تذكيراً قبل الموعد بيوم.";

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-24 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-salon-gold/20 text-salon-gold mb-10 border-2 border-salon-gold/40">
          <Check size={40} strokeWidth={2} />
        </div>
        <h2 className="font-display text-4xl font-bold text-salon-brown">
          تم استلام طلب الحجز
        </h2>
        <p className="mt-4 font-body text-salon-brown-muted text-lg">
          شكراً لكِ {customerName}
        </p>
        <div className="mt-8 p-6 rounded-2xl bg-salon-cream/50 border border-salon-cream-border text-right space-y-2">
          <p><span className="text-salon-brown-muted">الخدمات:</span> {servicesLabel}</p>
          <p><span className="text-salon-brown-muted">التاريخ:</span> {date && format(new Date(date), "EEEE d MMMM yyyy", { locale: ar })}</p>
          <p><span className="text-salon-brown-muted">الوقت:</span> {time}</p>
          <p><span className="text-salon-brown-muted">الاسم:</span> {customerName}</p>
        </div>
        <p className="mt-6 font-body text-sm text-salon-brown-muted">
          {confirmationFollowUpText}
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full hover:shadow-2xl hover:shadow-salon-gold/30 transition-all duration-500 font-body font-medium text-base sm:text-lg"
          >
            مواعيدي
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] border-2 border-salon-gold text-salon-brown rounded-full hover:bg-salon-cream transition-colors font-body font-medium text-base sm:text-lg"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-24">
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 bg-salon-cream/80 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full shadow-lg shadow-salon-gold/10 mb-4 sm:mb-6">
          <span className="text-salon-gold font-body text-sm tracking-wide">
            احجزي موعدكِ
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A3F35]">
          حجز موعد
        </h1>
      </div>

      <div className="flex justify-center gap-1 sm:gap-2 mb-8 sm:mb-12 flex-row-reverse overflow-x-auto pb-2">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-1 ${
              step >= s.num ? "text-[#6B5D52]" : "text-[#E8DDD4]"
            }`}
          >
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s.num
                  ? "bg-salon-gold text-white"
                  : step > s.num
                  ? "bg-salon-gold/30 text-salon-gold-dark"
                  : "bg-salon-cream text-[#6B5D52]"
              }`}
            >
              {step > s.num ? <Check size={18} /> : s.num}
            </span>
            {s.num < 5 && (
              <ChevronLeft size={16} className="text-[#E8DDD4]" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 shadow-xl shadow-black/5">
        {step === 1 && (
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4A3F35] mb-4 sm:mb-6">
              اختاري الخدمة أو أكثر
            </h2>
            <p className="font-body text-sm text-[#6B5D52] mb-4 text-right">
              يمكنكِ تحديد أكثر من خدمة في نفس الموعد في زيارة واحدة.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookableServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-right border-2 transition-all duration-200 min-h-[48px] ${
                    selectedServices.includes(s.id)
                      ? "border-salon-gold bg-salon-cream/50"
                      : "border-salon-cream-border hover:border-salon-gold/50"
                  }`}
                >
                  <p className="font-body font-bold text-[#4A3F35]">{s.name}</p>
                </button>
              ))}
            </div>
            {bookableServices.length === 0 && (
              <p className="font-body text-[#6B5D52]">لا توجد خدمات متاحة حالياً.</p>
            )}
            {errors.service && (
              <p className="mt-2 font-body text-sm text-red-500">{errors.service}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4A3F35] mb-4 sm:mb-6">
              اختاري التاريخ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {dateObjects.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setDate(dateStr)}
                    className={`p-4 rounded-2xl text-center border-2 transition-all duration-200 ${
                      date === dateStr
                        ? "border-salon-gold bg-salon-cream/50"
                        : "border-salon-cream-border hover:border-salon-gold/50"
                    }`}
                  >
                    <p className="font-body font-medium text-[#4A3F35]">
                      {format(d, "EEE", { locale: ar })}
                    </p>
                    <p className="font-display text-2xl text-[#4A3F35] mt-1">
                      {format(d, "d")}
                    </p>
                    <p className="font-body text-xs text-[#6B5D52]">
                      {format(d, "MMM", { locale: ar })}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.date && (
              <p className="mt-2 font-body text-sm text-red-500">{errors.date}</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4A3F35] mb-4 sm:mb-6">
              اختاري الوقت
            </h2>
            {loadingSlots ? (
              <p className="font-body text-[#6B5D52]">جاري تحميل الأوقات...</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.disabled}
                    onClick={() => !slot.disabled && setTime(slot.time)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      slot.disabled
                        ? "bg-salon-cream/30 text-salon-cream-border cursor-not-allowed"
                        : time === slot.time
                        ? "border-2 border-salon-gold bg-salon-cream/50 text-[#4A3F35]"
                        : "border-2 border-salon-cream-border hover:border-salon-gold/50 text-[#6B5D52]"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
            {errors.time && (
              <p className="mt-2 font-body text-sm text-red-500">{errors.time}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4A3F35] mb-4 sm:mb-6">
              بياناتكِ
            </h2>
            <Input
              label="الاسم الكامل"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="أدخلي اسمكِ الكامل"
              error={errors.customerName}
            />
            <Input
              label="رقم الجوال"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+972 5X XXX XXXX"
              error={errors.customerPhone}
            />
            <Input
              label="البريد الإلكتروني (اختياري)"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="example@email.com"
            />
            <div className="rounded-xl border-2 border-[#E8DDD4]/60 bg-white/50 p-4">
              <label className="flex cursor-pointer items-center gap-3 font-body text-[#4A3F35]">
                <input
                  type="checkbox"
                  checked={phoneNotificationsConsent}
                  onChange={(e) => setPhoneNotificationsConsent(e.target.checked)}
                  className="h-4 w-4 rounded border-[#C9A882] text-[#C9A882] focus:ring-[#C9A882]"
                />
                <span>أرغب في استلام تحديثات الموعد على هاتفي (واتساب / رسالة نصية)</span>
              </label>
            </div>
            <Textarea
              label="ملاحظات (اختياري)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي طلبات خاصة أو حساسية..."
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4A3F35] mb-4 sm:mb-6">
              تأكيد الحجز
            </h2>
            {submitState.error && (
              <p className="font-body text-sm text-red-500 p-4 bg-red-50 rounded-xl">
                {submitState.error}
              </p>
            )}
            <div className="p-6 rounded-2xl bg-salon-cream/50 border border-salon-cream-border space-y-3 text-right">
              <p>
                <span className="text-[#6B5D52]">الخدمات:</span> {servicesLabel}
              </p>
              <p>
                <span className="text-[#6B5D52]">التاريخ:</span>{" "}
                {date && format(new Date(date), "EEEE d MMMM yyyy", { locale: ar })}
              </p>
              <p>
                <span className="text-[#6B5D52]">الوقت:</span> {time}
              </p>
              <p>
                <span className="text-[#6B5D52]">الاسم:</span> {customerName}
              </p>
              <p>
                <span className="text-[#6B5D52]">الجوال:</span> {customerPhone}
              </p>
              {notes && (
                <p>
                  <span className="text-[#6B5D52]">ملاحظات:</span> {notes}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between flex-row-reverse gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className={step === 1 ? "invisible" : ""}
          >
            السابق
            <ChevronRight size={18} className="mr-1" />
          </Button>
          <button
            onClick={handleNext}
            className="px-10 py-5 bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full hover:shadow-2xl hover:shadow-salon-gold/30 transition-all duration-500 font-body font-medium text-lg hover:scale-105"
          >
            {step === 5 ? "تأكيد الحجز" : "التالي"}
            <ChevronLeft size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
