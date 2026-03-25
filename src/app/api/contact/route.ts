import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonValidationError, jsonInternal, parseJsonBody } from "@/lib/api-response";

const contactSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  phone: z.string().optional(),
  message: z.string().min(10, "الرسالة مطلوبة"),
});

export async function POST(req: Request) {
  try {
    const raw = await parseJsonBody<unknown>(req);
    if (!raw.ok) return raw.response;

    const parsed = contactSchema.safeParse(raw.data);
    if (!parsed.success) {
      return jsonValidationError("بيانات غير صحيحة", parsed.error);
    }

    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return jsonInternal("حدث خطأ في إرسال الرسالة", error);
  }
}
