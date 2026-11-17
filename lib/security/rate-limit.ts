/**
 * Simple fixed-window limiter, kept in this server instance's memory.
 * Good enough to stop casual abuse; on serverless each instance has its own memory, so the
 * real ceiling is higher. Phase 6 moves this to Upstash Redis for a shared, exact limit.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function take(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfterS: number } {
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) { b = { count: 0, resetAt: now + windowMs }; buckets.set(key, b); }
  if (b.count >= limit) return { ok: false, retryAfterS: Math.ceil((b.resetAt - now) / 1000) };
  b.count++;
  if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  return { ok: true, retryAfterS: 0 };
}

export function _resetRateLimits() { buckets.clear(); }
