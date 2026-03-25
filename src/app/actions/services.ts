"use server";

import { prisma } from "@/lib/db";

export async function getServices(activeOnly = false) {
  return prisma.service.findMany({
    where: {
      deletedAt: null,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: { category: "asc" },
  });
}
