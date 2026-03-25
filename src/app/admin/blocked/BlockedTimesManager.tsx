"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus } from "lucide-react";
import type { BlockedTime } from "@prisma/client";

export function BlockedTimesManager({
  initialBlocked,
}: {
  initialBlocked: BlockedTime[];
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: "",
    startTime: "12:00",
    endTime: "14:00",
    reason: "",
  });

  const handleAdd = async () => {
    if (!form.date || !form.startTime || !form.endTime) return;
    try {
      const res = await fetch("/api/admin/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.id) {
        setBlocked((prev) => [
          ...prev,
          {
            id: data.id,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            reason: form.reason || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        setForm({ date: "", startTime: "12:00", endTime: "14:00", reason: "" });
        setShowForm(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("إزالة هذا الوقت المحجوز؟")) return;
    try {
      await fetch(`/api/admin/blocked/${id}`, { method: "DELETE" });
      setBlocked((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
        <Plus size={16} className="ml-2" />
        حجز وقت
      </Button>

      {showForm && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E8DDD4]/50 space-y-4">
          <h3 className="font-body font-bold text-[#4A3F35]">
            حجز وقت غير متاح
          </h3>
          <Input
            label="التاريخ"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="وقت البداية"
            type="time"
            value={form.startTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, startTime: e.target.value }))
            }
          />
          <Input
            label="وقت النهاية"
            type="time"
            value={form.endTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, endTime: e.target.value }))
            }
          />
          <Input
            label="السبب (اختياري)"
            value={form.reason}
            onChange={(e) =>
              setForm((f) => ({ ...f, reason: e.target.value }))
            }
            placeholder="مثال: اجتماع فريق العمل"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleAdd}>
              إضافة
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setForm({
                  date: "",
                  startTime: "12:00",
                  endTime: "14:00",
                  reason: "",
                });
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {blocked.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center font-body text-[#6B5D52] shadow-lg">
          لا توجد أوقات محجوزة.
        </div>
      ) : (
        <div className="grid gap-4">
          {blocked.map((block) => (
            <div
              key={block.id}
              className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-lg border border-[#E8DDD4]/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#C9A882]/15 rounded-2xl flex items-center justify-center text-[#C9A882]">
                  <span className="font-display text-xl">🕐</span>
                </div>
                <div className="text-right">
                  <p className="font-body font-bold text-[#4A3F35]">
                    {format(new Date(block.date), "EEEE d MMM", {
                      locale: ar,
                    })}
                  </p>
                  <p className="font-body text-sm text-[#6B5D52]">
                    {block.startTime} – {block.endTime}
                    {block.reason && ` · ${block.reason}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(block.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
