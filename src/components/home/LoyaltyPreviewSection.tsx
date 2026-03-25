"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Gift, Check } from "lucide-react";

export function LoyaltyPreviewSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#F8F4EF]/80 via-white/95 to-[#F8F4EF]/80 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A882]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4B896]/5 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] border border-[#E8DDD4]/60 bg-white/80 backdrop-blur-sm p-10 md:p-14 shadow-premium"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A882] to-[#B8956F] flex items-center justify-center shadow-gold-soft">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#4A3F35] mb-4">
                بطاقة الولاء
              </h3>
              <p className="font-body text-[#6B5D52] leading-relaxed mb-6">
                مع كل زيارة مكتملة، تقتربين من مكافأتكِ القادمة. التجميع مرتبط بحسابكِ فقط.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 justify-end">
                  <span className="font-body text-[#4A3F35]">بعد 5 زيارات — خصم 20٪</span>
                  <Check className="w-5 h-5 text-[#C9A882] flex-shrink-0" />
                </li>
                <li className="flex items-center gap-3 justify-end">
                  <span className="font-body text-[#4A3F35]">بعد 10 زيارات — خصم 50٪</span>
                  <Check className="w-5 h-5 text-[#C9A882] flex-shrink-0" />
                </li>
              </ul>
              <p className="font-body text-sm text-[#6B5D52] mb-6">
                سجّلي واحجزي دوركِ عشان يكون إلك بطاقة
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium shadow-gold-soft hover:shadow-gold-glow transition-all duration-300"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
