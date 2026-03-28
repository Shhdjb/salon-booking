import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { isValidPhone, normalizePhone } from "@/lib/phone-utils";
import {
  jsonTooManyRequests,
  jsonValidationError,
  jsonConflict,
  jsonBadRequest,
  jsonInternal,
  parseJsonBody,
} from "@/lib/api-response";

const phoneRegex = /^[\d\s\-+()]{9,22}$/;

const signupSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().trim().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
  phone: z.string().min(9, "رقم الجوال مطلوب").regex(phoneRegex, "أدخلي رقم جوال صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  /** JSON / clients sometimes send "true" as string — coerce. */
  phoneNotificationsEnabled: z.coerce.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const ip = clientIpFromHeaders(req.headers);
    const rl = await checkRateLimit(`signup:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.ok) {
      return jsonTooManyRequests(rl.retryAfterSec);
    }

    const raw = await parseJsonBody<unknown>(req);
    if (!raw.ok) return raw.response;

    const parsed = signupSchema.safeParse(raw.data);
    if (!parsed.success) {
      return jsonValidationError("بيانات غير صحيحة", parsed.error);
    }

    const { name, email, phone, password, phoneNotificationsEnabled } = parsed.data;

    const emailToUse = email.trim();
    const phoneRaw = phone.trim();
    if (!isValidPhone(phoneRaw)) {
      return jsonBadRequest("رقم الجوال غير صحيح — استخدمي صيغة إسرائيلية مثل 05xxxxxxxx");
    }
    const phoneE164 = normalizePhone(phoneRaw);

    const existingByEmail = await prisma.user.findFirst({ where: { email: emailToUse } });
    const existingByPhone = await prisma.user.findFirst({
      where: { phone: phoneE164 },
    });

    if (existingByEmail) {
      if (existingByEmail.deletedAt) {
        return jsonConflict(
          "هذا البريد مرتبط بحساب موقوف. تواصلي مع الصالون لاستعادته."
        );
      }
      return jsonConflict("البريد الإلكتروني مستخدم مسبقاً");
    }
    if (existingByPhone) {
      if (existingByPhone.deletedAt) {
        return jsonConflict(
          "رقم الجوال مرتبط بحساب موقوف. تواصلي مع الصالون لاستعادته."
        );
      }
      return jsonConflict("رقم الجوال مستخدم مسبقاً");
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: emailToUse,
        phone: phoneE164,
        passwordHash,
        role: "CLIENT",
        phoneNotificationsEnabled: phoneNotificationsEnabled ?? false,
        preferredNotificationChannel: phoneNotificationsEnabled ? "WHATSAPP" : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Signup error:", errMsg, error);
    const prismaError = error as { code?: string; meta?: { target?: string[] | string } };
    if (prismaError?.code === "P2002") {
      const raw = prismaError.meta?.target;
      const targets = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const t = targets.map(String).join(" ").toLowerCase();
      if (t.includes("phone")) {
        return jsonConflict("رقم الجوال مستخدم مسبقاً");
      }
      if (t.includes("email")) {
        return jsonConflict("البريد الإلكتروني مستخدم مسبقاً");
      }
      return jsonConflict("هذا البريد أو رقم الجوال مسجّل مسبقاً");
    }
    const devHint =
      process.env.NODE_ENV === "development"
        ? ` (تفاصيل للمطور: ${errMsg.slice(0, 200)})`
        : "";
    return jsonInternal(`حدث خطأ في التسجيل${devHint}`, error);
  }
}
