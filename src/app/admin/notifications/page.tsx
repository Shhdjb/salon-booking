import { Suspense } from "react";
import { NotificationsLog } from "./NotificationsLog";

export default function AdminNotificationsPage() {
  return (
    <div className="p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#4A3F35]">
          سجل الإشعارات
        </h1>
        <p className="mt-1 font-body text-[#6B5D52]">
          تتبع محاولات الإرسال وحالات النجاح والفشل
        </p>
      </div>
      <Suspense fallback={<p className="font-body text-[#6B5D52]">جاري التحميل...</p>}>
        <NotificationsLog />
      </Suspense>
    </div>
  );
}
