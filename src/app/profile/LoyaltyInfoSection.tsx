"use client";

import Link from "next/link";
import { Gift, CheckCircle2 } from "lucide-react";

export function LoyaltyInfoSection() {
  return (
    <div className="rounded-[2rem] border border-[#E8DDD4]/60 bg-[#F8F4EF]/50 p-8 md:p-10">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#C9A882]/20 flex items-center justify-center flex-shrink-0">
          <Gift className="w-6 h-6 text-[#C9A882]" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-[#4A3F35] mb-2">
            كيف تعمل بطاقة الولاء؟
          </h3>
          <p className="font-body text-[#6B5D52] leading-relaxed">
            كل جلسة تحضرينها وتُؤكّد من الإدارة تُضاف تلقائياً لبطاقتكِ. 
            التجميع مرتبط بحسابكِ فقط، ولا يُنقل بين الحسابات.
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex gap-3 items-start">
          <CheckCircle2 className="w-5 h-5 text-[#C9A882] flex-shrink-0 mt-0.5" />
          <p className="font-body text-[#4A3F35]">
            <strong>بعد 5 زيارات مكتملة</strong> — خصم 20% على حجزكِ القادم
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <CheckCircle2 className="w-5 h-5 text-[#C9A882] flex-shrink-0 mt-0.5" />
          <p className="font-body text-[#4A3F35]">
            <strong>بعد 10 زيارات مكتملة</strong> — خصم 50% على كل حجوزاتكِ
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-white/80 border border-[#C9A882]/30 text-center">
        <p className="font-display text-lg font-semibold text-[#4A3F35] mb-2">
          سجّلي واحجزي دوركِ عشان يكون إلك بطاقة
        </p>
        <p className="font-body text-sm text-[#6B5D52] mb-4">
          كل جلسة تحضرينها تُضاف لبطاقتكِ — احجزي موعدكِ القادم وواصلي التوفير
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium shadow-gold-soft hover:shadow-gold-glow transition-all duration-300"
        >
          احجزي موعدكِ
        </Link>
      </div>
    </div>
  );
}
