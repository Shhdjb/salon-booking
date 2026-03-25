"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import type { Service } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const serviceFormSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  duration: z.coerce.number().min(5, "الحد الأدنى 5 دقائق").max(480),
  price: z.coerce.number().min(0),
  category: z.string().min(1, "الفئة مطلوبة"),
  image: z
    .string()
    .optional()
    .refine((s) => !s?.trim() || /^https?:\/\/.+/i.test(s.trim()), "رابط غير صالح"),
  isActive: z.boolean().optional(),
});

type FormState = z.infer<typeof serviceFormSchema>;

const emptyForm: FormState = {
  name: "",
  description: "",
  duration: 30,
  price: 0,
  category: "عام",
  image: undefined,
  isActive: true,
};

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModal("create");
    setError(null);
  };

  const openEdit = (s: Service) => {
    setForm({
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      category: s.category,
      image: s.image ?? undefined,
      isActive: s.isActive,
    });
    setEditingId(s.id);
    setModal("edit");
    setError(null);
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setError(null);
  };

  const submit = async () => {
    const parsed = serviceFormSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صحيحة");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (modal === "create") {
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            image: parsed.data.image || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل الإنشاء");
        setServices((prev) => [...prev, data]);
        closeModal();
      } else if (modal === "edit" && editingId) {
        const res = await fetch(`/api/admin/services/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: parsed.data.name,
            description: parsed.data.description,
            duration: parsed.data.duration,
            price: parsed.data.price,
            category: parsed.data.category,
            image: parsed.data.image || null,
            isActive: parsed.data.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل التحديث");
        setServices((prev) => prev.map((s) => (s.id === editingId ? data : s)));
        closeModal();
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (s: Service) => {
    if (!confirm(`أرشفة «${s.name}»؟ تختفي من الحجز العام ويبقى السجل للمواعيد القديمة.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.service) {
        setServices((prev) => prev.map((x) => (x.id === s.id ? data.service : x)));
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (s: Service) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setServices((prev) => prev.map((x) => (x.id === s.id ? data : x)));
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button variant="primary" onClick={openCreate} className="gap-2">
          <Plus size={18} />
          خدمة جديدة
        </Button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            dir="rtl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#4A3F35]">
                {modal === "create" ? "خدمة جديدة" : "تعديل الخدمة"}
              </h2>
              <button type="button" onClick={closeModal} className="rounded-full p-2 hover:bg-[#F8F4EF]">
                <X size={20} />
              </button>
            </div>
            {error && (
              <p className="mb-3 rounded-xl bg-red-50 p-3 font-body text-sm text-red-600">{error}</p>
            )}
            <div className="space-y-4">
              <Input
                label="الاسم"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Textarea
                label="الوصف"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <Input
                label="المدة (دقيقة)"
                type="number"
                min={5}
                max={480}
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
              />
              <Input
                label="السعر (₪)"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
              <Input
                label="الفئة"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
              <Input
                label="رابط صورة (اختياري)"
                value={form.image ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value || undefined }))}
                placeholder="https://..."
              />
              {modal === "edit" && (
                <label className="flex items-center gap-2 font-body text-sm text-[#4A3F35]">
                  <input
                    type="checkbox"
                    checked={form.isActive ?? true}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  نشط في الموقع
                </label>
              )}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="ghost" onClick={closeModal}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={submit} disabled={loading}>
                {loading ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {categories.map((category) => (
        <div key={category}>
          <h2 className="font-display text-xl font-bold text-[#4A3F35] mb-4">{category}</h2>
          <div className="grid gap-4">
            {services
              .filter((s) => s.category === category)
              .map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E8DDD4]/80 bg-white p-6 shadow-sm"
                >
                  <div className="text-right flex-1">
                    <h3 className="font-body font-bold text-[#4A3F35]">{service.name}</h3>
                    <p className="font-body text-sm text-[#6B5D52] mt-1">{service.description}</p>
                    <div className="mt-2 flex gap-4 font-body text-sm text-[#6B5D52]">
                      <span>{formatDuration(service.duration)}</span>
                      <span className="font-bold text-[#C9A882]">{formatPrice(service.price)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {service.deletedAt ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        مؤرشفة
                      </span>
                    ) : null}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.isActive ? "نشط" : "معطّل"}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEdit(service)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#E8DDD4] px-3 py-2 font-body text-sm hover:bg-[#F8F4EF]"
                    >
                      <Pencil size={16} />
                      تعديل
                    </button>
                    {service.deletedAt ? (
                      <button
                        type="button"
                        onClick={() => handleRestore(service)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#C9A882] px-3 py-2 font-body text-sm text-[#4A3F35] hover:bg-[#F8F4EF]"
                      >
                        استعادة
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(service)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 font-body text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        أرشفة
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
