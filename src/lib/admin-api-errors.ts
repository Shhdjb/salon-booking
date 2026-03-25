/**
 * Arabic messages for admin API calls from the browser (appointments, calendar, etc.).
 */

export type ParsedApiError = {
  ok?: boolean;
  success?: boolean;
  error?: string;
  code?: string;
  message?: string;
  unchanged?: boolean;
  /** Reminder run / cron JSON */
  scanned?: number;
  sent?: number;
  skipped?: number;
  details?: string[];
};

export async function parseAdminApiJson(res: Response): Promise<ParsedApiError> {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as ParsedApiError;
  } catch {
    return { error: text.slice(0, 200) };
  }
}

/** User-facing Arabic message for a failed admin API response. */
export function adminApiErrorMessage(res: Response, body: ParsedApiError): string {
  if (res.status === 401) {
    return "انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى";
  }
  if (res.status === 403) {
    return "ليس لديك صلاحية لتنفيذ هذا الإجراء";
  }
  if (res.status === 429) {
    return body.error?.trim() || "طلبات كثيرة جداً. حاولي لاحقاً.";
  }
  if (res.status >= 500) {
    return "حدث خطأ في الخادم، حاول مرة أخرى";
  }
  if (body.error?.trim()) {
    return body.error.trim();
  }
  return "فشل التحديث";
}

export const ADMIN_ACTION_DISABLED_TITLE =
  "يجب تسجيل الدخول كمسؤول لتنفيذ هذا الإجراء";
