import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { jsonTooManyRequests } from "@/lib/api-response";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const rl = await checkRateLimit(`auth:${ip}`, 45, 15 * 60 * 1000);
  if (!rl.ok) {
    return jsonTooManyRequests(rl.retryAfterSec);
  }
  return handlers.POST(req);
}
