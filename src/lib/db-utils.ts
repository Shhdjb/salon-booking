/**
 * Database error detection and handling
 */

export function isDatabaseConnectionError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("Can't reach database server") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("connection refused") ||
    msg.includes("connect ETIMEDOUT") ||
    msg.includes("P1001")
  );
}
