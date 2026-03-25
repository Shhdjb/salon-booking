/**
 * Rate limiting: uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are set (fixed window per key); otherwise in-memory (single instance only).
 */

import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, Bucket>();

let redisSingleton: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton;
  try {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      redisSingleton = Redis.fromEnv();
    } else {
      redisSingleton = null;
    }
  } catch {
    redisSingleton = null;
  }
  return redisSingleton;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

function memoryHit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = memoryBuckets.get(key);
  if (!b || now > b.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (b.count >= max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }
  b.count += 1;
  return { ok: true };
}

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (redis) {
    try {
      const k = `rl:v1:${key.slice(0, 200)}`;
      const n = await redis.incr(k);
      const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
      if (n === 1) await redis.expire(k, windowSec);
      if (n > max) {
        const ttl = await redis.ttl(k);
        return {
          ok: false,
          retryAfterSec: Math.max(1, ttl > 0 ? ttl : windowSec),
        };
      }
      return { ok: true };
    } catch (e) {
      console.error("[rate-limit] Upstash error, using memory fallback", e);
    }
  }
  return memoryHit(key, max, windowMs);
}

export function clientIpFromHeaders(headers: Headers): string {
  const xf = headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
