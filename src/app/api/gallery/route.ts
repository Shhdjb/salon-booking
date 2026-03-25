import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  galleryImagePublicApiSelect,
  galleryImagePublicOrderBy,
  galleryImagePublicWhere,
} from "@/lib/gallery-prisma";

/** Public published gallery for the marketing site. */
export async function GET() {
  const images = await prisma.galleryImage.findMany({
    where: galleryImagePublicWhere,
    orderBy: galleryImagePublicOrderBy,
    select: galleryImagePublicApiSelect,
  });
  return NextResponse.json({ images });
}
