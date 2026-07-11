import { AuthError, NotFoundError, ProviderError, RateLimitError } from "./errors";
import { getRateLimiter, type RateLimitConfig } from "./rate-limiter";

export interface HttpFetchOptions {
  /** Next.js cache revalidation window, in seconds. */
  revalidate?: number | false;
  /** Extra headers to send (merged after auth injection). */
  headers?: Record<string, string>;
  /** Timeout in ms before the request is aborted. */
  timeoutMs?: number;
  /** Max retry attempts on 429 / 5xx responses. */
  retries?: number;
  /** Auth header injection hook — called with the outgoing headers to mutate/add auth. */
  injectAuth?: (headers: Record<string, string>) => void;
  /** Identifies the calling provider, for error attribution and rate-limit bucketing. */
  provider?: string;
  /** Proactive rate limit to enforce for this provider (see lib/http/rate-limiter.ts). */
  rateLimit?: RateLimitConfig;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 2;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  return 300 * 2 ** attempt;
}

/**
 * Generic fetch used by every provider adapter. Handles:
 * - a proactive per-provider rate limit (see `rateLimit`), on top of...
 * - retry with exponential backoff on 429 / 5xx (reactive, for whatever the
 *   rate limiter didn't already prevent)
 * - timeout via AbortController
 * - Next.js fetch caching (`revalidate`)
 * - auth header injection hook (for providers that need a key/token later)
 * - mapping HTTP failures to typed ProviderError subclasses
 */
export async function httpFetch<T>(url: string, opts: HttpFetchOptions = {}): Promise<T> {
  const {
    revalidate = 60,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    injectAuth,
    provider,
    rateLimit,
  } = opts;

  const finalHeaders: Record<string, string> = { Accept: "application/json", ...headers };
  injectAuth?.(finalHeaders);

  const limiter = rateLimit && provider ? getRateLimiter(provider, rateLimit) : undefined;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    await limiter?.acquire();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        headers: finalHeaders,
        signal: controller.signal,
        next: revalidate === false ? undefined : { revalidate },
        cache: revalidate === false ? "no-store" : undefined,
      });

      clearTimeout(timer);

      if (res.ok) {
        return (await res.json()) as T;
      }

      if (res.status === 401 || res.status === 403) {
        throw new AuthError(`Auth failed for ${url} (${res.status})`, { provider });
      }

      if (res.status === 404) {
        throw new NotFoundError(`Not found: ${url}`, { provider });
      }

      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          await sleep(backoffMs(attempt));
          continue;
        }
        throw new RateLimitError(`Rate limited / server error for ${url} (${res.status})`, {
          provider,
        });
      }

      // Non-retryable client error (e.g. 400/422) — retrying it would never succeed.
      throw new ProviderError(`Request failed for ${url} (${res.status})`, {
        status: res.status,
        provider,
      });
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (err instanceof ProviderError) {
        // AuthError/NotFoundError/RateLimitError(exhausted)/non-retryable-4xx —
        // 429/5xx retries already happened above, before this was thrown.
        throw err;
      }

      // Network error / abort — retry if attempts remain.
      if (attempt < retries) {
        await sleep(backoffMs(attempt));
        continue;
      }
    }
  }

  throw new ProviderError(
    lastError instanceof Error ? lastError.message : `Request failed for ${url}`,
    { provider },
  );
}
