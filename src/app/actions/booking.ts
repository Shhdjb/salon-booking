"use server";

import { add, format, parse, isBefore, isAfter } from "date-fns";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getDiscountForCount, applyLoyaltyDiscount } from "@/lib/loyalty";
import {
  getBlockedTimesForDate,
  getWorkingHours,
} from "@/lib/booking-server";
import {
  totalDurationForServices,
  intervalsFromAppointments,
  intervalOverlaps,
  timeToMinutes,
  assertSlotNotInPast,
} from "@/lib/booking-engine";
import {
  getAppointmentBufferMinutes,
  getIntraBookingServiceGapMinutes,
} from "@/lib/salon-settings";
import { isValidPhone, normalizePhone } from "@/lib/phone-utils";
import { checkRateLimit } from "@/lib/rate-limit";

const serviceIdsSchema = z.array(z.string().min(1)).min(1).max(15);

const createAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صحيح"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "وقت غير صحيح"),
  customerName: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(9, "رقم الجوال مطلوب"),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  phoneNotificationsConsent: z.boolean().optional().default(false),
});

export type CreateAppointmentState = {
  success?: boolean;
  error?: string;
  appointmentId?: string;
};

function parseServiceIdsFromForm(formData: FormData): string[] {
  const rawJson = formData.get("serviceIds") as string | null;
  const legacy = formData.get("serviceId") as string | null;
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as unknown;
      const r = serviceIdsSchema.safeParse(parsed);
      if (r.success) return r.data;
    } catch {
      /* ignore */
    }
  }
  if (legacy?.trim()) return [legacy.trim()];
  return [];
}

