import { prisma } from "@/lib/db";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { AdminCalendar } from "./AdminCalendar";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const view = sp.view === "week" ? "week" : "day";
  const rawDate = typeof sp.date === "string" ? sp.date : "";
  const anchorDate =
    rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : format(new Date(), "yyyy-MM-dd");

  const anchor = parseISO(anchorDate);
  let dates: string[];
  if (view === "day") {
    dates = [anchorDate];
  } else {
    const ws = startOfWeek(anchor, { weekStartsOn: 0 });
    const we = endOfWeek(anchor, { weekStartsOn: 0 });
    dates = eachDayOfInterval({ start: ws, end: we }).map((d) =>
      format(d, "yyyy-MM-dd")
    );
  }

  const appointments = await prisma.appointment.findMany({
    where: { date: { in: dates } },
    include: {
      service: true,
      lines: { orderBy: { sortOrder: "asc" }, include: { service: true } },
      user: { select: { name: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">
          تقويم المواعيد
        </h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          عرض يومي أو أسبوعي مع إجراءات سريعة
        </p>
      </div>
      <AdminCalendar
        view={view}
        anchorDate={anchorDate}
        dates={dates}
        initialAppointments={appointments}
      />
    </div>
  );
}
