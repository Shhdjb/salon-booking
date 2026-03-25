import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
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

const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  duration: z.number().min(5).max(480).optional(),
  price: z.number().min(0).optional(),
  category: z.string().min(1).optional(),
  image: z.union([z.string().url(), z.literal("")]).nullable().optional(),
  isActive: z.boolean().optional(),
  restore: z.boolean().optional(),
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

  const parsed = updateServiceSchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("بيانات غير صحيحة", parsed.error);
  }

  const { restore, ...fields } = parsed.data;
  const data: Prisma.ServiceUpdateInput = {};
  if (fields.name !== undefined) data.name = fields.name;
  if (fields.description !== undefined) data.description = fields.description;
  if (fields.duration !== undefined) data.duration = fields.duration;
  if (fields.price !== undefined) data.price = fields.price;
  if (fields.category !== undefined) data.category = fields.category;
  if (fields.image !== undefined) data.image = fields.image === "" ? null : fields.image;
  if (fields.isActive !== undefined) data.isActive = fields.isActive;
  if (restore === true) data.deletedAt = null;

  try {
    const service = await prisma.service.update({
      where: { id },
      data,
    });

    await logAdminAction(
      {
        action: restore ? "service.restore" : "service.update",
        entity: "service",
        entityId: id,
        adminUserId: session.user.id,
        details: parsed.data,
      },
      req
    );

    return NextResponse.json(service);
  } catch (error) {
    console.error("Update service error:", error);
    return jsonInternal("حدث خطأ أثناء تحديث الخدمة", error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const { id } = await params;

  try {
    const service = await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await logAdminAction(
      {
        action: "service.soft_delete",
        entity: "service",
        entityId: id,
        adminUserId: session.user.id,
        details: {},
      },
      _req
    );

    return NextResponse.json({ success: true, softDeleted: true, service });
  } catch (error) {
    console.error("Soft-delete service error:", error);
    return jsonInternal("حدث خطأ أثناء أرشفة الخدمة", error);
  }
}
