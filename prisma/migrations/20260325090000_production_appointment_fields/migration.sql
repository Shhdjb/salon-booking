-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "reminderSentAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "Notification" ADD COLUMN "providerMessageId" TEXT,
ADD COLUMN "failureReason" TEXT;

-- CreateTable
CREATE TABLE "AppointmentLine" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AppointmentLine_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AppointmentLine_appointmentId_idx" ON "AppointmentLine"("appointmentId");

ALTER TABLE "AppointmentLine" ADD CONSTRAINT "AppointmentLine_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppointmentLine" ADD CONSTRAINT "AppointmentLine_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "AppointmentLine" ("id", "appointmentId", "serviceId", "durationMinutes", "unitPrice", "sortOrder")
SELECT ('legacy_' || a."id"), a."id", a."serviceId", s."duration", s."price", 0
FROM "Appointment" a
INNER JOIN "Service" s ON s."id" = a."serviceId"
WHERE NOT EXISTS (SELECT 1 FROM "AppointmentLine" al WHERE al."appointmentId" = a."id");
