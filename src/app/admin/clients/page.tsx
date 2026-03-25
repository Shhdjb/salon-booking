import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { ClientsManager } from "./ClientsManager";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const archived = sp.archived === "1" || sp.archived === "true";

  const where: Prisma.UserWhereInput = {
    role: "CLIENT",
    ...(archived ? { deletedAt: { not: null } } : { deletedAt: null }),
  };
  if (q) {
    const compact = q.replace(/\s/g, "");
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: compact } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      completedAppointmentsCount: true,
    },
  });

  return (
    <ClientsManager
      initialUsers={users}
      initialQuery={q}
      initialArchived={archived}
    />
  );
}
