/**
 * Phone validation and formatting for SALON SHAHD
 * Supports Israeli format: 05x-xxx-xxxx, 5x-xxx-xxxx, +9725x…, 9725x… (with spaces/dashes)
 */

/** Allow formatted Israeli numbers including +972 with spaces/dashes (up to ~22 chars). */
const PHONE_REGEX = /^[\d\s\-+()]{9,22}$/;

/**
 * Parse common Israeli mobile shapes to E.164 (+9725XXXXXXXX).
 * Strips separators; handles 00 international prefix; does not guess invalid lengths.
 */
export function toIsraeliMobileE164(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 0) return null;

  while (digits.startsWith("00") && digits.length > 2) {
    digits = digits.slice(2);
  }

  if (digits.length === 12 && digits.startsWith("972")) {
    if (/^9725\d{8}$/.test(digits)) return `+${digits}`;
    return null;
  }

  if (digits.length === 10 && /^05\d{8}$/.test(digits)) {
    return `+972${digits.slice(1)}`;
  }

  if (digits.length === 9 && /^5\d{8}$/.test(digits)) {
    return `+972${digits}`;
  }

  return null;
}

/**
 * True if the string looks like a supported Israeli mobile (after normalization to E.164).
 */
export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!PHONE_REGEX.test(trimmed)) return false;
  return toIsraeliMobileE164(trimmed) !== null;
}

/**
 * Normalize to E.164 for Twilio WhatsApp. Call only after {@link isValidPhone} is true.
 */
export function normalizePhone(phone: string): string {
  const e164 = toIsraeliMobileE164(phone);
  if (!e164) {
    throw new Error(`normalizePhone: invalid Israeli mobile: ${JSON.stringify(phone)}`);
  }
  return e164;
}

export function formatPhoneDisplay(phone: string): string {
  const e164 = toIsraeliMobileE164(phone);
  const digits = e164 ? e164.replace(/\D/g, "") : phone.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length === 12) {
    return `0${digits.slice(3, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 10 && digits.startsWith("05")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
