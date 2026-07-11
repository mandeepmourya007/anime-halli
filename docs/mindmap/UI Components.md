# UI Components

← [[Anime Halli]] · styling detail in [[Styling and Theme]]

## Layout

- [`components/layout/Navbar.tsx`](../../components/layout/Navbar.tsx) — sticky frosted-glass bar, logo, category links, search.
- [`components/layout/Container.tsx`](../../components/layout/Container.tsx) — responsive max-width wrapper used by every page.
- [`components/layout/Footer.tsx`](../../components/layout/Footer.tsx) — attribution footer.

## UI primitives (`components/ui/`)

- `GlassCard` — the shared Liquid-Glass surface (cards, panels).
- `Badge`, `GradientText`, `Skeleton`, `Spinner` — small display primitives.
- `EmptyState` — shared "no results" panel (used by grid + search page — extracted to kill duplication).
- `MediaThumbnail` — shared image-or-placeholder wrapper (used by card, hero banner, cast list — extracted for the same reason).

## Media components (`components/media/`)

- `MediaCard` / `MediaGrid` — the poster grid, generically named (not `AnimeCard`) so a future content category doesn't require a rename — see [[Future Scope]].
- `HeroBanner` — featured/detail-page header.
- `CastList` — character + Japanese voice-actor grid.
- `TrailerEmbed` — YouTube iframe wrapper.
- `CategoryTabs`, `Pagination` — tab switcher and first-3/last-3-page pagination.
- `MediaLink` — every link into the detail route (`/anime/[id]`) goes through this; bakes in `prefetch={false}` since that route's data fetch hits rate-limited external APIs (TMDB, Watchmode) and Next's default viewport prefetching of a whole grid queues up badly on a real network.

## Search

- [`components/search/SearchBar.tsx`](../../components/search/SearchBar.tsx) — the one client component in the app (`"use client"`, needs `useSearchParams`), wrapped in `<Suspense>` in `Navbar`.

See [[Pages and Routes]] for how these get assembled.
