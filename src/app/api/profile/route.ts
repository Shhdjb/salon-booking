import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getLoyaltyInfo } from "@/lib/loyalty";
import { isValidPhone, normalizePhone } from "@/lib/phone-utils";
import { isValidEmail } from "@/lib/email-utils";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";
import {
  jsonUnauthorized,
  jsonForbidden,
  jsonNotFound,
  jsonBadRequest,
  jsonConflict,
  jsonValidationError,
  jsonInternal,
  parseJsonBody,
} from "@/lib/api-response";

const phoneRegex = /^[\d\s\-+()]{9,22}$/;
const updateProfileSchema = z.object({
  email: z.string().trim().min(1).email("بريد إلكتروني غير صحيح").optional(),
  phone: z.string().min(9, "رقم الجوال مطلوب").regex(phoneRegex, "أدخلي رقم جوال صحيح").optional(),
  phoneNotificationsEnabled: z.boolean().optional(),
  preferredNotificationChannel: z.enum(["WHATSAPP"]).nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonUnauthorized();
  }

  const [user, appointments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        deletedAt: true,
        name: true,
        email: true,
        phone: true,
        completedAppointmentsCount: true,
        loyaltyUnlockNotifiedPercent: true,
        phoneNotificationsEnabled: true,
        preferredNotificationChannel: true,
      },
    }),
    prisma.appointment.findMany({
      where: { userId: session.user.id, status: { not: "cancelled" } },
      include: {
        service: true,
        lines: { orderBy: { sortOrder: "asc" }, include: { service: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  if (!user) {
    return jsonNotFound("المستخدم غير موجود");
  }
  if (user.deletedAt) {
    return jsonForbidden("هذا الحساب غير متاح. تواصل مع الصالون.");
  }

  const today = new Date().toISOString().split("T")[0];
  const mapRow = (a: (typeof appointments)[0]) => {
    const serviceIds =
      a.lines.length > 0
        ? a.lines.map((l) => l.serviceId)
        : [a.serviceId];
    return {
      id: a.id,
      serviceName: formatAppointmentServiceNames({
        service: a.service,
        lines: a.lines.map((l) => ({
          sortOrder: l.sortOrder,
          service: l.service,
        })),
      }),
      serviceIds,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      originalPrice: a.originalPrice,
      finalPrice: a.finalPrice,
      discountApplied: a.discountPercent,
      completedAt: a.completedAt?.toISOString() ?? null,
      lastRescheduledAt: a.lastRescheduledAt?.toISOString() ?? null,
      canReschedule: a.status === "pending" || a.status === "confirmed",
    };
  };

  const upcoming = appointments.filter((a) => a.date >= today).map(mapRow);
  const past = appointments.filter((a) => a.date < today).map(mapRow);

  const loyalty = getLoyaltyInfo(user.completedAppointmentsCount);

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      completedAppointmentsCount: user.completedAppointmentsCount,
      loyaltyUnlockNotifiedPercent: user.loyaltyUnlockNotifiedPercent ?? 0,
      phoneNotificationsEnabled: user.phoneNotificationsEnabled ?? false,
      preferredNotificationChannel: user.preferredNotificationChannel,
    },
    loyalty,
    upcoming,
    past,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonUnauthorized();
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true },
  });
  if (me?.deletedAt) {
    return jsonForbidden("هذا الحساب غير متاح.");
  }

  const raw = await parseJsonBody<unknown>(req);
  if (!raw.ok) return raw.response;

  const parsed = updateProfileSchema.safeParse(raw.data);
  if (!parsed.success) {
    return jsonValidationError("بيانات غير صحيحة", parsed.error);
  }

  try {
    const { email, phone, phoneNotificationsEnabled, preferredNotificationChannel } = parsed.data;
    const updateData: {
      email?: string;
      phone?: string;
      phoneNotificationsEnabled?: boolean;
      preferredNotificationChannel?: "WHATSAPP" | null;
    } = {};
    if (email !== undefined) {
      const em = email.trim();
      if (!isValidEmail(em)) return jsonBadRequest("بريد إلكتروني غير صحيح");
      const taken = await prisma.user.findFirst({
        where: { email: em, NOT: { id: session.user.id } },
      });
      if (taken) return jsonConflict("البريد الإلكتروني مستخدم مسبقاً");
      updateData.email = em;
    }
    if (phone !== undefined) {
      if (!isValidPhone(phone)) return jsonBadRequest("رقم جوال غير صحيح");
      updateData.phone = normalizePhone(phone);
    }
    if (phoneNotificationsEnabled !== undefined) updateData.phoneNotificationsEnabled = phoneNotificationsEnabled;
    if (preferredNotificationChannel !== undefined)
      updateData.preferredNotificationChannel = preferredNotificationChannel;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return jsonInternal("حدث خطأ أثناء حفظ الملف", error);
  }
}
