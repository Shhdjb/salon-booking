"use client";

import { Check, Sparkles } from "lucide-react";
import type { LoyaltyInfo } from "@/lib/loyalty";

interface LoyaltyCardProps {
  loyalty: LoyaltyInfo;
  /** Highest discount tier for which a LOYALTY_REWARD_UNLOCKED message was sent */
  loyaltyUnlockNotifiedPercent?: number;
}

const TOTAL_SLOTS = 10;

export function LoyaltyCard({
  loyalty,
  loyaltyUnlockNotifiedPercent = 0,
}: LoyaltyCardProps) {
  const { completedCount, currentDiscount, treatmentsUntilNextTier, loyaltyStatus } = loyalty;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#C9A882]/40 bg-gradient-to-br from-[#F8F4EF] via-[#F8F4EF] to-[#F5EDE4] shadow-premium p-8">
      {/* Decorative corner */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#C9A882]/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#D4B896]/10 blur-xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A882] to-[#B8956F] flex items-center justify-center shadow-gold-soft">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#4A3F35]">
              بطاقة الولاء
            </h2>
            <p className="font-body text-sm text-[#6B5D52] mt-0.5">
              صالون شهد
            </p>
          </div>
        </div>

        {/* 10 visual slots */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const slotNum = i + 1;
            const isCompleted = slotNum <= completedCount;
            const isMilestone5 = slotNum === 5;
            const isMilestone10 = slotNum === 10;

            return (
              <div
                key={slotNum}
                className={`
                  relative flex flex-col items-center justify-center aspect-square rounded-2xl
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-gradient-to-br from-[#C9A882] to-[#B8956F] text-white shadow-gold-soft"
                    : "bg-white/80 border-2 border-[#E8DDD4] text-[#6B5D52]"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 mb-1" strokeWidth={2.5} />
                ) : null}
                <span className={`font-body text-xs font-medium ${isCompleted ? "text-white/95" : "text-[#6B5D52]/70"}`}>
                  لقاء {slotNum}
                </span>
                {isMilestone5 && (
                  <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#C9A882] text-[9px] text-white flex items-center justify-center font-bold shadow-sm">
                    ٢٠٪
                  </span>
                )}
                {isMilestone10 && (
                  <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#C9A882] text-[9px] text-white flex items-center justify-center font-bold shadow-sm">
                    ٥٠٪
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Status message */}
        <div className="rounded-2xl p-5 bg-white/70 border border-[#E8DDD4]/60">
          {completedCount === 0 && (
            <p className="font-body text-[#4A3F35] text-center">
              <span className="font-semibold">ابدئي رحلتكِ معنا</span>
              <br />
              <span className="text-sm text-[#6B5D52]">
                احجزي أول موعدكِ وابدئي بجمع النقاط
              </span>
            </p>
          )}
          {completedCount > 0 && completedCount < 5 && (
            <p className="font-body text-[#4A3F35] text-center">
              <span className="font-semibold">رائع! {completedCount} من 5</span>
              <br />
              <span className="text-sm text-[#6B5D52]">
                {treatmentsUntilNextTier} جلسة للوصول لخصم 20%
              </span>
            </p>
          )}
          {loyaltyStatus === "tier1" && (
            <p className="font-body text-[#4A3F35] text-center">
              <span className="font-semibold text-[#C9A882]">مبروك! خصمكِ 20%</span>
              <br />
              <span className="text-sm text-[#6B5D52]">
                {treatmentsUntilNextTier} جلسة للوصول لخصم 50%
              </span>
            </p>
          )}
          {loyaltyStatus === "tier2" && (
            <p className="font-body text-[#4A3F35] text-center">
              <span className="font-semibold text-[#C9A882]">أعلى مستوى! خصم 50%</span>
              <br />
              <span className="text-sm text-[#6B5D52]">
                استمتعي بخصمكِ على كل الحجوزات
              </span>
            </p>
          )}
          {loyaltyUnlockNotifiedPercent > 0 && (
            <p className="mt-3 font-body text-xs text-[#6B5D52] text-center border-t border-[#E8DDD4]/60 pt-3">
              تم إرسال إشعار ترقية الولاء حتى خصم {loyaltyUnlockNotifiedPercent}% (مرة واحدة لكل
              مستوى).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
