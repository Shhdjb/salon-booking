"use client";

import { useEffect } from "react";
import { DatabaseUnavailable } from "@/components/ui/DatabaseUnavailable";
import { isDatabaseConnectionError } from "@/lib/db-utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isDatabaseConnectionError(error)) {
    return <DatabaseUnavailable />;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h2 className="font-serif text-2xl font-bold text-salon-brown mb-3">
          حدث خطأ غير متوقع
        </h2>
        <p className="font-sans text-salon-brown-muted leading-relaxed mb-6">
          {error.message}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-salon-gold text-white rounded-full font-sans font-medium hover:bg-salon-gold-dark transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
