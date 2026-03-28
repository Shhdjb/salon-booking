/**
 * Auth.js / NextAuth resolve callbacks with `new URL(process.env.AUTH_URL)`.
 * A bare hostname (e.g. `salonshahd.com`) throws TypeError: Invalid URL.
 * Call from instrumentation before env validation and before auth runs.
 */

function normalizeUrlValue(raw: string): string {
  const v = raw.trim().replace(/\/$/, "");
  if (!v) return v;
  if (/^https?:\/\//i.test(v)) return v;
  const hostAndPath = v.replace(/^\/+/, "");
  return `https://${hostAndPath}`;
}

/**
 * Mutates `process.env` so AUTH_URL / NEXTAUTH_URL are absolute URLs when possible.
 * Logs once when a protocol was missing (common Railway misconfiguration).
 */
export function normalizeAuthUrlEnv(): void {
  for (const key of ["AUTH_URL", "NEXTAUTH_URL"] as const) {
    const raw = process.env[key];
    if (!raw?.trim()) continue;
    const before = raw.trim();
    const after = normalizeUrlValue(before);
    if (after !== before) {
      console.warn(
        `[env] ${key} was not a full URL — normalized for Auth.js (add https:// in the host dashboard to silence this). Before: ${JSON.stringify(before)} → After: ${JSON.stringify(after)}`
      );
    }
    process.env[key] = after;
  }

  const auth = process.env.AUTH_URL?.trim();
  const next = process.env.NEXTAUTH_URL?.trim();
  if (auth && !next) process.env.NEXTAUTH_URL = auth;
  if (next && !auth) process.env.AUTH_URL = next;
}
