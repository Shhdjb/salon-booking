/**
 * Customer reschedule: same validation rules as new booking, excludes self from overlap.
 */

import { add, format, isAfter, isBefore, parse } from "date-fns";
import { prisma } from "@/lib/db";
import {
  totalDurationForServices,
  intervalsFromAppointments,
  intervalOverlaps,
  timeToMinutes,
  assertSlotNotInPast,
} from "@/lib/booking-engine";
import { getBlockedTimesForDate, getWorkingHours } from "@/lib/booking-server";
import {
  getAppointmentBufferMinutes,
  getIntraBookingServiceGapMinutes,
} from "@/lib/salon-settings";

export async function rescheduleCustomerAppointment(input: {
  appointmentId: string;
  userId: string;
  newDate: string;
  newStartTime: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { appointmentId, userId, newDate, newStartTime } = input;

  const apt = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId },
    include: {
      service: true,
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!apt) {
    return { ok: false, error: "الحجز غير موجود" };
  }

  if (apt.status !== "pending" && apt.status !== "confirmed") {
    return {
      ok: false,
      error: "إعادة الجدولة متاحة فقط للحجوزات قيد الانتظار أو المؤكدة.",
    };
  }

  const gap = getIntraBookingServiceGapMinutes();
  const totalDurationMins =
    apt.lines.length > 0
      ? totalDurationForServices(
          apt.lines.map((l) => l.durationMinutes),
          gap
        )
      : apt.service.duration;

  const pastCheck = await assertSlotNotInPast(newDate, newStartTime);
  if (!pastCheck.ok) {
    return { ok: false, error: pastCheck.error };
  }

  const slotStart = parse(`${newDate} ${newStartTime}`, "yyyy-MM-dd HH:mm", new Date());
  const endTimeDt = add(slotStart, { minutes: totalDurationMins });
  const endTimeStr = format(endTimeDt, "HH:mm");

  const workingHours = await getWorkingHours();
  const dayOfWeek = slotStart.getDay();
  const dayConfig = workingHours.find((w) => w.dayOfWeek === dayOfWeek);
  if (dayConfig?.isClosed) {
    return { ok: false, error: "الصالون مغلق في هذا اليوم." };
  }
  if (dayConfig) {
    const openTime = parse(dayConfig.openTime, "HH:mm", slotStart);
    const closeTime = parse(dayConfig.closeTime, "HH:mm", slotStart);
    if (isBefore(slotStart, openTime) || isAfter(endTimeDt, closeTime)) {
      return { ok: false, error: "هذا الوقت خارج ساعات العمل." };
    }
  }

  const blocked = await getBlockedTimesForDate(newDate);
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
    return { ok: false, error: "هذا الوقت غير متاح." };
  }

  const [others, bufferMinutes] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: newDate,
        status: { notIn: ["cancelled"] },
        id: { not: appointmentId },
      },
      select: { startTime: true, endTime: true, userId: true },
    }),
    getAppointmentBufferMinutes(),
  ]);

  const occupied = intervalsFromAppointments(others, bufferMinutes);
  const startMin = timeToMinutes(newStartTime);
  const endMin = startMin + totalDurationMins;
  if (intervalOverlaps(startMin, endMin, occupied)) {
    return { ok: false, error: "هذا الوقت غير متاح." };
  }

  const userOverlap = others.some(
    (o) =>
      o.userId === userId &&
      newStartTime < o.endTime &&
      endTimeStr > o.startTime
  );
  if (userOverlap) {
    return { ok: false, error: "لديكِ حجز آخر يتقاطع مع هذا الوقت." };
  }

  const prev = {
    date: apt.date,
    startTime: apt.startTime,
    endTime: apt.endTime,
  };

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        date: newDate,
        startTime: newStartTime,
        endTime: endTimeStr,
        lastRescheduledAt: new Date(),
        reminderSentAt: null,
      },
    });
    await tx.activityLog.create({
      data: {
        action: "CLIENT_RESCHEDULE",
        entity: "appointment",
        entityId: appointmentId,
        userId,
        details: JSON.stringify({
          from: prev,
          to: { date: newDate, startTime: newStartTime, endTime: endTimeStr },
        }),
      },
    });
  });

  return { ok: true };
}
