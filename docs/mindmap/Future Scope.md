# Future Scope

← [[Anime Halli]] · full detail in [the plan doc](../plan-anime-discovery-app.md#future-scope-post-v1-not-built-now)

Not built yet, deliberately — noted so intent isn't lost:

- **Multi-category expansion** (Hollywood, Bollywood, cartoons, classic shows) — the [[Architecture|Adapter/Facade design]] generalizes to this; needs a `category` route segment + a broader `ContentProvider` interface (today's `MediaProvider` is still anime-shaped: `getTop`/`getAiring`/`getMovies`).
- **Multi-theme system** — palette layer (cheap, `data-theme` + CSS vars) vs. structural layer (a second card/grid shape like "Circular Pop", needs a variant dispatcher). See [[Styling and Theme]].
- **More providers wired end-to-end** — flesh out the AniList scaffold fully, add Kitsu/TMDB.
- **Shared/edge rate limiting** — replace the process-local limiter (see [[Deployment]]) with something serverless-safe.
- **Error monitoring & analytics** — no Sentry/analytics wired in yet.
- **Accounts, watchlist, recommendations, i18n, PWA** — all deferred, see the plan doc for the full list.
