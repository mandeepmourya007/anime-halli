# Pages and Routes

← [[Anime Halli]] · assembles [[UI Components]] via [[Data Layer]]

## Routes

- [`app/page.tsx`](../../app/page.tsx) — home: hero + category tabs (`?tab=top|airing|movies`) + grid + pagination.
- [`app/search/page.tsx`](../../app/search/page.tsx) — search results (`?q=&page=`).
- [`app/anime/[id]/page.tsx`](../../app/anime/[id]/page.tsx) — detail page (synopsis, trailer, cast). Only a real `NotFoundError` renders 404; other failures are logged and rethrown to `error.tsx`.
- [`app/anime/[id]/error.tsx`](../../app/anime/[id]/error.tsx) — error boundary with a "Try again" action.
- `app/loading.tsx`, `app/anime/[id]/loading.tsx` — skeletons matching real layout shape.
- [`app/layout.tsx`](../../app/layout.tsx) — root layout, fonts, `metadataBase`/OG defaults.

## SEO

- [`app/robots.ts`](../../app/robots.ts), [`app/sitemap.ts`](../../app/sitemap.ts) — crawl rules + a bounded sitemap (static routes + first page of top anime; Jikan has no full enumerable ID list).

Next.js 16 note: `params`/`searchParams` are async (`Promise<...>`) — every page here awaits them.
