import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limit по IP для /api/generate.
 * Использует Upstash Redis (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN).
 * Если переменных нет — limiter не создаётся, проверка пропускается (для локальной разработки).
 */
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SEC = 60;

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== null) return ratelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const redis = new Redis({ url, token });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, `${RATE_LIMIT_WINDOW_SEC} s`),
    prefix: "content-multiplier:generate",
  });
  return ratelimit;
}

/**
 * Возвращает IP клиента из заголовков (Vercel/proxy).
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Проверяет rate limit по идентификатору (обычно IP).
 * Возвращает { allowed: true } или { allowed: false, retryAfter: number }.
 */
export async function checkRateLimit(identifier: string): Promise<
  { allowed: true } | { allowed: false; retryAfter: number }
> {
  const limiter = getRatelimit();
  if (!limiter) return { allowed: true };

  const { success, reset } = await limiter.limit(identifier);
  if (success) return { allowed: true };
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { allowed: false, retryAfter };
}
