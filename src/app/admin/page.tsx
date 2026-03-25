import { prisma } from "@/lib/db";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import Link from "next/link";
import {
  Calendar,
  Scissors,
  Users,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";

export default async function AdminOverviewPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

  const [
    appointmentsCount,
    servicesCount,
    todayBookingsCount,
    weekBookingsCount,
    todayAppointments,
    recentMessages,
    revenueTodayCompleted,
    revenueMonthCompleted,
    popularLineGroups,
    cancellationsMonth,
    newClientsThisWeek,
  ] = await Promise.all([
    prisma.appointment.count({ where: { status: { not: "cancelled" } } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.appointment.count({
      where: { date: today, status: { not: "cancelled" } } }),
    prisma.appointment.count({
      where: {
        date: { gte: weekStart, lte: weekEnd },
        status: { not: "cancelled" },
      },
    }),
    prisma.appointment.findMany({
      where: { date: today, status: { not: "cancelled" } },
      include: {
        service: true,
        lines: { orderBy: { sortOrder: "asc" }, include: { service: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.contactMessage.findMany({
      where: { read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.appointment.aggregate({
      where: { date: today, status: "completed" },
      _sum: { finalPrice: true },
    }),
    prisma.appointment.aggregate({
      where: {
        status: "completed",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { finalPrice: true },
    }),
    prisma.appointmentLine.groupBy({
      by: ["serviceId"],
      where: { appointment: { status: { not: "cancelled" } } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    prisma.appointment.count({
      where: {
        status: "cancelled",
        updatedAt: { gte: startOfMonth(now) },
      },
    }),
    prisma.user.count({
      where: { role: "CLIENT", createdAt: { gte: new Date(weekAgo) } },
    }),
  ]);

  const popularIds = popularLineGroups.map((g) => g.serviceId);
  const topServices = popularIds.length
    ? await prisma.service.findMany({
        where: { id: { in: popularIds } },
        select: { id: true, name: true },
      })
    : [];

  const revToday = revenueTodayCompleted._sum.finalPrice ?? 0;
  const revMonth = revenueMonthCompleted._sum.finalPrice ?? 0;

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">
          نظرة عامة
        </h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          مرحباً بكِ في لوحة تحكم صالون شهد
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A882]/15 flex items-center justify-center text-[#C9A882]">
              <Calendar size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {todayBookingsCount}
              </p>
              <p className="font-body text-sm text-[#6B5D52]">حجوزات اليوم</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A882]/10 flex items-center justify-center text-[#C9A882]">
              <Calendar size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {weekBookingsCount}
              </p>
              <p className="font-body text-sm text-[#6B5D52]">حجوزات هذا الأسبوع</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {revToday.toFixed(0)} ₪
              </p>
              <p className="font-body text-sm text-[#6B5D52]">
                إيراد اليوم (مكتمل)
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {revMonth.toFixed(0)} ₪
              </p>
              <p className="font-body text-sm text-[#6B5D52]">
                إيراد الشهر (مكتمل)
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
              <XCircle size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {cancellationsMonth}
              </p>
              <p className="font-body text-sm text-[#6B5D52]">
                إلغاءات هذا الشهر
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A882]/15 flex items-center justify-center text-[#C9A882]">
              <Users size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {newClientsThisWeek}
              </p>
              <p className="font-body text-sm text-[#6B5D52]">عملاء جدد (أسبوع)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A882]/15 flex items-center justify-center text-[#C9A882]">
              <Scissors size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {servicesCount}
              </p>
              <p className="font-body text-sm text-[#6B5D52]">خدمات نشطة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A882]/15 flex items-center justify-center text-[#C9A882]">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#4A3F35]">
                {appointmentsCount}
              </p>
              <p className="font-body text-sm text-[#6B5D52]">إجمالي حجوزات نشطة</p>
            </div>
          </div>
        </div>
      </div>

      {topServices.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50 mb-12">
          <h2 className="font-display text-xl font-bold text-[#4A3F35] mb-4 flex items-center gap-2">
            <TrendingUp size={22} />
            أكثر الخدمات طلباً (حسب بنود الحجز)
          </h2>
          <div className="flex flex-wrap gap-3">
            {topServices.map((s) => {
              const count =
                popularLineGroups.find((p) => p.serviceId === s.id)?._count
                  ?.id ?? 0;
              return (
                <span
                  key={s.id}
                  className="px-4 py-2 rounded-xl bg-[#F8F4EF]/80 font-body text-[#4A3F35]"
                >
                  {s.name} ({count})
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-[#4A3F35]">
              مواعيد اليوم
            </h2>
            <Link
              href="/admin/appointments"
              className="font-body text-sm text-[#C9A882] hover:underline flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeft size={16} />
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="font-body text-[#6B5D52] text-center py-8">
              لا توجد مواعيد لليوم
            </p>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#F8F4EF]/50"
                >
                  <div>
                    <p className="font-body font-medium text-[#4A3F35]">
                      {formatAppointmentServiceNames({
                        service: apt.service,
                        lines: apt.lines.map((l) => ({
                          sortOrder: l.sortOrder,
                          service: l.service,
                        })),
                      })}
                    </p>
                    <p className="font-body text-sm text-[#6B5D52]">
                      {apt.customerName} · {apt.startTime}–{apt.endTime}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : apt.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {apt.status === "confirmed"
                      ? "مؤكد"
                      : apt.status === "pending"
                        ? "قيد الانتظار"
                        : apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8DDD4]/50">
          <h2 className="font-display text-xl font-bold text-[#4A3F35] mb-6">
            رسائل جديدة
          </h2>
          {recentMessages.length === 0 ? (
            <p className="font-body text-[#6B5D52] text-center py-8">
              لا توجد رسائل جديدة
            </p>
          ) : (
            <div className="space-y-4">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl bg-[#F8F4EF]/50 border-r-4 border-[#C9A882]"
                >
                  <p className="font-body font-medium text-[#4A3F35]">
                    {msg.name}
                  </p>
                  <p className="font-body text-sm text-[#6B5D52] line-clamp-2">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