export async function createAppointment(
  _prevState: CreateAppointmentState,
  formData: FormData
): Promise<CreateAppointmentState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "يجب تسجيل الدخول للحجز" };
  }

  const rl = await checkRateLimit(`booking-create:${session.user.id}`, 40, 60 * 60 * 1000);
  if (!rl.ok) {
    return { error: "طلبات حجز كثيرة. حاولي لاحقاً بعد قليل." };
  }

  const serviceIds = parseServiceIdsFromForm(formData);
  if (serviceIds.length === 0) {
    return { error: "الخدمة مطلوبة" };
  }

  const raw = {
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    customerName: formData.get("customerName") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || "",
    notes: (formData.get("notes") as string) || "",
    phoneNotificationsConsent: formData.get("phoneNotificationsConsent") === "1",
  };

  const parsed = createAppointmentSchema.safeParse({
    ...raw,
    email: raw.email || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues?.[0];
    return { error: (first?.message as string) || "بيانات غير صحيحة" };
  }

  const { date, startTime, customerName, phone, email, notes, phoneNotificationsConsent } =
    parsed.data;

  if (!isValidPhone(phone)) {
    return { error: "رقم الجوال غير صحيح" };
  }
  const phoneE164 = normalizePhone(phone);

  const pastCheck = await assertSlotNotInPast(date, startTime);
  if (!pastCheck.ok) {
    return { error: pastCheck.error };
  }

  try {
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true, deletedAt: null },
    });
    if (services.length !== serviceIds.length) {
      return { error: "إحدى الخدمات غير متوفرة" };
    }
    const byId = new Map(services.map((s) => [s.id, s]));
    const ordered = serviceIds
      .map((id) => byId.get(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));

    const gap = getIntraBookingServiceGapMinutes();
    const totalDurationMins = totalDurationForServices(
      ordered.map((s) => s.duration),
      gap
    );

    const slotStart = parse(`${date} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
    const endTimeDt = add(slotStart, { minutes: totalDurationMins });
    const endTimeStr = format(endTimeDt, "HH:mm");

    const workingHours = await getWorkingHours();
    const dayOfWeek = slotStart.getDay();
    const dayConfig = workingHours.find((w) => w.dayOfWeek === dayOfWeek);
    if (dayConfig?.isClosed) {
      return { error: "الصالون مغلق في هذا اليوم. الرجاء اختيار تاريخ آخر." };
    }
    if (dayConfig) {
      const openTime = parse(dayConfig.openTime, "HH:mm", slotStart);
      const closeTime = parse(dayConfig.closeTime, "HH:mm", slotStart);
      if (isBefore(slotStart, openTime) || isAfter(endTimeDt, closeTime)) {
        return { error: "هذا الوقت خارج ساعات العمل. الرجاء اختيار وقت آخر." };
      }
    }

    const blocked = await getBlockedTimesForDate(date);
    const isBlocked = blocked.some((b) => {
      const blockStart = parse(b.startTime, "HH:mm", slotStart);
      const blockEnd = parse(b.endTime, "HH:mm", slotStart);
      return (
        (isAfter(slotStart, blockStart) && isBefore(slotStart, blockEnd)) ||
        (isAfter(endTimeDt, blockStart) && isBefore(endTimeDt, blockEnd)) ||
        (isBefore(slotStart, blockStart) && isAfter(endTimeDt, blockEnd))
      );
    });
    if (isBlocked) {
      return { error: "هذا الوقت غير متاح. الرجاء اختيار وقت آخر." };
    }

    const [appointmentsOnDate, bufferMinutes] = await Promise.all([
      prisma.appointment.findMany({
        where: { date, status: { notIn: ["cancelled"] } },
        select: { startTime: true, endTime: true, userId: true },
      }),
      getAppointmentBufferMinutes(),
    ]);

    const occupied = intervalsFromAppointments(appointmentsOnDate, bufferMinutes);
    const startMin = timeToMinutes(startTime);
    const endMin = startMin + totalDurationMins;
    if (intervalOverlaps(startMin, endMin, occupied)) {
      return { error: "هذا الوقت غير متاح. الرجاء اختيار وقت آخر." };
    }

    const userDoubleBook = appointmentsOnDate.some(
      (apt) =>
        apt.userId === session.user!.id &&
        startTime < apt.endTime &&
        endTimeStr > apt.startTime
    );
    if (userDoubleBook) {
      return { error: "لديكِ حجز مسبق يتقاطع مع هذا الوقت. الرجاء اختيار وقت آخر." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        deletedAt: true,
        completedAppointmentsCount: true,
        phoneNotificationsEnabled: true,
        preferredNotificationChannel: true,
      },
    });
    if (!user || user.deletedAt) {
      return { error: "الحساب غير متاح. تواصل مع الصالون." };
    }
    const completedCount = user.completedAppointmentsCount;
    const discountPercent = getDiscountForCount(completedCount);
    const originalPrice = ordered.reduce((sum, s) => sum + s.price, 0);
    const finalPrice = applyLoyaltyDiscount(originalPrice, discountPercent);

    const primaryServiceId = ordered[0]!.id;

    const appointment = await prisma.appointment.create({
      data: {
        serviceId: primaryServiceId,
        userId: session.user.id,
        date,
        startTime,
        endTime: endTimeStr,
        customerName,
        phone: phoneE164,
        email: email || null,
        notes: notes || null,
        status: "pending",
        originalPrice,
        finalPrice,
        discountPercent: discountPercent > 0 ? discountPercent : null,
        lines: {
          createMany: {
            data: ordered.map((s, i) => ({
              serviceId: s.id,
              durationMinutes: s.duration,
              unitPrice: s.price,
              sortOrder: i,
            })),
          },
        },
      },
    });

    const shouldNotify = phoneNotificationsConsent || user.phoneNotificationsEnabled;
    const channel = user.preferredNotificationChannel ?? "WHATSAPP";

    if (phoneNotificationsConsent && !user.phoneNotificationsEnabled) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneNotificationsEnabled: true,
          preferredNotificationChannel: channel,
        },
      });
    }

    console.log(
      "[salon-notify][booking-create] appointment created as pending — no confirmation message sent (admin must set مؤكد)",
      {
        appointmentId: appointment.id,
        serviceCount: ordered.length,
        phoneNotificationsSaved: shouldNotify,
        preferredChannel: channel,
      }
    );

    revalidatePath("/book");
    revalidatePath("/admin");
    revalidatePath("/profile");

    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    console.error("Create appointment error:", error);
    return { error: "حدث خطأ أثناء الحجز. الرجاء المحاولة لاحقاً." };
  }
}
