import { HeroSection } from "@/components/home/HeroSection";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { SalonPackages } from "@/components/home/SalonPackages";
import { LoyaltyPreviewSection } from "@/components/home/LoyaltyPreviewSection";
import { SalonGallery } from "@/components/home/SalonGallery";
import { SalonAbout } from "@/components/home/SalonAbout";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { prisma } from "@/lib/db";
import { isDatabaseConnectionError } from "@/lib/db-utils";
import {
  galleryImageHomeSelect,
  galleryImagePublicOrderBy,
  galleryImagePublicWhere,
} from "@/lib/gallery-prisma";

export default async function HomePage() {
  let galleryItems: { src: string; alt: string; title?: string | null }[] | null = null;
  try {
    const dbGallery = await prisma.galleryImage.findMany({
      where: galleryImagePublicWhere,
      orderBy: galleryImagePublicOrderBy,
      select: galleryImageHomeSelect,
    });
    galleryItems =
      dbGallery.length > 0
        ? dbGallery.map((g) => ({
            src: g.url,
            alt: g.alt || g.title || "معرض صالون شهد",
            title: g.title,
          }))
        : null;
  } catch (e) {
    if (isDatabaseConnectionError(e)) {
      console.error("[home] gallery DB unavailable, using fallback images:", e);
      galleryItems = null;
    } else {
      throw e;
    }
  }

  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <SalonPackages />
      <LoyaltyPreviewSection />
      <SalonGallery items={galleryItems} />
      <SalonAbout />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
