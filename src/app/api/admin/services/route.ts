import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import {
  jsonUnauthorized,
  jsonValidationError,
  jsonInternal,
  parseJsonBody,
} from "@/lib/api-response";

const createServiceSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  duration: z.number().min(5).max(480),
  price: z.number().min(0),
  category: z.string().min(1, "الفئة مطلوبة"),
  image: z.union([z.string().url(), z.literal("")]).optional(),
  isActive: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = createServiceSchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("بيانات غير صحيحة", parsed.error);
  }

  const { name, description, duration, price, category, image, isActive } = parsed.data;

  try {
    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price,
        category,
        image: image || null,
        isActive,
      },
    });

    await logAdminAction(
      {
        action: "service.create",
        entity: "service",
        entityId: service.id,
        adminUserId: session.user.id,
        details: { name, category },
      },
      req
    );

    return NextResponse.json(service);
  } catch (error) {
    console.error("Create service error:", error);
    return jsonInternal("حدث خطأ أثناء إنشاء الخدمة", error);
  }
}
