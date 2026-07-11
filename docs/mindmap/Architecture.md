# Architecture

← [[Anime Halli]]

The UI never talks to a vendor API directly. It depends only on a domain-model interface; a config-driven registry decides which real adapter(s) back it.

## Patterns in play

- **Adapter** — each provider (Jikan, TMDB) maps its own API shape onto the shared `MediaProvider` interface.
- **Facade** — [`lib/media/index.ts`](../../lib/media/index.ts) exports `mediaService`, the single entry point every page/component imports.
- **Factory** — [`lib/providers/registry.ts`](../../lib/providers/registry.ts) builds the active provider(s) from [`lib/config/providers.config.ts`](../../lib/config/providers.config.ts).
- **Two composition strategies, chosen at the factory, both real (not one aspirational):**
  - **Composite / Chain-of-Responsibility** ([`composite.provider.ts`](../../lib/providers/composite.provider.ts)) — falls through to the next provider on rate-limit/auth/upstream errors, but rethrows `NotFoundError` and unexpected errors immediately.
  - **Merge/aggregate** ([`merging.provider.ts`](../../lib/providers/merging.provider.ts)) — the default: fans out to every enabled provider in parallel and dedupes, preferring higher-priority sources (TMDB over Jikan) on a detected duplicate. See [[Data Layer]] for the dedup algorithm and its known pagination limitation.
- **DTO → domain mapper** — each provider's own `*.mappers.ts` is the only place that knows that vendor's response shape. Every mapper always source-prefixes its ids (`jikan-`, `tmdb-movie-`/`tmdb-tv-`) — single-item lookups route by that prefix, never by fuzzy matching.
- **Enrichment, not a peer provider** — Watchmode has no title metadata, so it's deliberately outside the `MediaProvider`/merge machinery entirely: one function, called from the detail page, attaching data onto whichever title already won.

## Why

Swapping or adding a provider is a new adapter + config entry, never a UI change — TMDB proved this in practice, not just in theory. A whole new content category (Hollywood/Bollywood/cartoons as distinct browsable sections rather than one merged feed) is still Future Scope. See details in [[Data Layer]].
