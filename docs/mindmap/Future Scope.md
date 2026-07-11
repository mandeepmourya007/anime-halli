# Future Scope

← [[Anime Halli]] · full detail in [the plan doc](../plan-anime-discovery-app.md#future-scope-post-v1-not-built-now)

Not built yet, deliberately — noted so intent isn't lost:

- **Multi-category expansion** (Hollywood, Bollywood, cartoons, classic shows) — the [[Architecture|Adapter/Facade design]] generalizes to this; needs a `category` route segment + a broader `ContentProvider` interface (today's `MediaProvider` is still anime-shaped: `getTop`/`getAiring`/`getMovies`).
- **Multi-theme system** — palette layer (cheap, `data-theme` + CSS vars) vs. structural layer (a second card/grid shape like "Circular Pop", needs a variant dispatcher). See [[Styling and Theme]].
- **More providers wired end-to-end** — flesh out the AniList scaffold fully, add Kitsu.
- **Cross-page duplicate leakage in the merge** — [[Data Layer|MergingProvider]]'s pagination is approximate; a title split across two sources' page boundaries can appear twice. Fixing properly needs a persistent cross-reference index — accepted gap for now.
- **Availability fallback for Jikan-only titles** — Watchmode enrichment only resolves via a TMDB id. A Jikan-only anime that TMDB *does* catalog under a different id currently shows no "Where to Watch" section; a title-based TMDB lookup could close this gap but adds a real extra API call chain.
- **Shared/edge rate limiting** — replace the process-local limiter (see [[Deployment]]) with something serverless-safe.
- **Error monitoring & analytics** — no Sentry/analytics wired in yet.
- **Accounts, watchlist, recommendations, i18n, PWA** — all deferred, see the plan doc for the full list.
