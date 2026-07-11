# Data Layer

← [[Anime Halli]] · see also [[Architecture]]

## Domain contract

- [`lib/media/provider.ts`](../../lib/media/provider.ts) — the `MediaProvider` interface every adapter implements.
- [`lib/media/models.ts`](../../lib/media/models.ts) — stable domain models (`AnimeSummary`, `AnimeDetail`, `Character`, `VoiceActor`, `Genre`, `Paged<T>`).
- [`lib/media/index.ts`](../../lib/media/index.ts) — the `mediaService` facade.

## Providers

- [`lib/providers/jikan/`](../../lib/providers/jikan/) — the real, fully-wired adapter (Jikan v4 / MyAnimeList). `jikan.dto.ts` (raw shapes) → `jikan.mappers.ts` (quarantines Jikan's quirks, e.g. Japanese voice-actor lookup, duplicate-id dedup) → `jikan.provider.ts` (implements `MediaProvider`).
- [`lib/providers/anilist/anilist.provider.ts`](../../lib/providers/anilist/anilist.provider.ts) — scaffold proving the contract holds for a GraphQL API. Only `getTop` is real; the registry refuses to boot if this ever outranks a complete provider (see `assertProviderOrdering`).
- [`lib/providers/composite.provider.ts`](../../lib/providers/composite.provider.ts) — fallback chain across providers.
- [`lib/providers/registry.ts`](../../lib/providers/registry.ts) — factory + startup guard.
- [`lib/config/providers.config.ts`](../../lib/config/providers.config.ts) — per-provider env-driven config (base URL, auth, enabled, priority, `status: "complete" | "partial"`).

## HTTP layer

- [`lib/http/fetcher.ts`](../../lib/http/fetcher.ts) — timeout, retry/backoff on 429/5xx (not on non-retryable 4xx), Next.js `revalidate` caching, auth-header injection hook.
- [`lib/http/rate-limiter.ts`](../../lib/http/rate-limiter.ts) — proactive per-provider token-bucket throttling (3 req/s, 60/min for Jikan), on top of the reactive retry. **Known limitation:** in-memory, process-local — see [[Deployment]].
- [`lib/http/errors.ts`](../../lib/http/errors.ts) — typed errors (`ProviderError`, `RateLimitError`, `NotFoundError`, `AuthError`) that the composite provider inspects.

## Tests

Covered in [[Testing and CI]] — mapper correctness, composite fallback discrimination, registry ordering guard.
