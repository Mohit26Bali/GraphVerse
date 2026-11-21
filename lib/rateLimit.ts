/**
 * A small in-memory limiter for server routes: a fixed window per key.
 * It lives in one server process, so it resets on restart and is not shared
 * between several servers, which is fine for a single-instance deployment.
 */
export class RateLimiter {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  /** true while the key is within its limit, false once it is used up. */
  allow(key: string, now: number = Date.now()): boolean {
    if (this.buckets.size > 5000) this.sweep(now);
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= this.max;
  }

  /** Seconds until the key may try again (0 when it is not limited). */
  retryAfter(key: string, now: number = Date.now()): number {
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now || bucket.count <= this.max) return 0;
    return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  }

  private sweep(now: number) {
    for (const [k, b] of this.buckets) if (b.resetAt <= now) this.buckets.delete(k);
    if (this.buckets.size > 5000) this.buckets.clear();
  }
}

/**
 * The visitor's address. Behind a reverse proxy the real address is in
 * X-Forwarded-For: the last `hops` entries were added by proxies we trust, so
 * the visitor is the entry just before them. With no proxy configured the
 * header is ignored, so it cannot be used to dodge a limit.
 */
export function clientKey(get: (name: string) => string | null, hops: number): string {
  if (hops > 0) {
    const parts = (get("x-forwarded-for") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= hops) return parts[parts.length - hops];
    if (parts.length) return parts[0];
  }
  return "direct";
}
