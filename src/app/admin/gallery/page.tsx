import { prisma } from "@/lib/db";
import { GalleryAdmin } from "./GalleryAdmin";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">معرض الصور</h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          رفع وترتيب وإظهار/إخفاء الصور على الصفحة الرئيسية
        </p>
      </div>
      <GalleryAdmin initial={images} />
    </div>
  );
}
