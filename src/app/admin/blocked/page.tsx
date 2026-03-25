import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { BlockedTimesManager } from "./BlockedTimesManager";

export default async function AdminBlockedPage() {
  const blocked = await prisma.blockedTime.findMany({
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">
          الأوقات المحجوزة
        </h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          حجز أوقات غير متاحة للحجوزات
        </p>
      </div>

      <BlockedTimesManager initialBlocked={blocked} />
    </div>
  );
}
