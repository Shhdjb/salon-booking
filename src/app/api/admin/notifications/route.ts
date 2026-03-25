import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { jsonUnauthorized, jsonValidationError } from "@/lib/api-response";

const querySchema = z.object({
  appointmentId: z.string().optional(),
  userId: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional().default(80),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const { searchParams } = new URL(req.url);
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonValidationError("معاملات غير صالحة", parsed.error);
  }

  const { appointmentId, userId, status, limit } = parsed.data;

  const rows = await prisma.notification.findMany({
    where: {
      ...(appointmentId ? { appointmentId } : {}),
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      appointment: {
        select: { id: true, date: true, startTime: true, customerName: true },
      },
    },
  });

  return NextResponse.json({ notifications: rows });
}
