"use client";

import Link from "next/link";
import { Database, RefreshCw } from "lucide-react";

interface DatabaseUnavailableProps {
  /** Optional custom title */
  title?: string;
}

export function DatabaseUnavailable({ title }: DatabaseUnavailableProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-salon-cream-border text-salon-brown mb-6">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-salon-brown mb-3">
          {title ?? "قاعدة البيانات غير متاحة"}
        </h2>
        <p className="font-sans text-salon-brown-muted leading-relaxed mb-6">
          لا يمكن الاتصال بخادم PostgreSQL. تأكدي من أن قاعدة البيانات تعمل وأن ملف
          .env يحتوي على رابط اتصال صحيح.
        </p>
        <div className="space-y-3 text-right">
          <p className="font-sans text-sm text-salon-brown-muted">
            <strong>ما الذي تفعلينه:</strong>
          </p>
          <ol className="font-sans text-sm text-salon-brown-muted list-decimal list-inside space-y-1 text-right">
            <li>تأكدي أن PostgreSQL مثبت ويعمل</li>
            <li>شغّلي <code className="bg-salon-cream px-1 rounded">npm run db:setup</code></li>
            <li>تحققي من <code className="bg-salon-cream px-1 rounded">DATABASE_URL</code> في .env</li>
          </ol>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-salon-gold text-white rounded-full font-sans font-medium hover:bg-salon-gold-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-salon-gold text-salon-brown rounded-full font-sans font-medium hover:bg-salon-cream transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
