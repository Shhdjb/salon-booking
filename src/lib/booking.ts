import {
  add,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
} from "date-fns";
import { getAppointments, getBlockedSlots } from "@/data/appointments";
import { services } from "@/data/services";

const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;
const SLOT_INTERVAL = 30; // minutes

export function getAvailableDates(startDate: Date, daysAhead: number): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < daysAhead; i++) {
    dates.push(add(startDate, { days: i }));
  }
  return dates;
}

export function getTimeSlots(
  date: Date,
  serviceDuration: number
): { time: string; disabled: boolean }[] {
  const dateStr = format(date, "yyyy-MM-dd");
  const appointments = getAppointments().filter(
    (a) => a.date === dateStr && a.status !== "cancelled"
  );
  const blocked = getBlockedSlots().filter((b) => b.date === dateStr);

  const slots: { time: string; disabled: boolean }[] = [];
  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_INTERVAL) {
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      const slotStart = parse(time, "HH:mm", date);
      const slotEnd = add(slotStart, { minutes: serviceDuration });

      const isBlocked = blocked.some((b) => {
        const blockStart = parse(b.startTime, "HH:mm", date);
        const blockEnd = parse(b.endTime, "HH:mm", date);
        return (
          (isAfter(slotStart, blockStart) && isBefore(slotStart, blockEnd)) ||
          (isAfter(slotEnd, blockStart) && isBefore(slotEnd, blockEnd)) ||
          (isBefore(slotStart, blockStart) && isAfter(slotEnd, blockEnd))
        );
      });

      const overlapsAppointment = appointments.some((a) => {
        const aptStart = parse(a.time, "HH:mm", date);
        const aptService = services.find((s) => s.id === a.serviceId);
        const aptDuration = aptService?.duration ?? 60;
        const aptEnd = add(aptStart, { minutes: aptDuration });
        return (
          (isAfter(slotStart, aptStart) && isBefore(slotStart, aptEnd)) ||
          (isAfter(slotEnd, aptStart) && isBefore(slotEnd, aptEnd)) ||
          (isBefore(slotStart, aptStart) && isAfter(slotEnd, aptEnd))
        );
      });

      const now = new Date();
      const isPast = isBefore(slotStart, now) && isSameDay(date, now);

      slots.push({
        time,
        disabled: isBlocked || overlapsAppointment || isPast,
      });
    }
  }

  return slots;
}
