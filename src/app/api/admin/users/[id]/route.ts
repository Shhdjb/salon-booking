import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import {
  jsonUnauthorized,
  jsonForbidden,
  jsonNotFound,
  jsonBadRequest,
  jsonValidationError,
  jsonInternal,
  parseJsonBody,
} from "@/lib/api-response";

const patchSchema = z
  .object({
    archive: z.boolean().optional(),
    restore: z.boolean().optional(),
  })
  .refine((v) => !(v.archive && v.restore), {
    message: "اختيار واحد فقط: أرشفة أو استعادة",
  })
  .refine((v) => v.archive === true || v.restore === true, {
    message: "أرشفة أو استعادة مطلوب",
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
  if (id === session.user.id) {
    return jsonForbidden("لا يمكن تعديل حسابك الإداري من هنا");
  }

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = patchSchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.issues[0]?.message ?? "بيانات غير صحيحة", parsed.error);
  }

  const target = await prisma.user.findFirst({
    where: { id, role: "CLIENT" },
    select: { id: true, deletedAt: true },
  });
  if (!target) {
    return jsonNotFound("العميلة غير موجودة");
  }

  try {
    if (parsed.data.archive) {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await logAdminAction(
        {
          action: "user.soft_delete",
          entity: "user",
          entityId: id,
          adminUserId: session.user.id,
        },
        req
      );
      return NextResponse.json({ success: true, archived: true });
    }

    if (parsed.data.restore) {
      if (!target.deletedAt) {
        return jsonBadRequest("الحساب غير مؤرشف");
      }
      await prisma.user.update({
        where: { id },
        data: { deletedAt: null },
      });
      await logAdminAction(
        {
          action: "user.restore",
          entity: "user",
          entityId: id,
          adminUserId: session.user.id,
        },
        req
      );
      return NextResponse.json({ success: true, restored: true });
    }

    return jsonBadRequest("بيانات غير صحيحة");
  } catch (error) {
    console.error("[admin user patch]", error);
    return jsonInternal("فشل تحديث العميلة", error);
  }
}
