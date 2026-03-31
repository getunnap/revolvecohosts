const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 15;
const PRUNE_EVERY = 500;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let requestCount = 0;

function prune(now: number) {
  for (const [ip, b] of buckets) {
    if (now > b.resetAt) buckets.delete(ip);
  }
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Best-effort per-IP limiter (in-process). On serverless, each instance has its
 * own map; pair with CDN/WAF or Redis/Upstash for strict global limits.
 */
export function rateLimitFreeReport(
  ip: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  requestCount += 1;
  if (requestCount % PRUNE_EVERY === 0) prune(now);

  let b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    b = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(ip, b);
    return { ok: true };
  }
  if (b.count >= MAX_REQUESTS) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }
  b.count += 1;
  return { ok: true };
}
