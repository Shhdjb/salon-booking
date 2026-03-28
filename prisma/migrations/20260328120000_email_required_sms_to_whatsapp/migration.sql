-- Prefer WhatsApp-only notifications; migrate legacy SMS preference and audit rows.
UPDATE "User" SET "preferredNotificationChannel" = 'WHATSAPP' WHERE "preferredNotificationChannel" = 'SMS';
UPDATE "Notification" SET channel = 'WHATSAPP' WHERE channel = 'SMS';

-- Required email: backfill placeholders for any NULL (e.g. old rows) before NOT NULL.
UPDATE "User" SET email = 'legacy-' || id || '@placeholder.salon.local' WHERE email IS NULL;
UPDATE "Appointment" SET email = 'legacy-' || id || '@booking.placeholder.salon.local' WHERE email IS NULL;

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "email" SET NOT NULL;
