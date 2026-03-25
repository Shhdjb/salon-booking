/**
 * Loyalty system logic
 * Rules: 5 treatments = 20% off, 10 treatments = 50% off
 * Only COMPLETED appointments count. No cancelled, no future.
 */

import { DISCOUNT_TIER_1, DISCOUNT_TIER_2, LOYALTY_TIER_1, LOYALTY_TIER_2 } from "./constants";

export type LoyaltyInfo = {
  completedCount: number;
  currentDiscount: number;
  nextTier: number | null;
  treatmentsUntilNextTier: number | null;
  loyaltyStatus: "none" | "tier1" | "tier2";
};

export function getDiscountForCount(completedCount: number): number {
  if (completedCount >= LOYALTY_TIER_2) return DISCOUNT_TIER_2;
  if (completedCount >= LOYALTY_TIER_1) return DISCOUNT_TIER_1;
  return 0;
}

export function getLoyaltyInfo(completedCount: number): LoyaltyInfo {
  const currentDiscount = getDiscountForCount(completedCount);

  let nextTier: number | null = null;
  let treatmentsUntilNextTier: number | null = null;
  let loyaltyStatus: LoyaltyInfo["loyaltyStatus"] = "none";

  if (completedCount >= LOYALTY_TIER_2) {
    loyaltyStatus = "tier2";
    nextTier = null;
    treatmentsUntilNextTier = null;
  } else if (completedCount >= LOYALTY_TIER_1) {
    loyaltyStatus = "tier1";
    nextTier = LOYALTY_TIER_2;
    treatmentsUntilNextTier = LOYALTY_TIER_2 - completedCount;
  } else {
    nextTier = LOYALTY_TIER_1;
    treatmentsUntilNextTier = LOYALTY_TIER_1 - completedCount;
  }

  return {
    completedCount,
    currentDiscount,
    nextTier,
    treatmentsUntilNextTier,
    loyaltyStatus,
  };
}

export function applyLoyaltyDiscount(originalPrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return originalPrice;
  return Math.round((originalPrice * (100 - discountPercent)) / 100 * 100) / 100;
}
