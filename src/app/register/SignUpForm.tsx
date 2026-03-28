"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    phoneNotificationsEnabled: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    const em = formData.email.trim();
    if (!em) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("أدخلي بريداً إلكترونياً صالحاً");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: em,
          phone: formData.phone,
          password: formData.password,
          phoneNotificationsEnabled: formData.phoneNotificationsEnabled,
        }),
      });

      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError("حدث خطأ في الاتصال");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "حدث خطأ غير متوقع");
        setLoading(false);
        return;
      }

      router.push("/login?callbackUrl=/book");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="الاسم الكامل"
        value={formData.name}
        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
        placeholder="أدخلي اسمكِ"
        required
      />
      <Input
        label="رقم الجوال"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
        placeholder="05xxxxxxxx"
        required
      />
      <Input
        label="البريد الإلكتروني"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
        placeholder="example@email.com"
        required
      />
      <div className="space-y-3 rounded-xl border-2 border-[#E8DDD4]/60 bg-white/50 p-4">
        <label className="flex cursor-pointer items-center gap-3 font-body text-[#4A3F35]">
          <input
            type="checkbox"
            checked={formData.phoneNotificationsEnabled}
            onChange={(e) => setFormData((f) => ({ ...f, phoneNotificationsEnabled: e.target.checked }))}
            className="h-4 w-4 rounded border-[#C9A882] text-[#C9A882] focus:ring-[#C9A882]"
          />
          <span>أرغب في استلام تحديثات الموعد على واتساب</span>
        </label>
      </div>
      <Input
        label="كلمة المرور"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
        placeholder="6 أحرف على الأقل"
        required
      />
      <Input
        label="تأكيد كلمة المرور"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData((f) => ({ ...f, confirmPassword: e.target.value }))
        }
        placeholder="أعدي إدخال كلمة المرور"
        required
      />
      {error && (
        <p className="font-body text-sm text-red-500 text-center">{error}</p>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? "جاري التسجيل..." : "إنشاء حساب"}
      </Button>
    </form>
  );
}
