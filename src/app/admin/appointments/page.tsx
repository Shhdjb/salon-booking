import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { AppointmentsList } from "./AppointmentsList";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

const STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

type Search = {
  date?: string;
  status?: string;
  q?: string;
  userId?: string;
};

function buildWhere(search: Search): Prisma.AppointmentWhereInput {
  const where: Prisma.AppointmentWhereInput = {};

  if (search.date && /^\d{4}-\d{2}-\d{2}$/.test(search.date)) {
    where.date = search.date;
  }

  if (
    search.status &&
    search.status !== "all" &&
    (STATUSES as readonly string[]).includes(search.status)
  ) {
    where.status = search.status as Prisma.AppointmentWhereInput["status"];
  }

  if (search.userId?.trim()) {
    where.userId = search.userId.trim();
  }

  if (search.q?.trim()) {
    const term = search.q.trim();
    const compact = term.replace(/\s/g, "");
    where.OR = [
      { customerName: { contains: term, mode: "insensitive" } },
      { phone: { contains: compact } },
    ];
  }

  return where;
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const date = typeof sp.date === "string" ? sp.date : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const userId = typeof sp.userId === "string" ? sp.userId : undefined;

  const filters: Search = { date, status, q, userId };
  const where = buildWhere(filters);

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      service: true,
      user: { select: { id: true, name: true, phone: true, email: true } },
      lines: { orderBy: { sortOrder: "asc" }, include: { service: true } },
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    take: 500,
  });

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#4A3F35]">
            المواعيد
          </h1>
          <p className="mt-1 font-body text-[#6B5D52]">
            إدارة الحجوزات — تصفية وبحث
          </p>
        </div>
        <Link
          href="/admin/calendar"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#C9A882]/40 bg-white px-5 py-3 font-body text-sm font-medium text-[#4A3F35] shadow-sm hover:bg-[#F8F4EF]"
        >
          <CalendarDays size={20} className="text-[#C9A882]" />
          عرض التقويم
        </Link>
      </div>

      <AppointmentsList
        initialAppointments={appointments}
        filters={{
          date: date ?? "",
          status: status ?? "all",
          q: q ?? "",
          userId: userId ?? "",
        }}
      />
    </div>
  );
}
