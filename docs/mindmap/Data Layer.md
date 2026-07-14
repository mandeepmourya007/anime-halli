# Data Layer

← [[Anime Halli]] · see also [[Architecture]]

## Domain contract

- [`lib/media/provider.ts`](../../lib/media/provider.ts) — the `MediaProvider` interface every adapter implements. `getByGenre` takes a genre **name**, not a provider-specific id (TMDB/Jikan use incompatible genre taxonomies).
- [`lib/media/models.ts`](../../lib/media/models.ts) — domain models generalized (not anime-only) once TMDB became a real second source: `MediaSummary`, `MediaDetail`, `CastMember` (unifies Jikan's character+voice-actor and TMDB's actor+character-played as primary/secondary name), `Genre`, `Paged<T>`. Every adapter's id is always source-prefixed (`jikan-1`, `tmdb-movie-603`, `tmdb-tv-1396`) so lookups route unambiguously without fuzzy matching.
- [`lib/media/index.ts`](../../lib/media/index.ts) — the `mediaService` facade (merged, still powers Search + the detail route).
- [`lib/media/availability.ts`](../../lib/media/availability.ts) — thin orchestration so `app/` only ever imports the facade: parses a merged id, calls the Watchmode adapter only when it's a TMDB id.
- [`lib/media/episodes.ts`](../../lib/media/episodes.ts) — `getSeasonEpisodes(id, season?)`, same never-throws/id-prefix-routing shape as `availability.ts`. `Season`/`Episode` (in `models.ts`) are TMDB-shaped since Jikan has neither concept: `tmdb-tv-*` gets real seasons + episodes; `jikan-*` anime first tries matching its title to a TMDB tv entry (via `tmdbProvider.searchTvId`, reusing `isSameTitle`) to get thumbnails/runtime, falling back to Jikan's flat, title-only episode list (`jikanProvider.getEpisodes`) on no match; movies get `null` (no section rendered). Defaults to the latest season when `?season=` is absent — see [[Pages and Routes]].
- [`lib/media/category-providers.ts`](../../lib/media/category-providers.ts) — exports `jikanProvider` and `tmdbProvider` (or `null` if TMDB is disabled) as concrete singletons, for the [[Pages and Routes|dedicated category pages]] that need source-specific queries (e.g. "Bollywood") outside the shared `MediaProvider` contract. Additive to `mediaService`, not a replacement — see [[Architecture]].
- [`lib/media/tabs.ts`](../../lib/media/tabs.ts) — `ANIME_TABS`/`MOVIE_TABS`/`SERIES_TABS` + valid-sets, one per category page, consumed by the generic `CategoryTabs` component (`tabs`+`basePath` props).

## Providers

- [`lib/providers/jikan/`](../../lib/providers/jikan/) — the real, fully-wired anime adapter (Jikan v4 / MyAnimeList). Beyond the `MediaProvider` interface it also exposes `getTrending` (`filter=bypopularity`), `getNewSeason` (`/seasons/now`) for the dedicated Anime page's Trending/New tabs, and `getEpisodes` (`/anime/{id}/episodes`) — the no-TMDB-match fallback for `lib/media/episodes.ts` (title + air date only; Jikan has no still images or per-episode runtime).
- [`lib/providers/tmdb/`](../../lib/providers/tmdb/) — real adapter for general movie/TV metadata. Ids encode content kind (`tmdb-movie-`/`tmdb-tv-`) since TMDB movie and TV ids are separate namespaces. `getTop`/`search` use TMDB's mixed movie+TV endpoints directly; `getByGenre` does a small internal movie+TV merge (TMDB's own genre taxonomies differ by content type). Also exposes category-page-only methods: `getTrendingMovies`/`getNewMovies`/`getMoviesByCountry` (Movies page), `getTopTv`/`getTrendingTv`/`getNewTv` (Web Series page), and `getTvSeasons`/`getTvSeasonEpisodes`/`searchTvId` (seasons/episodes, used only by `lib/media/episodes.ts`).
- [`lib/providers/anilist/anilist.provider.ts`](../../lib/providers/anilist/anilist.provider.ts) — scaffold proving the contract holds for a GraphQL API. Only `getTop` is real; the registry refuses to boot if this ever outranks a complete provider (see `assertProviderOrdering`).
- [`lib/providers/merging.provider.ts`](../../lib/providers/merging.provider.ts) — fan-out + dedupe composition (the default when >1 provider is enabled): calls every enabled provider in parallel, drops lower-priority duplicates via [`lib/utils/fuzzy-match.ts`](../../lib/utils/fuzzy-match.ts) (conservative: normalized-title + year-within-1, never strips season numbers). **Known limitation:** pagination is approximate — a duplicate split across two sources' page boundaries can leak through; see [[Future Scope]].
- [`lib/providers/composite.provider.ts`](../../lib/providers/composite.provider.ts) — the other composition strategy: priority-ordered fallback (try next only on failure), not merge. Both live side by side — see `MEDIA_COMPOSITION_STRATEGY`.
- [`lib/providers/watchmode/watchmode.provider.ts`](../../lib/providers/watchmode/watchmode.provider.ts) — NOT a `MediaProvider` (no title metadata, enrichment only). One function, `getAvailability`, called from the detail page only when a TMDB id is resolvable. Never throws — a failure just means no "Where to Watch" section.
- [`lib/providers/registry.ts`](../../lib/providers/registry.ts) — factory + startup guard; picks `MergingProvider` vs `CompositeProvider` per `MEDIA_COMPOSITION_STRATEGY`.
- [`lib/config/providers.config.ts`](../../lib/config/providers.config.ts) — per-provider env-driven config (base URL, auth, enabled, priority, `status: "complete" | "partial"`) plus a separate `watchmodeConfig` (query-param API key, not header-based).

## HTTP layer

- [`lib/http/fetcher.ts`](../../lib/http/fetcher.ts) — timeout, retry/backoff on 429/5xx (not on non-retryable 4xx), Next.js `revalidate` caching, auth-header injection hook.
- [`lib/http/auth-injector.ts`](../../lib/http/auth-injector.ts) — turns a declarative `ProviderAuthConfig` into the `injectAuth` function `httpFetch` expects. TMDB (Bearer token) is the first real user of this — it existed as an interface long before anything used it.
- [`lib/http/rate-limiter.ts`](../../lib/http/rate-limiter.ts) — proactive per-provider token-bucket throttling (3 req/s, 60/min for Jikan; a generous self-throttle for TMDB), on top of the reactive retry. **Known limitation:** in-memory, process-local — see [[Deployment]].
- [`lib/http/errors.ts`](../../lib/http/errors.ts) — typed errors (`ProviderError`, `RateLimitError`, `NotFoundError`, `AuthError`) that `CompositeProvider` inspects.

## Tests

Covered in [[Testing and CI]] — mapper correctness, composite fallback discrimination, registry ordering guard, merge/dedupe behavior, fuzzy-match conservativeness.
