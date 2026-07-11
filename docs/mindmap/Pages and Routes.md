# Pages and Routes

← [[Anime Halli]] · assembles [[UI Components]] via [[Data Layer]]

## Routes

Nav is three dedicated category pages, not one merged feed — each queries its own source(s) directly via [[Data Layer|`jikanProvider`/`tmdbProvider`]], not the merged `mediaService`:

- [`app/page.tsx`](../../app/page.tsx) — **Anime** (`/`): Top / Trending / New (`?tab=`), backed by `jikanProvider` (`getTop`/`getTrending`/`getNewSeason`).
- [`app/movies/page.tsx`](../../app/movies/page.tsx) — **Movies** (`/movies`): Top / Trending / New / Bollywood / Hollywood, backed by `tmdbProvider` (Bollywood/Hollywood via `getMoviesByCountry("IN"|"US")` — origin country, not language, to catch co-productions). Renders an `EmptyState` instead of erroring when TMDB is disabled.
- [`app/series/page.tsx`](../../app/series/page.tsx) — **Web Series** (`/series`): Top / Trending / New, backed by `tmdbProvider`'s TV endpoints — same TMDB TV data as "Web Series" commonly means in casual usage, no extra platform filtering. Same `EmptyState` fallback as Movies.
- [`app/search/page.tsx`](../../app/search/page.tsx) — search results (`?q=&page=`) — still searches the **merged** `mediaService` across all sources, unscoped by category.
- [`app/anime/[id]/page.tsx`](../../app/anime/[id]/page.tsx) — detail page (synopsis, trailer, cast, availability) for **any** item from any category page — id-prefix routing through `mediaService` means one detail route serves anime/movie/series alike. Only a real `NotFoundError` renders 404; other failures are logged and rethrown to `error.tsx`. Not renamed off `/anime/` despite now serving all categories — avoided touching `robots.ts`/`sitemap.ts`/SEO for this pass.
- [`app/anime/[id]/error.tsx`](../../app/anime/[id]/error.tsx), [`app/error.tsx`](../../app/error.tsx) — error boundaries with a "Try again" action.
- `app/loading.tsx`, `app/movies/loading.tsx`, `app/series/loading.tsx`, `app/anime/[id]/loading.tsx` — skeletons matching real layout shape.
- [`app/layout.tsx`](../../app/layout.tsx) — root layout, fonts, `metadataBase`/OG defaults.

## SEO

- [`app/robots.ts`](../../app/robots.ts), [`app/sitemap.ts`](../../app/sitemap.ts) — crawl rules + a bounded sitemap (static routes + first page of top anime; Jikan has no full enumerable ID list).

Next.js 16 note: `params`/`searchParams` are async (`Promise<...>`) — every page here awaits them.
