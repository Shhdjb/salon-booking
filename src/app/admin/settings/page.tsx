import { prisma } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await prisma.salonSettings.findMany();

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">
          الإعدادات
        </h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          إعدادات الصالون
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E8DDD4]/50">
        <p className="font-body text-[#6B5D52]">
          إعدادات الصالون ستكون متاحة قريباً.
        </p>
        {settings.length > 0 && (
          <div className="mt-6 space-y-2">
            {settings.map((s) => (
              <div key={s.id} className="flex gap-4">
                <span className="font-medium text-[#4A3F35]">{s.key}:</span>
                <span className="text-[#6B5D52]">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
