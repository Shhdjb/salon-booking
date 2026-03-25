export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateServerEnv } = await import("@/lib/env");
    try {
      validateServerEnv();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
