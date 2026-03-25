"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function CTASection() {
  return (
    <section id="contact" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#F2EBE3] via-[#F8F4EF] to-[#FDF9F4] relative overflow-hidden">
      <motion.div
        className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-[#C9A882]/25 to-transparent rounded-full blur-[110px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-gradient-to-tl from-[#D4B896]/22 to-transparent rounded-full blur-[100px]"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.5, 0.95, 0.5] }}
        transition={{ duration: 11, repeat: Infinity }}
      />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9A882 1px, transparent 0)", backgroundSize: "48px 48px" }} aria-hidden />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block mb-4 sm:mb-6 md:mb-8">
            <motion.div className="inline-flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-xl shadow-[#C9A882]/10 border border-white/50" whileHover={{ scale: 1.05 }}>
              <span className="text-[#C9A882] font-body font-medium tracking-wide">تواصل معنا</span>
            </motion.div>
          </motion.div>
          <motion.h3 initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8">
            <span className="bg-gradient-to-l from-[#4A3F35] via-[#6B5744] to-[#4A3F35] bg-clip-text text-transparent">احجزي موعدك الآن</span>
          </motion.h3>
          <motion.p initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="font-body text-base sm:text-lg md:text-xl text-[#8B7355] max-w-3xl mx-auto leading-relaxed px-2">
            نحن في انتظارك لتقديم أفضل تجربة جمالية
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-14 shadow-xl border border-white/50"
          >
            <div className="text-center">
              <p className="font-body text-[#8B7355] mb-8 leading-relaxed">احجزي موعدكِ بسهولة عبر صفحة الحجز</p>
              <Link href="/book">
                <motion.span
                  className="relative inline-block w-full py-4 sm:py-5 min-h-[48px] flex items-center justify-center bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium text-base sm:text-lg text-center overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                  <span className="relative z-10">احجزي الآن</span>
                </motion.span>
              </Link>
            </div>
          </motion.div>

          <div className="space-y-4 sm:space-y-6">
            {[
              { href: "https://www.google.com/maps/search/ام+الفحم+حارة+الجبارين", icon: MapPin, title: "العنوان", content: "ام الفحم حارة الجبارين", dir: undefined },
              { href: "tel:+972523113828", icon: Phone, title: "الهاتف", content: "052-311-3828", dir: "ltr" as const },
              { href: "mailto:Arefajbareen3@gmail.com", icon: Mail, title: "البريد الإلكتروني", content: "Arefajbareen3@gmail.com", dir: undefined },
            ].map((item, i) => (
              <motion.a
                key={i}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 block min-h-[48px]"
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(201, 168, 130, 0.3)" }}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#C9A882] to-[#B8956F] rounded-2xl flex items-center justify-center text-white">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-[#4A3F35] mb-2 text-lg">{item.title}</h4>
                    <p className="font-body text-[#8B7355] leading-relaxed" dir={item.dir}>{item.content}</p>
                  </div>
                </div>
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-l from-[#C9A882] to-[#B8956F] rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-xl"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-body font-semibold text-white mb-2 text-lg">أوقات العمل</h4>
                  <p className="font-body text-white/95">السبت – الخميس: ٩ ص – ٩ م</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
