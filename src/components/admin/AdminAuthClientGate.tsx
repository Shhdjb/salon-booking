"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side guard for /admin: catches expired sessions after the page was loaded.
 * Server layout already redirects; this avoids “active UI + failing API” until refresh.
 */
export function AdminAuthClientGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname() || "/admin";

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const q = `?callbackUrl=${encodeURIComponent(pathname)}`;
    router.replace(`/login${q}`);
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center px-6 font-body text-[#6B5D52]"
        dir="rtl"
      >
        جاري التحقق من الجلسة…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center font-body text-[#4A3F35]"
        dir="rtl"
      >
        <p className="text-lg font-medium">يجب تسجيل الدخول كمسؤول</p>
        <p className="text-sm text-[#6B5D52]">جاري التوجيه لتسجيل الدخول…</p>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center font-body"
        dir="rtl"
      >
        <p className="text-lg font-medium text-[#4A3F35]">
          ليس لديك صلاحية لتنفيذ هذا الإجراء
        </p>
        <button
          type="button"
          onClick={() => router.replace("/unauthorized")}
          className="rounded-xl bg-[#C9A882] px-6 py-2 text-sm font-medium text-white hover:bg-[#B8956F]"
        >
          متابعة
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
