import { prisma } from "@/lib/db";
import { ServicesManager } from "./ServicesManager";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ deletedAt: "asc" }, { category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">الخدمات</h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          إنشاء وتعديل المدة والسعر والتفعيل
        </p>
      </div>
      <ServicesManager initialServices={services} />
    </div>
  );
}
