/**
 * Simple sliding-window rate limiter, keyed per provider. Caching (see the
 * `revalidate` values in each provider adapter) protects steady-state repeat
 * traffic, but does nothing for a cache-cold burst — e.g. several parallel
 * requests on first load. This adds proactive throttling in front of that,
 * on top of the reactive retry/backoff `httpFetch` already does on 429s.
 *
 * Process-local only (in-memory timestamps) — fine for a single Node server;
 * it would need a shared store (e.g. Redis) to coordinate across instances.
 */

export interface RateLimitConfig {
  perSecond?: number;
  perMinute?: number;
}

const POLL_INTERVAL_MS = 50;

class RateLimiter {
  private timestamps: number[] = [];

  constructor(private readonly config: RateLimitConfig) {}

  async acquire(): Promise<void> {
    while (true) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < 60_000);

      const perSecondCount = this.timestamps.filter((t) => now - t < 1000).length;
      const perMinuteCount = this.timestamps.length;

      const overPerSecond = this.config.perSecond !== undefined && perSecondCount >= this.config.perSecond;
      const overPerMinute = this.config.perMinute !== undefined && perMinuteCount >= this.config.perMinute;

      if (!overPerSecond && !overPerMinute) {
        this.timestamps.push(now);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

const limiters = new Map<string, RateLimiter>();

export function getRateLimiter(key: string, config: RateLimitConfig): RateLimiter {
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new RateLimiter(config);
    limiters.set(key, limiter);
  }
  return limiter;
}
