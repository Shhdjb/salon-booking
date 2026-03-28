import { z } from "zod";

/** Auth.js v5 uses AUTH_SECRET; older docs use NEXTAUTH_SECRET. */
export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || undefined;
}

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
});

/** Optional Cloudinary — when all set, gallery uploads use cloud instead of local disk. */
export function isCloudinaryEnvComplete(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function logProdOptionalWarnings(): void {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return;

  const db = process.env.DATABASE_URL ?? "";
  if (/localhost|127\.0\.0\.1/i.test(db)) {
    console.warn(
      "[env] DATABASE_URL appears to use localhost — use a hosted PostgreSQL (Neon, Supabase, Railway, etc.) in production."
    );
  }

  if (!process.env.CRON_SECRET?.trim() && process.env.VERCEL !== "1") {
    console.warn(
      "[env] CRON_SECRET is not set — external schedulers cannot call /api/cron/appointment-reminders securely. On Vercel, VERCEL=1 + x-vercel-cron is used."
    );
  }

  if (!isCloudinaryEnvComplete()) {
    console.warn(
      "[env] Cloudinary is not configured — gallery admin uploads use local disk (not suitable for Vercel/serverless). Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }

  const twilioCore =
    process.env.TWILIO_ACCOUNT_SID?.trim() && process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!twilioCore) {
    console.warn(
      "[env] Twilio not fully configured — WhatsApp notifications will not send (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)."
    );
  }

  const smtp =
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim();
  if (!smtp) {
    console.warn("[env] SMTP not fully configured — email channel may not work.");
  }

  if (
    !process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    !process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    console.warn(
      "[env] Upstash Redis not set — rate limiting is in-memory only (per-instance, resets on cold start)."
    );
  }
}

/**
 * Validates critical env at startup (see root `instrumentation.ts`).
 * In production: requires DATABASE_URL, auth secret, and public AUTH_URL.
 */
export function validateServerEnv(): void {
  const isProd = process.env.NODE_ENV === "production";
  const db = serverEnvSchema.pick({ DATABASE_URL: true }).safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!db.success) {
    const msg = db.error.issues.map((i) => i.message).join("; ");
    console.error("[env]", msg);
    if (isProd) throw new Error(`Invalid environment: ${msg}`);
    return;
  }

  if (isProd) {
    const secret = getAuthSecret();
    if (!secret?.length) {
      throw new Error(
        "Invalid environment: AUTH_SECRET or NEXTAUTH_SECRET is required in production"
      );
    }
    const authUrl = process.env.AUTH_URL?.trim();
    if (!authUrl?.length) {
      throw new Error(
        "Invalid environment: AUTH_URL is required in production (e.g. https://your-domain.com — used for Auth.js callbacks and absolute URLs)"
      );
    }
    try {
      // eslint-disable-next-line no-new -- validate URL shape; Auth.js uses the same
      new URL(authUrl);
    } catch {
      throw new Error(
        `Invalid environment: AUTH_URL must be a valid absolute URL (got ${JSON.stringify(authUrl)}). Example: https://salonshahd.com`
      );
    }
    if (!/^https:\/\//i.test(authUrl)) {
      console.warn(
        "[env] AUTH_URL should normally use https:// in production for secure cookies and OAuth/callbacks."
      );
    }
    logProdOptionalWarnings();
    console.log("[env] Production environment validation passed (required vars OK)");
  } else if (!getAuthSecret()) {
    console.warn(
      "[env] AUTH_SECRET / NEXTAUTH_SECRET not set — sessions may be unstable in dev"
    );
  }
}
