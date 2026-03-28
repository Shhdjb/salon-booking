export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { normalizeAuthUrlEnv } = await import("@/lib/normalize-auth-url");
    normalizeAuthUrlEnv();
    const { validateServerEnv } = await import("@/lib/env");
    try {
      validateServerEnv();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
