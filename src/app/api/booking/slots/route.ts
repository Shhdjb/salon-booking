import { NextRequest, NextResponse } from "next/server";
import { getTimeSlots } from "@/lib/booking-server";
import {
  totalDurationForServices,
} from "@/lib/booking-engine";
import { getIntraBookingServiceGapMinutes } from "@/lib/salon-settings";
import { jsonBadRequest, jsonNotFound, jsonInternal } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const serviceId = req.nextUrl.searchParams.get("serviceId");
  const serviceIdsParam = req.nextUrl.searchParams.get("serviceIds");

  if (!date) {
    return jsonBadRequest("تاريخ اليوم مطلوب");
  }

  const ids = serviceIdsParam
    ? serviceIdsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : serviceId
      ? [serviceId]
      : [];

  if (ids.length === 0) {
    return jsonBadRequest("معرّف الخدمة أو الخدمات مطلوب");
  }

  try {
    const { prisma } = await import("@/lib/db");
    const services = await prisma.service.findMany({
      where: { id: { in: ids }, isActive: true, deletedAt: null },
    });
    if (services.length !== ids.length) {
      return jsonNotFound("إحدى الخدمات غير متوفرة أو غير نشطة");
    }

    const byId = new Map(services.map((s) => [s.id, s]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));

    const gap = getIntraBookingServiceGapMinutes();
    const durationMinutes = totalDurationForServices(
      ordered.map((s) => s.duration),
      gap
    );

    const slotDate = new Date(date);
    const slots = await getTimeSlots(slotDate, durationMinutes);

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Get slots error:", error);
    return jsonInternal("تعذر تحميل الأوقات المتاحة", error);
  }
}
