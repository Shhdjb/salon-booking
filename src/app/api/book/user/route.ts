import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getLoyaltyInfo } from "@/lib/loyalty";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(null);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      deletedAt: true,
      name: true,
      email: true,
      phone: true,
      completedAppointmentsCount: true,
      phoneNotificationsEnabled: true,
      preferredNotificationChannel: true,
    },
  });

  if (!user || user.deletedAt) return NextResponse.json(null);

  const loyalty = getLoyaltyInfo(user.completedAppointmentsCount);

  return NextResponse.json({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    phoneNotificationsEnabled: user.phoneNotificationsEnabled ?? false,
    preferredNotificationChannel: user.preferredNotificationChannel,
    loyalty,
  });
}
