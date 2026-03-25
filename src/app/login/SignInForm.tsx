"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/book";

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: emailOrPhone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("البريد الإلكترونי أو كلمة المرور غير صحيحة");
      return;
    }

    const url = callbackUrl.startsWith("/") ? callbackUrl : "/book";
    router.push(url);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="البريد الإلكتروني أو رقم الجوال"
        type="text"
        value={emailOrPhone}
        onChange={(e) => setEmailOrPhone(e.target.value)}
        placeholder="example@email.com أو 05xxxxxxxx"
        required
      />
      <Input
        label="كلمة المرور"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && (
        <p className="font-body text-sm text-red-500 text-center">{error}</p>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? "جاري التحقق..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
