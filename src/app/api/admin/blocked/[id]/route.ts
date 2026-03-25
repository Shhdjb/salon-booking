import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-audit";
import { jsonUnauthorized } from "@/lib/api-response";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return jsonUnauthorized();
  }

  const { id } = await params;

  await prisma.blockedTime.delete({
    where: { id },
  });

  await logAdminAction(
    {
      action: "blocked_time.delete",
      entity: "blocked_time",
      entityId: id,
      adminUserId: session.user.id,
    },
    req
  );

  return NextResponse.json({ success: true });
}
