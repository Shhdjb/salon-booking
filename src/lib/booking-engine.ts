/**
 * Core booking rules: duration, buffer overlap, past slots.
 */

import { add, format, isBefore, parse } from "date-fns";
import type { Appointment } from "@prisma/client";
import { getAppointmentBufferMinutes, getIntraBookingServiceGapMinutes } from "@/lib/salon-settings";

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

export function minutesToHHmm(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function addMinutesToTime(hhmm: string, minutes: number, day: Date): string {
  const t = parse(hhmm, "HH:mm", day);
  return format(add(t, { minutes }), "HH:mm");
}

/** Total duration for multiple services including gaps between them. */
export function totalDurationForServices(
  durationsMinutes: number[],
  gapBetweenServices: number = getIntraBookingServiceGapMinutes()
): number {
  if (durationsMinutes.length === 0) return 0;
  const sum = durationsMinutes.reduce((a, b) => a + b, 0);
  const gaps = Math.max(0, durationsMinutes.length - 1) * gapBetweenServices;
  return sum + gaps;
}

export type OccupiedInterval = { startMin: number; endMin: number };

/** Build occupied intervals for a day including buffer after each appointment. */
export function intervalsFromAppointments(
  appointments: Pick<Appointment, "startTime" | "endTime">[],
  bufferAfterMinutes: number
): OccupiedInterval[] {
  return appointments.map((a) => ({
    startMin: timeToMinutes(a.startTime),
    endMin: timeToMinutes(a.endTime) + bufferAfterMinutes,
  }));
}

export function intervalOverlaps(
  startMin: number,
  endMin: number,
  occupied: OccupiedInterval[]
): boolean {
  return occupied.some(
    (o) => startMin < o.endMin && endMin > o.startMin
  );
}

export async function assertSlotNotInPast(
  dateStr: string,
  startTime: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const slotStart = parse(`${dateStr} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const now = new Date();
  if (isBefore(slotStart, now)) {
    return { ok: false, error: "لا يمكن الحجز في وقت مضى." };
  }
  return { ok: true };
}

export async function getBufferMinutesForCalendar(): Promise<number> {
  return getAppointmentBufferMinutes();
}
