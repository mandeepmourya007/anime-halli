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
