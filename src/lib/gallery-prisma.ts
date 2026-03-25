import type { Prisma } from "@prisma/client";

/**
 * Single source of truth for public gallery queries — keeps `where` / `select`
 * aligned with `GalleryImage` in prisma/schema.prisma and the generated client.
 */

export const galleryImagePublicWhere: Prisma.GalleryImageWhereInput = {
  isPublished: true,
  deletedAt: null,
};

/** Columns for the home page gallery strip. */
export const galleryImageHomeSelect = {
  url: true,
  alt: true,
  title: true,
} satisfies Prisma.GalleryImageSelect;

export type GalleryImageHomeRow = Prisma.GalleryImageGetPayload<{
  select: typeof galleryImageHomeSelect;
}>;

export const galleryImagePublicOrderBy: Prisma.GalleryImageOrderByWithRelationInput[] = [
  { sortOrder: "asc" },
  { createdAt: "asc" },
];

/** Columns for GET /api/gallery (headless / consumers). */
export const galleryImagePublicApiSelect = {
  id: true,
  url: true,
  title: true,
  alt: true,
  sortOrder: true,
} satisfies Prisma.GalleryImageSelect;

export type GalleryImagePublicApiRow = Prisma.GalleryImageGetPayload<{
  select: typeof galleryImagePublicApiSelect;
}>;
