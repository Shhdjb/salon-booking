"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const dayNames: Record<number, string> = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

interface HourRow {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export function WorkingHoursForm({ hours }: { hours: HourRow[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState(hours);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E8DDD4]/50">
      <div className="space-y-6">
        {formData.map((row) => (
          <div
            key={row.dayOfWeek}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#F8F4EF]/50"
          >
            <div className="w-28 font-body font-medium text-[#4A3F35]">
              {dayNames[row.dayOfWeek]}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={row.isClosed}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev.map((p) =>
                      p.dayOfWeek === row.dayOfWeek
                        ? { ...p, isClosed: e.target.checked }
                        : p
                    )
                  )
                }
              />
              <span className="font-body text-sm text-[#6B5D52]">مغلق</span>
            </label>
            {!row.isClosed && (
              <>
                <input
                  type="time"
                  value={row.openTime}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev.map((p) =>
                        p.dayOfWeek === row.dayOfWeek
                          ? { ...p, openTime: e.target.value }
                          : p
                      )
                    )
                  }
                  className="px-4 py-2 rounded-xl border border-[#E8DDD4] font-body"
                />
                <span className="font-body text-[#6B5D52]">–</span>
                <input
                  type="time"
                  value={row.closeTime}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev.map((p) =>
                        p.dayOfWeek === row.dayOfWeek
                          ? { ...p, closeTime: e.target.value }
                          : p
                      )
                    )
                  }
                  className="px-4 py-2 rounded-xl border border-[#E8DDD4] font-body"
                />
              </>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="primary"
        className="mt-8"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "جاري الحفظ..." : "حفظ"}
      </Button>
    </div>
  );
}
