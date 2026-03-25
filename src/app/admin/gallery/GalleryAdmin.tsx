"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { GalleryImage } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, Eye, EyeOff, RotateCcw } from "lucide-react";

function isUnoptimizedUrl(url: string) {
  return url.startsWith("/uploads/") || url.includes("res.cloudinary.com");
}

export function GalleryAdmin({ initial }: { initial: GalleryImage[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const { active, archived } = useMemo(() => {
    const a: GalleryImage[] = [];
    const z: GalleryImage[] = [];
    for (const row of items) {
      if (row.deletedAt) z.push(row);
      else a.push(row);
    }
    return { active: a, archived: z };
  }, [items]);

  const upload = async () => {
    if (!file) {
      setError("اختر صورة");
      return;
    }
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    if (title.trim()) fd.set("title", title.trim());
    if (alt.trim()) fd.set("alt", alt.trim());
    fd.set("sortOrder", sortOrder);
    fd.set("isPublished", "true");
    try {
      const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الرفع");
      setItems((prev) => [...prev, data].sort((a, b) => a.sortOrder - b.sortOrder));
      setFile(null);
      setTitle("");
      setAlt("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = async (row: GalleryImage) => {
    const res = await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        isPublished: !row.isPublished,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => prev.map((x) => (x.id === row.id ? data : x)));
      router.refresh();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("أرشفة هذه الصورة؟ تختفي من الموقع ويمكن استعادتها لاحقاً.")) return;
    const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, deletedAt: new Date(now), isPublished: false } : x
        )
      );
      router.refresh();
    }
  };

  const restore = async (id: string) => {
    const res = await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, restore: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => prev.map((x) => (x.id === id ? data : x)));
      router.refresh();
    }
  };

  const renderCard = (row: GalleryImage, showRestore: boolean) => (
    <div
      key={row.id}
      className="rounded-2xl border border-[#E8DDD4] bg-white overflow-hidden shadow-sm"
    >
      <div className="relative aspect-[4/3] bg-[#F8F4EF]">
        <Image
          src={row.url}
          alt={row.alt || row.title || "معرض"}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized={isUnoptimizedUrl(row.url)}
        />
      </div>
      <div className="p-4 space-y-2 text-right">
        <p className="font-body text-sm font-medium text-[#4A3F35]">{row.title || "—"}</p>
        <p className="font-body text-xs text-[#6B5D52] line-clamp-2 break-all">{row.url}</p>
        <div className="flex gap-2 justify-end flex-wrap">
          {!showRestore ? (
            <>
              <button
                type="button"
                onClick={() => togglePublish(row)}
                className="rounded-lg border border-[#E8DDD4] p-2 hover:bg-[#F8F4EF]"
                title={row.isPublished ? "إخفاء" : "نشر"}
              >
                {row.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                title="أرشفة"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => restore(row.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#C9A882] px-3 py-2 font-body text-xs text-[#4A3F35]"
            >
              <RotateCcw size={16} />
              استعادة
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10" dir="rtl">
      <div className="rounded-2xl border border-[#E8DDD4] bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-display text-lg font-bold text-[#4A3F35]">رفع صورة</h2>
        <p className="font-body text-sm text-[#6B5D52]">
          عند ضبط متغيرات البيئة <code className="text-xs">CLOUDINARY_*</code> يُرفع إلى Cloudinary
          وتُخزَّن روابط HTTPS آمنة. وإلا تُحفظ محلياً تحت{" "}
          <code className="text-xs">public/uploads/gallery</code>.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="font-body text-sm"
        />
        <Input label="عنوان (اختياري)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="نص بديل (SEO)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <Input
          label="ترتيب العرض"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
        <Button variant="primary" onClick={upload} disabled={uploading}>
          {uploading ? "جاري الرفع..." : "رفع"}
        </Button>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-[#4A3F35] mb-4">الصور النشطة</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {active.length === 0 ? (
            <p className="font-body text-sm text-[#6B5D52]">لا توجد صور نشطة</p>
          ) : (
            active.map((row) => renderCard(row, false))
          )}
        </div>
      </div>

      {archived.length > 0 ? (
        <div>
          <h2 className="font-display text-lg font-bold text-[#4A3F35] mb-4">مؤرشفة</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-90">
            {archived.map((row) => renderCard(row, true))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
