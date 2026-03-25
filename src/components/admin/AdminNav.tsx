"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Scissors,
  Clock,
  Ban,
  Settings,
  LogOut,
  Users,
  Bell,
  ImageIcon,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/clients", label: "العملاء والولاء", icon: Users },
  { href: "/admin/appointments", label: "المواعيد", icon: Calendar },
  { href: "/admin/calendar", label: "التقويم", icon: CalendarDays },
  { href: "/admin/notifications", label: "سجل الإشعارات", icon: Bell },
  { href: "/admin/services", label: "الخدمات", icon: Scissors },
  { href: "/admin/working-hours", label: "أوقات العمل", icon: Clock },
  { href: "/admin/blocked", label: "الأوقات المحجوزة", icon: Ban },
  { href: "/admin/gallery", label: "معرض الصور", icon: ImageIcon },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-64 lg:w-72 bg-white border-l border-[#E8DDD4] shadow-lg z-40">
      <div className="p-6 border-b border-[#E8DDD4]">
        <Link href="/admin" className="block">
          <h1 className="font-display text-xl font-bold text-[#4A3F35]">
            صالون شهد
          </h1>
          <p className="text-xs text-[#C9A882] tracking-widest mt-0.5">
            لوحة التحكم
          </p>
        </Link>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#C9A882]/15 text-[#C9A882]"
                  : "text-[#6B5D52] hover:bg-[#F8F4EF]"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-[#E8DDD4]">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-[#6B5D52] hover:bg-[#F8F4EF] mb-2"
        >
          العودة للموقع
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-body text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
