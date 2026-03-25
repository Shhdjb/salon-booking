-- AlterEnum: Add no_show to AppointmentStatus
ALTER TYPE "AppointmentStatus" ADD VALUE 'no_show';

-- AlterTable: User - add completedAppointmentsCount
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "completedAppointmentsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Appointment - add price fields
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "finalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "discountPercent" DOUBLE PRECISION;

-- CreateTable: GalleryImage
CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SalonPackage
CREATE TABLE IF NOT EXISTS "SalonPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "services" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalonPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ActivityLog
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "userId" TEXT,
    "details" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Appointment userId
CREATE INDEX IF NOT EXISTS "Appointment_userId_idx" ON "Appointment"("userId");

-- CreateIndex: Appointment status
CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status");
