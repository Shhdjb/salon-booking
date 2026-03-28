import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientArchiveActions } from "../ClientArchiveActions";
import { formatAppointmentServiceNames } from "@/lib/appointment-labels";
import { formatIls } from "@/lib/format-currency";
import { getLoyaltyInfo } from "@/lib/loyalty";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, role: "CLIENT" },
    include: {
      appointments: {
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        take: 80,
        include: {
          service: true,
          lines: { orderBy: { sortOrder: "asc" }, include: { service: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const loyalty = getLoyaltyInfo(user.completedAppointmentsCount);
  const completed = user.appointments.filter((a) => a.status === "completed").length;
  const cancelled = user.appointments.filter((a) => a.status === "cancelled").length;
  const noShows = user.appointments.filter((a) => a.status === "no_show").length;

  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/clients"
            className="font-body text-sm text-[#C9A882] hover:underline mb-2 inline-block"
          >
            ← العملاء
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#4A3F35]">{user.name}</h1>
          <p className="mt-1 font-body text-[#6B5D52]">
            {user.email || "—"} · {user.phone || "—"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {user.deletedAt ? (
            <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 font-body text-xs text-amber-900">
              حساب مؤرشف — لا يمكنها تسجيل الدخول
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 justify-end">
            <Link
              href={`/admin/appointments?userId=${user.id}`}
              className="rounded-xl bg-[#C9A882] px-4 py-2 font-body text-sm text-white"
            >
              مواعيدها
            </Link>
            <Link
              href={`/admin/notifications?userId=${user.id}`}
              className="rounded-xl border-2 border-[#C9A882] px-4 py-2 font-body text-sm text-[#4A3F35]"
            >
              سجل الإشعارات
            </Link>
          </div>
          <ClientArchiveActions userId={user.id} deletedAt={user.deletedAt} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <div className="rounded-2xl border border-[#E8DDD4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#4A3F35] mb-4">التفضيلات</h2>
          <ul className="font-body text-sm text-[#6B5D52] space-y-2 text-right">
            <li>
              إشعارات الهاتف:{" "}
              <strong className="text-[#4A3F35]">
                {user.phoneNotificationsEnabled ? "مفعّل" : "غير مفعّل"}
              </strong>
            </li>
            <li>
              القناة المفضلة:{" "}
              <strong className="text-[#4A3F35]">
                {user.preferredNotificationChannel === "WHATSAPP"
                  ? "واتساب"
                  : user.preferredNotificationChannel === "EMAIL"
                    ? "بريد"
                    : user.preferredNotificationChannel === "SMS"
                      ? "واتساب (قديم)"
                      : "—"}
              </strong>
            </li>
            <li>
              آخر مستوى إشعار ولاء مُرسل:{" "}
              <strong className="text-[#4A3F35]">{user.loyaltyUnlockNotifiedPercent}%</strong>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[#E8DDD4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#4A3F35] mb-4">الولاء والإحصائيات</h2>
          <ul className="font-body text-sm text-[#6B5D52] space-y-2 text-right">
            <li>
              جلسات مكتملة (محسوبة):{" "}
              <strong className="text-[#4A3F35]">{user.completedAppointmentsCount}</strong>
            </li>
            <li>
              الخصم الحالي على الحجز:{" "}
              <strong className="text-salon-gold-dark">{loyalty.currentDiscount}%</strong>
            </li>
            <li>إكمالات في السجل: {completed}</li>
            <li>إلغاءات: {cancelled}</li>
            <li>لم تحضر: {noShows}</li>
          </ul>
        </div>
      </div>

      <h2 className="font-display text-xl font-bold text-[#4A3F35] mb-4">سجل الحجوزات</h2>
      <div className="overflow-x-auto rounded-2xl border border-[#E8DDD4] bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-right font-body text-sm">
          <thead className="bg-[#F8F4EF] text-[#6B5D52] text-xs">
            <tr>
              <th className="px-3 py-2">التاريخ</th>
              <th className="px-3 py-2">الوقت</th>
              <th className="px-3 py-2">الخدمات</th>
              <th className="px-3 py-2">السعر</th>
              <th className="px-3 py-2">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {user.appointments.map((a) => (
              <tr key={a.id} className="border-t border-[#E8DDD4]/60">
                <td className="px-3 py-2 whitespace-nowrap">
                  {format(new Date(a.date), "d MMM yyyy", { locale: ar })}
                </td>
                <td className="px-3 py-2">
                  {a.startTime}–{a.endTime}
                </td>
                <td className="px-3 py-2 max-w-[240px]">
                  {formatAppointmentServiceNames({
                    service: a.service,
                    lines: a.lines.map((l) => ({
                      sortOrder: l.sortOrder,
                      service: l.service,
                    })),
                  })}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {formatIls(a.finalPrice)}
                  {a.discountPercent ? (
                    <span className="text-[#C9A882] mr-1">(-{a.discountPercent}%)</span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-xs">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
