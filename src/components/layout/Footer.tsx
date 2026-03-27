"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Heart } from "lucide-react";
import { useSession } from "next-auth/react";

const footerLinks = [
  { href: "/services", label: "الخدمات" },
  { href: "/#gallery", label: "المعرض" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
];

export function Footer() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  return (
    <footer className="bg-gradient-to-b from-[#4A3F35] to-[#3A302A] text-white pt-24 pb-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A882]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4B896]/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="text-right lg:col-span-2">
            <div className="mb-6">
              <h3 className="font-display text-4xl font-bold bg-gradient-to-l from-white to-white/90 bg-clip-text text-transparent mb-2">صالون شهد</h3>
              <p className="text-xs text-[#C9A882] font-body tracking-[0.25em]">SALON SHAHD</p>
            </div>
            <p className="font-body text-white/75 leading-[1.8] mb-8 max-w-md">
              وجهتك المثالية للحصول على تجربة جمالية فاخرة ومتكاملة. نجمع بين الخبرة العالمية والضيافة العربية الأصيلة.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#C9A882] transition-all duration-300 border border-white/5 hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="text-right">
            <h4 className="font-body font-semibold text-lg mb-6 text-white">روابط سريعة</h4>
            <ul className="space-y-4 font-body">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/75 hover:text-[#C9A882] transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link href="/admin" className="text-white/75 hover:text-[#C9A882] transition-colors duration-300">
                    لوحة التحكم
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="text-right">
            <h4 className="font-body font-semibold text-lg mb-6 text-white">معلومات التواصل</h4>
            <ul className="space-y-4 font-body text-white/75 leading-[1.7]">
              <li>ام الفحم حارة الجبارين </li>
              <li dir="ltr" className="text-right">+966 50 123 4567</li>
              <li>jbareenshhd65@gmail.com</li>
              <li>السبت – الخميس<br />٩ ص – ٩ م</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-10 mb-16 border border-white/10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-right">
              <h4 className="font-display text-2xl font-semibold text-white mb-3">اشتركي في نشرتنا البريدية</h4>
              <p className="font-body text-white/75 leading-[1.7]">احصلي على آخر العروض والأخبار مباشرة في بريدك</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="px-10 py-4 bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium whitespace-nowrap shadow-xl hover:shadow-[#C9A882]/30 transition-all duration-300"
              >
                اشتركي الآن
              </button>
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A882]/50 focus:border-transparent transition-all duration-300 font-body text-right text-white placeholder:text-white/50"
              />
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
            <p className="font-body text-white/60 text-sm">© {new Date().getFullYear()} صالون شهد. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-2 font-body text-white/60 text-sm">
              <Heart className="w-4 h-4 text-[#C9A882] fill-current" />
              <span> اهلا وسهلا بكم في صالون شهد</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
