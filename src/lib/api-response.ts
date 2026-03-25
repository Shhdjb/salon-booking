import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export const ApiCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  BAD_REQUEST: "BAD_REQUEST",
  RATE_LIMIT: "RATE_LIMIT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiValidationIssue = { path: string[]; message: string };

export type ApiErrorPayload = {
  ok: false;
  error: string;
  code: string;
  issues?: ApiValidationIssue[];
};

function buildError(
  message: string,
  code: string,
  status: number,
  extra?: {
    issues?: ApiValidationIssue[];
    headers?: HeadersInit;
    log?: unknown;
  }
): NextResponse<ApiErrorPayload> {
  if (extra?.log !== undefined) {
    console.error(`[api ${code}]`, extra.log);
  }
  const body: ApiErrorPayload = { ok: false, error: message, code };
  if (extra?.issues?.length) body.issues = extra.issues;
  return NextResponse.json(body, { status, headers: extra?.headers });
}

export function jsonUnauthorized(message = "غير مصرح بالدخول", log?: unknown) {
  return buildError(message, ApiCode.UNAUTHORIZED, 401, { log });
}

export function jsonForbidden(message = "ليس لديك صلاحية لهذا الإجراء", log?: unknown) {
  return buildError(message, ApiCode.FORBIDDEN, 403, { log });
}

export function jsonNotFound(message = "غير موجود", log?: unknown) {
  return buildError(message, ApiCode.NOT_FOUND, 404, { log });
}

export function jsonConflict(message: string, log?: unknown) {
  return buildError(message, ApiCode.CONFLICT, 409, { log });
}

export function jsonBadRequest(message: string, log?: unknown) {
  return buildError(message, ApiCode.BAD_REQUEST, 400, { log });
}

export function jsonValidationError(
  message = "بيانات غير صحيحة",
  zodError?: ZodError,
  log?: unknown
) {
  const issues: ApiValidationIssue[] | undefined = zodError?.issues.map((i) => ({
    path: i.path.map(String),
    message: i.message,
  }));
  return buildError(message, ApiCode.VALIDATION_ERROR, 400, { issues, log });
}

export function jsonInternal(message = "حدث خطأ في الخادم", log?: unknown) {
  return buildError(message, ApiCode.INTERNAL_ERROR, 500, { log });
}

/**
 * Generic error response. Prefer specific helpers above when possible.
 * Preserves `error` string for existing clients (`data.error`).
 */
export function jsonError(
  message: string,
  status: number,
  options?: {
    headers?: HeadersInit;
    code?: string;
    issues?: ApiValidationIssue[];
    log?: unknown;
  }
) {
  const inferred =
    status === 401
      ? ApiCode.UNAUTHORIZED
      : status === 403
        ? ApiCode.FORBIDDEN
        : status === 404
          ? ApiCode.NOT_FOUND
          : status === 409
            ? ApiCode.CONFLICT
            : status === 429
              ? ApiCode.RATE_LIMIT
              : status >= 500
                ? ApiCode.INTERNAL_ERROR
                : ApiCode.BAD_REQUEST;
  return buildError(message, options?.code ?? inferred, status, {
    issues: options?.issues,
    headers: options?.headers,
    log: options?.log,
  });
}

export function jsonTooManyRequests(retryAfterSec: number) {
  return buildError(
    "طلبات كثيرة جداً. حاولي لاحقاً.",
    ApiCode.RATE_LIMIT,
    429,
    { headers: { "Retry-After": String(retryAfterSec) } }
  );
}

export async function parseJsonBody<T>(
  req: Request
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse<ApiErrorPayload> }> {
  try {
    const data = (await req.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, response: jsonBadRequest("جسم الطلب غير صالح (JSON)") };
  }
}
