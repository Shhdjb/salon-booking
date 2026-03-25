import {
  add,
  format,
  isAfter,
  isBefore,
  parse,
} from "date-fns";
import { prisma } from "@/lib/db";
import {
  getBufferMinutesForCalendar,
  intervalsFromAppointments,
  intervalOverlaps,
  timeToMinutes,
} from "@/lib/booking-engine";

const SLOT_INTERVAL = 30; // minutes

export async function getWorkingHours() {
  const hours = await prisma.workingHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  return hours;
}

export async function getBlockedTimesForDate(dateStr: string) {
  return prisma.blockedTime.findMany({
    where: { date: dateStr },
  });
}

export async function getAppointmentsForDate(dateStr: string) {
  return prisma.appointment.findMany({
    where: {
      date: dateStr,
      status: { not: "cancelled" },
    },
    include: { service: true },
  });
}

export async function getAvailableDates(
  startDate: Date,
  daysAhead: number
): Promise<Date[]> {
  const dates: Date[] = [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  for (let i = 0; i < daysAhead; i++) {
    const d = add(startDate, { days: i });
    if (!isBefore(d, todayStart)) {
      dates.push(d);
    }
  }
  return dates;
}

export async function getTimeSlots(
  date: Date,
  serviceDurationMinutes: number
): Promise<{ time: string; disabled: boolean }[]> {
  const dateStr = format(date, "yyyy-MM-dd");
  const [appointments, blocked, bufferMinutes] = await Promise.all([
    getAppointmentsForDate(dateStr),
    getBlockedTimesForDate(dateStr),
    getBufferMinutesForCalendar(),
  ]);

  const occupied = intervalsFromAppointments(appointments, bufferMinutes);

  const workingHours = await getWorkingHours();
  const dayOfWeek = date.getDay();
  const dayConfig = workingHours.find((w) => w.dayOfWeek === dayOfWeek);

  const openHour = dayConfig?.isClosed
    ? 24
    : parseInt(dayConfig?.openTime?.split(":")[0] ?? "9", 10);
  const closeHour = dayConfig?.isClosed
    ? 0
    : parseInt(dayConfig?.closeTime?.split(":")[0] ?? "18", 10);

  const slots: { time: string; disabled: boolean }[] = [];
  const now = new Date();

  for (let hour = openHour; hour < closeHour; hour++) {
    for (let min = 0; min < 60; min += SLOT_INTERVAL) {
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      const slotStart = parse(time, "HH:mm", date);
      const slotEnd = add(slotStart, { minutes: serviceDurationMinutes });
      const startMin = timeToMinutes(time);
      const endMin = startMin + serviceDurationMinutes;

      const isBlocked = blocked.some((b) => {
        const blockStart = parse(b.startTime, "HH:mm", date);
        const blockEnd = parse(b.endTime, "HH:mm", date);
        return (
          (isAfter(slotStart, blockStart) && isBefore(slotStart, blockEnd)) ||
          (isAfter(slotEnd, blockStart) && isBefore(slotEnd, blockEnd)) ||
          (isBefore(slotStart, blockStart) && isAfter(slotEnd, blockEnd))
        );
      });

      const overlapsAppointment = intervalOverlaps(startMin, endMin, occupied);

      const slotStartFull = parse(`${dateStr} ${time}`, "yyyy-MM-dd HH:mm", new Date());
      const isPast = isBefore(slotStartFull, now);

      let outsideHours = false;
      if (dayConfig && !dayConfig.isClosed) {
        const openTime = parse(dayConfig.openTime, "HH:mm", slotStart);
        const closeTime = parse(dayConfig.closeTime, "HH:mm", slotStart);
        if (isBefore(slotStart, openTime) || isAfter(slotEnd, closeTime)) {
          outsideHours = true;
        }
      }

      slots.push({
        time,
        disabled:
          isBlocked ||
          overlapsAppointment ||
          isPast ||
          outsideHours ||
          Boolean(dayConfig?.isClosed),
      });
    }
  }

  return slots;
}
