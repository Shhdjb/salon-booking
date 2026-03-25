import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import {
  jsonUnauthorized,
  jsonValidationError,
  jsonNotFound,
  jsonBadRequest,
  parseJsonBody,
} from "@/lib/api-response";

const bodySchema = z.object({
  completedAppointmentsCount: z.coerce.number().int().min(0).max(500),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const { id } = await params;

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = bodySchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("بيانات غير صحيحة", parsed.error);
  }

  const { completedAppointmentsCount } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, name: true },
  });

  if (!user) {
    return jsonNotFound("المستخدم غير موجود");
  }

  if (user.role !== "CLIENT") {
    return jsonBadRequest("يمكن تعديل بطاقة الولاء للعملاء فقط");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { completedAppointmentsCount },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      completedAppointmentsCount: true,
    },
  });

  await logAdminAction(
    {
      action: "user.loyalty_count.update",
      entity: "user",
      entityId: id,
      adminUserId: session.user.id,
      details: { completedAppointmentsCount },
    },
    req
  );

  return NextResponse.json({ success: true, user: updated });
}
