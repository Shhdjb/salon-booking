-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "destination" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "loyaltyUnlockNotifiedPercent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN "title" TEXT;
