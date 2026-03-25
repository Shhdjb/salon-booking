import { prisma } from "@/lib/db";

const CACHE_TTL_MS = 60_000;
let bufferCache: { value: number; at: number } | null = null;

/** Minutes between consecutive appointments on the calendar (cleanup / turnover). */
export async function getAppointmentBufferMinutes(): Promise<number> {
  const now = Date.now();
  if (bufferCache && now - bufferCache.at < CACHE_TTL_MS) {
    return bufferCache.value;
  }
  const row = await prisma.salonSettings.findUnique({
    where: { key: "appointment_buffer_minutes" },
  });
  const n = row ? parseInt(row.value, 10) : NaN;
  const value = Number.isFinite(n) && n >= 0 && n <= 120 ? n : 10;
  bufferCache = { value, at: now };
  return value;
}

/** Gap between services inside one booking (e.g. wash then style). */
export function getIntraBookingServiceGapMinutes(): number {
  return 5;
}
