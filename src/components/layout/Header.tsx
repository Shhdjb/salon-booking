"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone, User, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/services", label: "الخدمات" },
  { href: "/#gallery", label: "المعرض" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
];

export function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <nav
        className={`transition-all duration-300 ease-out ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-[#E8DDD4]/40"
            : "bg-white/30 backdrop-blur-md"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-14 xl:px-20">
          <div className="relative flex flex-row flex-nowrap items-center justify-between h-16 lg:h-[4.25rem] w-full">
            {/* Nav links - RTL right */}
            <div className="hidden lg:flex flex-1 items-center justify-start min-w-0">
              <div className="flex items-center gap-0.5">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group/link relative px-4 py-2 font-body text-[15px] font-medium transition-colors duration-200 ${
                      isScrolled ? "text-[#6B5D52] hover:text-[#C9A882]" : "text-[#5C5046] hover:text-[#C9A882]"
                    }`}
                  >
                    {item.label}
                    <span className="absolute bottom-0 inset-x-0 h-0.5 scale-x-0 bg-[#C9A882] transition-transform duration-300 origin-center group-hover/link:scale-x-100" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Logo - centered */}
            <Link
              href="/"
              className="flex-shrink-0 flex flex-col items-center mx-6 lg:mx-10"
            >
              <span
                className={`font-display text-2xl lg:text-[1.75rem] font-bold tracking-tight transition-colors ${
                  isScrolled ? "text-[#4A3F35]" : "text-[#4A3F35]"
                }`}
              >
                صالون شهد
              </span>
              <span
                className={`text-[10px] font-body tracking-[0.35em] mt-0.5 transition-colors ${
                  isScrolled ? "text-[#C9A882]" : "text-[#C9A882]/90"
                }`}
              >
                SALON SHAHD
              </span>
            </Link>

            {/* CTA + auth - RTL left */}
            <div className="flex flex-1 items-center justify-end min-w-0 gap-2">
              {status === "authenticated" ? (
                <>
                  <Link href="/profile" className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm text-salon-brown-muted hover:text-salon-gold transition-colors">
                    <User className="w-4 h-4" />
                    حسابي
                  </Link>
                  {session?.user?.role === "ADMIN" && (
                    <Link href="/admin" className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm text-salon-brown-muted hover:text-salon-gold transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      لوحة التحكم
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm text-salon-brown-muted hover:text-salon-gold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden lg:inline-flex px-4 py-2 rounded-full font-body text-sm text-salon-brown-muted hover:text-salon-gold transition-colors">
                    تسجيل الدخول
                  </Link>
                  <Link href="/register" className="hidden lg:inline-flex px-4 py-2 rounded-full font-body text-sm text-salon-brown-muted hover:text-salon-gold transition-colors">
                    إنشاء حساب
                  </Link>
                </>
              )}
              <Link href="/book" className="hidden lg:inline-flex">
                <span
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm font-medium transition-all duration-200 ${
                    isScrolled
                      ? "bg-[#C9A882] text-white hover:bg-[#B8956F]"
                      : "bg-white/70 text-[#5C5046] border border-[#E8DDD4]/60 hover:bg-[#C9A882] hover:text-white hover:border-transparent"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  احجزي موعدك
                </span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-3 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${isScrolled ? "text-[#6B5D52] hover:text-[#C9A882]" : "text-[#5C5046] hover:text-[#C9A882]"}`}
                aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-[#E8DDD4]/40 bg-white/95 backdrop-blur-xl"
            >
              <div className="px-6 py-6 space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-4 min-h-[48px] flex items-center justify-center font-body text-[#6B5D52] hover:text-[#C9A882] font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 space-y-2">
                  {status === "authenticated" ? (
                    <>
                      <Link href="/profile" className="flex items-center justify-center gap-2 w-full py-4 font-body font-medium text-salon-brown" onClick={() => setIsMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        حسابي
                      </Link>
                      {session?.user?.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center justify-center gap-2 w-full py-4 font-body font-medium text-salon-brown" onClick={() => setIsMenuOpen(false)}>
                          <LayoutDashboard className="w-4 h-4" />
                          لوحة التحكم
                        </Link>
                      )}
                      <button onClick={() => { signOut({ callbackUrl: "/" }); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full py-4 font-body font-medium text-salon-brown-muted">
                        <LogOut className="w-4 h-4" />
                        خروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block py-4 text-center font-body text-salon-brown-muted" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
                      <Link href="/register" className="block py-4 text-center font-body text-salon-brown-muted" onClick={() => setIsMenuOpen(false)}>إنشاء حساب</Link>
                    </>
                  )}
                  <Link href="/book" className="flex items-center justify-center gap-2 w-full py-4 min-h-[48px] bg-[#C9A882] text-white rounded-full font-body font-medium" onClick={() => setIsMenuOpen(false)}>
                    <Phone className="w-4 h-4" />
                    احجزي موعدك
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
