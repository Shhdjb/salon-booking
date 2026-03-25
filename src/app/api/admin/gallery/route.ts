import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import { isCloudinaryConfigured, uploadGalleryImage } from "@/lib/media";
import {
  jsonUnauthorized,
  jsonBadRequest,
  jsonValidationError,
  jsonInternal,
  parseJsonBody,
} from "@/lib/api-response";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const title = (formData.get("title") as string | null)?.trim() || null;
  const alt = (formData.get("alt") as string | null)?.trim() || null;
  const sortOrderRaw = formData.get("sortOrder");
  const isPublishedRaw = formData.get("isPublished");

  const sortOrder = sortOrderRaw != null ? Number(sortOrderRaw) : 0;
  const isPublished = isPublishedRaw !== "false" && isPublishedRaw !== "0";

  if (!(file instanceof File) || file.size < 1) {
    return jsonBadRequest("ملف الصورة مطلوب");
  }

  if (!ALLOWED.has(file.type)) {
    return jsonBadRequest("يُسمح بـ JPEG و PNG و WebP و GIF فقط");
  }

  if (file.size > 5 * 1024 * 1024) {
    return jsonBadRequest("الحد الأقصى 5 ميجابايت");
  }

  if (process.env.NODE_ENV === "production" && !isCloudinaryConfigured()) {
    console.error("[gallery] production upload rejected: Cloudinary not configured");
    return jsonBadRequest(
      "في الإنتاج يجب ضبط Cloudinary لرفع المعرض (لا يُعتمد التخزين المحلي على الخادم)"
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, storageKey } = await uploadGalleryImage(buffer, file.type);

    const row = await prisma.galleryImage.create({
      data: {
        url,
        storageKey,
        title,
        alt: alt || title,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isPublished,
      },
    });

    await logAdminAction(
      {
        action: "gallery.create",
        entity: "gallery_image",
        entityId: row.id,
        adminUserId: session.user.id,
        details: { url, storageKey },
      },
      req
    );

    return NextResponse.json(row);
  } catch (error) {
    console.error("[gallery] upload failed", error);
    return jsonInternal("فشل رفع الصورة", error);
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(200).nullable().optional(),
  alt: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  restore: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = patchSchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("بيانات غير صحيحة", parsed.error);
  }

  const { id, restore, ...rest } = parsed.data;
  try {
    const data: Parameters<typeof prisma.galleryImage.update>[0]["data"] = { ...rest };
    if (restore === true) {
      data.deletedAt = null;
    }

    const row = await prisma.galleryImage.update({
      where: { id },
      data,
    });

    await logAdminAction(
      {
        action: restore ? "gallery.restore" : "gallery.update",
        entity: "gallery_image",
        entityId: id,
        adminUserId: session.user.id,
        details: parsed.data,
      },
      req
    );

    return NextResponse.json(row);
  } catch (error) {
    console.error("[gallery] patch failed", error);
    return jsonInternal("فشل تحديث الصورة", error);
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return jsonBadRequest("معرّف الصورة مطلوب");
  }

  try {
    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return jsonBadRequest("الصورة غير موجودة");
    }

    await prisma.galleryImage.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });

    await logAdminAction(
      {
        action: "gallery.soft_delete",
        entity: "gallery_image",
        entityId: id,
        adminUserId: session.user.id,
      },
      req
    );

    return NextResponse.json({ success: true, softDeleted: true });
  } catch (error) {
    console.error("[gallery] delete failed", error);
    return jsonInternal("فشل أرشفة الصورة", error);
  }
}
