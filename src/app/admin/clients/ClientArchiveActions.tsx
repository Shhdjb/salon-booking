"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClientArchiveActions({
  userId,
  deletedAt,
}: {
  userId: string;
  deletedAt: Date | string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isArchived = Boolean(deletedAt);

  const patch = async (body: { archive?: boolean; restore?: boolean }) => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "فشل الطلب");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      {isArchived ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => patch({ restore: true })}
          className="rounded-xl border-2 border-[#C9A882] px-4 py-2 font-body text-sm text-[#4A3F35] hover:bg-[#F8F4EF] disabled:opacity-50"
        >
          {loading ? "جاري الاستعادة..." : "استعادة الحساب"}
        </button>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            if (!confirm("أرشفة العميلة؟ لن تتمكن من تسجيل الدخول حتى الاستعادة.")) return;
            patch({ archive: true });
          }}
          className="rounded-xl border border-red-200 px-4 py-2 font-body text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {loading ? "جاري الأرشفة..." : "أرشفة الحساب"}
        </button>
      )}
    </div>
  );
}
