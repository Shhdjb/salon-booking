import { Suspense } from "react";
import { getServices } from "@/app/actions/services";
import { getAvailableDates } from "@/lib/booking-server";
import { isDatabaseConnectionError } from "@/lib/db-utils";
import { DatabaseUnavailable } from "@/components/ui/DatabaseUnavailable";
import { BookingFlow } from "./BookingFlow";

export default async function BookPage() {
  try {
    const [services, availableDates] = await Promise.all([
      getServices(true),
      getAvailableDates(new Date(), 14),
    ]);

    return (
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-6 py-24 text-center font-body text-salon-brown-muted">
            جاري التحميل...
          </div>
        }
      >
        <BookingFlow
          services={services}
          availableDates={availableDates.map((d) => d.toISOString())}
        />
      </Suspense>
    );
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseUnavailable title="تعذر تحميل صفحة الحجز" />;
    }
    throw error;
  }
}
