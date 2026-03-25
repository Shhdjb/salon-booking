"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth = pathname?.startsWith("/auth") || pathname === "/login" || pathname === "/register";

  if (isAdmin || isAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16 lg:pt-[4.25rem]">{children}</main>
      <Footer />
    </>
  );
}
