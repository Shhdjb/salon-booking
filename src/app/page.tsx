import { HeroSection } from "@/components/home/HeroSection";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { SalonPackages } from "@/components/home/SalonPackages";
import { LoyaltyPreviewSection } from "@/components/home/LoyaltyPreviewSection";
import { SalonGallery } from "@/components/home/SalonGallery";
import { SalonAbout } from "@/components/home/SalonAbout";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { prisma } from "@/lib/db";
import {
  galleryImageHomeSelect,
  galleryImagePublicOrderBy,
  galleryImagePublicWhere,
} from "@/lib/gallery-prisma";

export default async function HomePage() {
  const dbGallery = await prisma.galleryImage.findMany({
    where: galleryImagePublicWhere,
    orderBy: galleryImagePublicOrderBy,
    select: galleryImageHomeSelect,
  });

  const galleryItems =
    dbGallery.length > 0
      ? dbGallery.map((g) => ({
          src: g.url,
          alt: g.alt || g.title || "معرض صالون شهد",
          title: g.title,
        }))
      : null;

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
