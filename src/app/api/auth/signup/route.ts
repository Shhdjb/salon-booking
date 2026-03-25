import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import {
  jsonTooManyRequests,
  jsonValidationError,
  jsonConflict,
  jsonInternal,
  parseJsonBody,
} from "@/lib/api-response";

const phoneRegex = /^[\d\s\-+()]{9,22}$/;

const signupSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  phone: z.string().min(9, "رقم الجوال مطلوب").regex(phoneRegex, "أدخلي رقم جوال صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phoneNotificationsEnabled: z.boolean().optional().default(false),
  preferredNotificationChannel: z.enum(["SMS", "WHATSAPP"]).optional().nullable(),
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

    const { name, email, phone, password, phoneNotificationsEnabled, preferredNotificationChannel } =
      parsed.data;

    const emailToUse = email?.trim() || null;
    const phoneToUse = phone.trim();

    const existingByEmail = emailToUse
      ? await prisma.user.findUnique({ where: { email: emailToUse } })
      : null;
    const existingByPhone = await prisma.user.findFirst({ where: { phone: phoneToUse } });

    if (existingByEmail) {
      return jsonConflict("البريد الإلكتروني مستخدم مسبقاً");
    }
    if (existingByPhone) {
      return jsonConflict("رقم الجوال مستخدم مسبقاً");
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: emailToUse,
        phone: phoneToUse,
        passwordHash,
        role: "CLIENT",
        phoneNotificationsEnabled: phoneNotificationsEnabled ?? false,
        preferredNotificationChannel: preferredNotificationChannel || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError?.code === "P2002") {
      const target = prismaError.meta?.target?.[0];
      if (target === "phone") {
        return jsonConflict("رقم الجوال مستخدم مسبقاً");
      }
      if (target === "email") {
        return jsonConflict("البريد الإلكتروني مستخدم مسبقاً");
      }
    }
    return jsonInternal("حدث خطأ في التسجيل", error);
  }
}
