import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toIsraeliMobileE164 } from "@/lib/phone-utils";
import { sendWhatsApp } from "@/lib/notifications/channels/whatsapp";
import {
  jsonUnauthorized,
  jsonForbidden,
  jsonBadRequest,
  parseJsonBody,
} from "@/lib/api-response";

const BODY = "Test WhatsApp from SALON SHAHD";

/** In production, set ALLOW_ADMIN_TEST_WHATSAPP=true to enable this route (admin-only). */
function isTestWhatsAppEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_ADMIN_TEST_WHATSAPP === "true";
}

/**
 * Dev / optional prod: isolate Twilio WhatsApp vs booking flow.
 * POST JSON: { "to": "+9725XXXXXXXX" } (or local 05… — will be normalized)
 * Requires ADMIN. Disabled in production unless ALLOW_ADMIN_TEST_WHATSAPP=true.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized("هذا المسار للإدارة فقط");
  }

  if (!isTestWhatsAppEnabled()) {
    return jsonForbidden(
      "مسار الاختبار معطّل في الإنتاج. لتفعيله مؤقتاً: ALLOW_ADMIN_TEST_WHATSAPP=true"
    );
  }

  const raw = await parseJsonBody<{ to?: string }>(req);
  if (!raw.ok) return raw.response;

  const rawTo = raw.data.to?.trim();
  if (!rawTo) {
    return jsonBadRequest('حقل "to" (رقم الجوال) مطلوب في JSON');
  }

  const normalized = toIsraeliMobileE164(rawTo);
  if (!normalized) {
    return jsonBadRequest("رقم جوال غير صالح — استخدمي 05XXXXXXXX أو +9725XXXXXXXX");
  }
  const result = await sendWhatsApp(normalized, BODY);

  return NextResponse.json({
    success: result.success,
    error: result.error ?? null,
    twilioMessageSid: result.twilioMessageSid ?? null,
  });
}
