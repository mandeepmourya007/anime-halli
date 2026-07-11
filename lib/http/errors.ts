/**
 * Typed HTTP/provider errors. The CompositeProvider inspects these to decide
 * whether to fall through to the next provider in priority order.
 */

export class ProviderError extends Error {
  readonly status?: number;
  readonly provider?: string;

  constructor(message: string, opts?: { status?: number; provider?: string }) {
    super(message);
    this.name = "ProviderError";
    this.status = opts?.status;
    this.provider = opts?.provider;
  }
}

export class RateLimitError extends ProviderError {
  constructor(message = "Rate limit exceeded", opts?: { provider?: string }) {
    super(message, { status: 429, provider: opts?.provider });
    this.name = "RateLimitError";
  }
}

export class NotFoundError extends ProviderError {
  constructor(message = "Resource not found", opts?: { provider?: string }) {
    super(message, { status: 404, provider: opts?.provider });
    this.name = "NotFoundError";
  }
}

export class AuthError extends ProviderError {
  constructor(message = "Authentication failed", opts?: { provider?: string }) {
    super(message, { status: 401, provider: opts?.provider });
    this.name = "AuthError";
  }
}
