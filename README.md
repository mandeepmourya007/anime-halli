# Anime Halli

A frontend-only Next.js app for discovering anime — top charts, currently airing titles, movies, search, and a rich detail page with synopsis, trailer, and cast/voice-actor info. Visual style: dark "Neon Glass" pushed toward Apple's iOS Liquid Glass look (frosted, translucent panels, squircle corners, magenta→violet→cyan neon accents).

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 (theming via `@theme` in `app/globals.css` — no `tailwind.config.ts`)
- Data fetched server-side in Server Components, no custom backend
- [Jikan v4](https://jikan.moe) (unofficial MyAnimeList API) as the default data provider

## Folder structure

```
app/                     routes (App Router)
  page.tsx                 home — category tabs + grid + pagination (?tab=&page=)
  search/page.tsx           search results (?q=&page=)
  anime/[id]/page.tsx       detail page (synopsis, trailer, cast)
components/
  layout/                  Navbar, Container, Footer
  ui/                      GlassCard, Badge, Skeleton, Spinner, GradientText
  media/                   MediaCard, MediaGrid, CategoryTabs, Pagination,
                            HeroBanner, CastList, TrailerEmbed
  search/                  SearchBar (client component)
lib/
  media/                   domain models + MediaProvider interface + mediaService facade
  providers/               jikan/ (real adapter), anilist/ (scaffold),
                            composite.provider.ts (fallback chain), registry.ts (factory)
  http/                    fetcher.ts (timeout/retry/cache), errors.ts (typed errors)
  config/                  providers.config.ts (per-provider env-driven config)
  utils/                   format.ts (truncate, formatScore, yearFrom, cn)
docs/                      design plan + wireframes
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No API key is required — Jikan is free and keyless. Copy `.env.example` to `.env` if you want to override the base URL or enable the AniList scaffold.

```bash
npm run build   # production build (type-checked + linted)
npm run lint
npm run test    # unit tests (mappers, composite-provider fallback, registry guard)
```

## Provider-agnostic data layer

The app never calls `fetch` or imports a vendor SDK directly from `app/` or `components/`. Instead:

- `lib/media/provider.ts` defines a `MediaProvider` interface (`getTop`, `getAiring`, `getMovies`, `search`, `getById`, `getCharacters`, `getGenres`, `getByGenre`) and provider-neutral query types.
- `lib/media/models.ts` defines stable domain models (`AnimeSummary`, `AnimeDetail`, `Character`, `VoiceActor`, `Genre`, `Paged<T>`) independent of any vendor's response shape.
- Each provider lives in its own `lib/providers/<name>/` folder and implements `MediaProvider`. `lib/providers/jikan/` is the real, fully-wired adapter; `lib/providers/anilist/` is a minimal scaffold that proves the contract holds for a GraphQL API.
- `lib/providers/registry.ts` reads `lib/config/providers.config.ts` (env-driven: base URL, auth, enabled, priority) and builds the active provider — or a `CompositeProvider` fallback chain when multiple providers are enabled.
- `lib/media/index.ts` exports `mediaService`, the single facade the UI imports (`import { mediaService } from "@/lib/media"`).

**To add or swap a provider:** implement `MediaProvider` in a new `lib/providers/<name>/` folder (DTO types + a mapper file that isolates that vendor's response shape + the provider class), register it in `lib/config/providers.config.ts`, and enable it via env. No changes needed in `app/` or `components/`.

## Data & attribution

Anime data, images, and character/voice-actor info are served by [Jikan](https://jikan.moe), an unofficial MyAnimeList API. This project is not affiliated with MyAnimeList.

## Deploying

Deploys cleanly to any Next.js host (e.g. Vercel) with no required secrets — Jikan needs no API key. Optional env vars (see `.env.example`): `NEXT_PUBLIC_SITE_URL` (for correct absolute URLs in metadata/sitemap/robots), `ANILIST_ENABLED`/`ANILIST_API_KEY` if you want to turn on the AniList scaffold.

CI (`.github/workflows/ci.yml`) runs lint, tests, and a production build on every push/PR.

**Known limitations, by design, not yet addressed:**
- The proactive rate limiter (`lib/http/rate-limiter.ts`) is in-memory and process-local. It works correctly on a single long-running server; on a multi-instance serverless deployment each instance has its own bucket, so it under-throttles relative to Jikan's global limit under heavy concurrent load. Caching (`revalidate`) still protects steady-state traffic regardless.
- No error-tracking/observability service (e.g. Sentry) is wired in — failures are `console.error`-logged only.
- No analytics.
- The sitemap only includes static routes plus the first page of top anime (Jikan doesn't expose a full enumerable ID list without many requests).

None of these block a real deploy — they're the natural next additions once the app is live and you have a sense of actual traffic.
