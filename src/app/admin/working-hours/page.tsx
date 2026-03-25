import { prisma } from "@/lib/db";
import { WorkingHoursForm } from "./WorkingHoursForm";

const dayNames: Record<number, string> = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

export default async function AdminWorkingHoursPage() {
  const hours = await prisma.workingHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  const defaultHours = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: i === 5,
  }));

  const merged = defaultHours.map((d) => {
    const existing = hours.find((h) => h.dayOfWeek === d.dayOfWeek);
    if (existing) {
      return {
        dayOfWeek: existing.dayOfWeek,
        openTime: existing.openTime,
        closeTime: existing.closeTime,
        isClosed: existing.isClosed,
      };
    }
    return d;
  });

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">
          أوقات العمل
        </h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          تحديد ساعات العمل لكل يوم
        </p>
      </div>

      <WorkingHoursForm hours={merged} />
    </div>
  );
}
