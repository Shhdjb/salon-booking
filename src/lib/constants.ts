/**
 * Salon Shahd - Application Constants
 */

// Loyalty tiers: 5 treatments = 20%, 10 treatments = 50%
export const LOYALTY_TIERS = [
  { minTreatments: 5, discountPercent: 20 },
  { minTreatments: 10, discountPercent: 50 },
] as const;

export const LOYALTY_TIER_1 = 5;
export const LOYALTY_TIER_2 = 10;
export const DISCOUNT_TIER_1 = 20;
export const DISCOUNT_TIER_2 = 50;

// Cancel rules: must cancel at least X hours before appointment
export const MIN_HOURS_BEFORE_CANCEL = 24;

// Appointment statuses
export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

// Statuses that count as "occupied" for slot availability
export const OCCUPIED_STATUSES = ["pending", "confirmed", "completed", "no_show"] as const;

// Statuses that count toward loyalty (completed only)
export const LOYALTY_COUNT_STATUS = "completed" as const;
