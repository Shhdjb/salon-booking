/**
 * Phone validation and formatting for SALON SHAHD
 * Supports Israeli format: 05x-xxx-xxxx, +9725x-xxx-xxxx
 */

/** Allow formatted Israeli numbers including +972 with spaces/dashes (up to ~20 chars). */
const PHONE_REGEX = /^[\d\s\-+()]{9,22}$/;
const ISRAELI_PHONE_REGEX = /^(?:\+972|0)?5\d{8}$/;

/**
 * Israeli mobile in common stored shapes:
 * - 05XXXXXXXX (10 digits)
 * - 5XXXXXXXX (9 digits, national significant)
 * - +9725XXXXXXXX / 9725XXXXXXXX (12 digits after stripping +)
 */
export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!PHONE_REGEX.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 9 && digits.length <= 10) {
    return /^0?5\d{8}$/.test(digits) || /^5\d{8}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith("972")) {
    return /^9725\d{8}$/.test(digits);
  }
  return false;
}

/** E.164 for Israel: +9725XXXXXXXX (also accepts already-international input). */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+") && digits.startsWith("972")) {
    return `+${digits}`;
  }
  if (digits.startsWith("972")) return `+${digits}`;
  if (digits.startsWith("0")) return `+972${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("5")) return `+972${digits}`;
  return `+972${digits}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length === 12) {
    return `0${digits.slice(3, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 10 && digits.startsWith("05")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
