# Anime Halli — Next.js Anime Discovery App

## Context

Greenfield repo (only `LICENSE` + `README.md` exist). Goal: a frontend-only Next.js app that browses anime movies/shows, their names, and cast (voice actors), plus a rich detail page per title. No backend — data comes from a public open API. The build must use a scalable folder structure and a modern Gen-Z visual style.

### Decisions locked with the user
- **API:** Jikan v4 (`https://api.jikan.moe/v4`) — free, no API key, has anime + characters/voice-actors — is the **first provider**, but the app is designed to be **provider-agnostic** (see "API Abstraction" below) so we can swap to / fall back on AniList, Kitsu, TMDB, etc. without touching UI code. Rate limit: 3 req/sec, 60/min → mitigated with Next.js `fetch` caching (`revalidate`).
- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS. Data fetched in Server Components. No BE.
- **Visual direction:** "Neon Glass" pushed toward Apple **iOS Liquid Glass** — dark base (`#0a0a0f`), magenta→cyan gradients, oversized bold typography. iPhone-style glass: heavy `backdrop-blur` + saturation, translucent panels with a bright top-edge/inner highlight (specular sheen), soft layered shadows for depth, **squircle** rounded corners (large `border-radius`), thin light border to fake glass refraction, subtle neon glow on hover. Frosted navbar/cards float over a blurred, gradient-lit background.
- **Features (v1):** Home discover grid, category tabs (Top / Airing / Movies / Genre), Search, Pagination, and a detail page (synopsis, score, trailer, characters + voice actors).

## Folder Structure (scalable)

```
app/
  layout.tsx            root layout: fonts, <Navbar>, dark bg, metadata
  globals.css           tailwind directives + CSS vars + glass/neon utilities
  page.tsx              Home — CategoryTabs + MediaGrid + Pagination (reads ?tab=&page=)
  loading.tsx           home skeleton
  search/page.tsx       search results (reads ?q=&page=)
  anime/[id]/page.tsx   detail page
  anime/[id]/loading.tsx detail skeleton
components/
  layout/    Navbar.tsx, Container.tsx, Footer.tsx
  ui/        GlassCard.tsx, Badge.tsx, Skeleton.tsx, Spinner.tsx, GradientText.tsx
  media/     MediaCard.tsx, MediaGrid.tsx, CategoryTabs.tsx, Pagination.tsx,
             HeroBanner.tsx, CastList.tsx, TrailerEmbed.tsx
  search/    SearchBar.tsx (client component; pushes to /search?q=)
lib/
  media/
    index.ts            FACADE — the ONLY thing UI imports. `mediaService` = configured provider
    provider.ts         MediaProvider INTERFACE (contract) + query param types
    models.ts           normalized DOMAIN models (AnimeSummary, AnimeDetail, Character, VoiceActor, Genre, Paged<T>)
  providers/
    jikan/
      jikan.provider.ts implements MediaProvider (composes http client + mappers)
      jikan.mappers.ts  raw Jikan DTO -> domain model (isolates response-shape changes)
      jikan.dto.ts      raw Jikan response types (internal to this adapter only)
    anilist/            SECOND adapter scaffold (GraphQL) — proves the interface; can be fleshed out later
      anilist.provider.ts
    composite.provider.ts  FallbackProvider — tries providers in priority order, catches per-provider errors
    registry.ts         FACTORY — builds the active provider(s) from config (single or composite/fallback)
  http/
    fetcher.ts          generic fetch: auth-header injection, timeout, retry + rate-limit backoff, Next cache
    errors.ts           typed errors: ProviderError, RateLimitError, NotFoundError, AuthError
  config/
    providers.config.ts per-provider config: baseUrl, auth (key/token from env), enabled, priority
  utils/format.ts       helpers: truncate, formatScore, yearFrom, cn (class merge)
```
Root config files: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, updated `README.md`.

## Implementation Steps

### 1. Scaffold project
- Init Next.js App Router + TS + Tailwind + ESLint in-place (files added alongside existing `LICENSE`/`README.md`).
- Configure `next.config.ts` `images.remotePatterns` to allow `cdn.myanimelist.net` (Jikan image host) so `next/image` works.
- Add Google font (e.g. a bold display font like `Sora`/`Space Grotesk` + `Inter` body) via `next/font`.

### 2. API Abstraction — provider-agnostic data layer (the core of this design)

Goal: UI depends on **our own interface + domain models**, never on a vendor's response shape. Swapping Jikan → AniList, or running several with fallback, is a config change — zero UI edits. Patterns: **Adapter** (each provider maps its API to our contract), **Strategy/Provider** (swap impl via config), **Facade** (`mediaService` single entry), **Factory** (`registry` builds providers), **Composite / Chain-of-Responsibility** (fallback across providers), **DTO→Domain mapper** (quarantine response-shape changes).

**a. Domain models (`lib/media/models.ts`)** — stable app-internal types independent of any API:
`AnimeSummary` (id, title, posterUrl, score, type, year), `AnimeDetail` (extends summary + synopsis, bannerUrl, genres[], trailerYoutubeId, status, episodes), `Character` (id, name, imageUrl, role, voiceActor?), `VoiceActor` (name, language, imageUrl), `Genre`, and generic `Paged<T>` (`items`, `page`, `hasNext`, `lastPage`) so one `Pagination` component works across all providers.

**b. Provider contract (`lib/media/provider.ts`)** — the interface every adapter implements:
```ts
interface MediaProvider {
  name: string;
  getTop(q: ListQuery): Promise<Paged<AnimeSummary>>;
  getAiring(q: ListQuery): Promise<Paged<AnimeSummary>>;
  getMovies(q: ListQuery): Promise<Paged<AnimeSummary>>;
  search(q: SearchQuery): Promise<Paged<AnimeSummary>>;
  getById(id: string): Promise<AnimeDetail>;
  getCharacters(id: string): Promise<Character[]>;
  getGenres(): Promise<Genre[]>;
  getByGenre(q: GenreQuery): Promise<Paged<AnimeSummary>>;
}
```
Query types (`ListQuery { page }`, `SearchQuery { q; page }`, `GenreQuery { genreId; page }`) are provider-neutral.

**c. Jikan adapter (`lib/providers/jikan/`)**
- `jikan.dto.ts`: raw Jikan response types (used ONLY inside this folder).
- `jikan.mappers.ts`: `toAnimeSummary(dto)`, `toAnimeDetail(dto)`, `toCharacters(dto)` — the single place that breaks if Jikan changes a field/path.
- `jikan.provider.ts`: implements `MediaProvider`; builds paths (`/top/anime?type=movie`, `/anime?q=`, `/anime/{id}/full`, `/anime/{id}/characters`, `/genres/anime`, `/anime?genres=`), calls the shared `fetcher`, returns mapped domain models. Extracts `Paged<T>` from Jikan's `pagination` block.

**d. Second adapter scaffold (`lib/providers/anilist/`)** — a minimal `AniListProvider` stub implementing the same interface (GraphQL query + mapper), proving the abstraction holds for a totally different API. Fully wired later; scaffolded now to lock the contract.

**e. HTTP client (`lib/http/`)**
- `fetcher.ts`: `httpFetch<T>(url, opts)` — injects auth header when a provider config supplies a key/token, timeout, retry with backoff on `429`/5xx (respects rate limits), Next.js `revalidate` caching, throws typed errors. This is where "API later wants a key/auth" is absorbed — no UI change.
- `errors.ts`: `ProviderError`, `RateLimitError`, `NotFoundError`, `AuthError` — lets the composite provider decide whether to fall through.

**f. Config + registry (`lib/config/providers.config.ts`, `lib/providers/registry.ts`)**
- Config: array of `{ id, baseUrl, auth?: { header, envKey }, enabled, priority }` sourced from env (`.env`). Adding keys/auth = edit env + config only.
- `registry.ts`: reads config, instantiates enabled providers ordered by priority. If one enabled → return it; if many → wrap in `CompositeProvider`.

**g. Composite / fallback (`lib/providers/composite.provider.ts`)**
- `CompositeProvider` implements `MediaProvider`; for each method it tries providers in priority order, catching `ProviderError`/`RateLimitError`/`AuthError` and advancing to the next. If all fail, throws. Handles "primary API closed / down / rate-limited / now needs auth" transparently.

**h. Facade (`lib/media/index.ts`)**
- Exports `mediaService = registry.getProvider()`. **UI imports only from here** (`import { mediaService } from "@/lib/media"`). Switching or adding providers never touches `app/` or `components/`.

### 3. UI primitives & layout
- `globals.css`: dark theme CSS vars + a reusable **Liquid Glass** utility set — `.glass` (translucent `bg` rgba + `backdrop-blur-xl` + `backdrop-saturate-150` + thin `border` + soft layered `box-shadow`), `.glass-sheen` (top inner highlight via subtle top-lit `inset` shadow / gradient border for the iPhone specular edge), squircle radius token, gradient text, neon glow shadow. Blurred gradient "blobs" behind content so the glass actually has something to refract.
- `tailwind.config.ts`: extend colors (neon magenta/cyan/violet), fonts, `borderRadius` (squircle-scale), `backdropBlur`, and shadow tokens.
- `Navbar`: sticky Liquid-Glass bar (`.glass` + sheen) with logo (gradient wordmark), `SearchBar`, category links.
- `GlassCard` (the shared iPhone-glass surface used by cards/panels/modals), `GradientText`, `Badge`, `Skeleton`, `Spinner` primitives.

### 4. Home page (`app/page.tsx`)
- Server Component. Reads `searchParams` `tab` (top|airing|movies) + `page`. Calls `mediaService.getTop/getAiring/getMovies`.
- `CategoryTabs` (links that set `?tab=`), `MediaGrid` of `MediaCard`s (poster via `next/image`, title, score badge, type/year), `Pagination` driven by domain `Paged<T>` (`hasNext`, `lastPage`).
- Top section: `HeroBanner` featuring the top anime.

### 5. Search (`app/search/page.tsx`)
- `SearchBar` (client) → router push to `/search?q=`.
- Server component calls `mediaService.search`, renders `MediaGrid` + `Pagination`; empty state when no query/results.

### 6. Detail page (`app/anime/[id]/page.tsx`)
- Parallel fetch `mediaService.getById(id)` + `mediaService.getCharacters(id)`.
- `HeroBanner` with backdrop image + gradient overlay, title, score, genres as `Badge`s, synopsis.
- `TrailerEmbed` (YouTube iframe from domain `trailerYoutubeId`) when present.
- `CastList`: grid of `Character`s with their `voiceActor` (Japanese) — satisfies the "actors list" requirement.
- `generateMetadata` for per-title SEO. `loading.tsx` skeletons for home & detail.

### 7. Polish
- Loading skeletons, graceful error/empty states, responsive grid (2→3→5 cols), hover neon glow + scale on cards, `.env.example` documenting the (keyless) base URL, update `README.md` with setup/run instructions.

## Key References / Reuse
- Single source of truth for data: the `mediaService` facade in `lib/media/index.ts` — UI imports ONLY this, never a provider directly, never `fetch` inline.
- Domain `Paged<T>` normalizes pagination across providers → one `Pagination` component drives every paged view.
- Jikan quirk lives ONLY in `lib/providers/jikan/jikan.mappers.ts`: voice actors are nested per character in `/anime/{id}/characters` (`character.voice_actors[]`, filter `language === "Japanese"`) → mapped into our `Character.voiceActor`.
- To add/replace an API later: implement `MediaProvider` in a new `lib/providers/<name>/` folder + register it in config. No `app/` or `components/` changes.

## Future Scope (post-v1, not built now)

- **Multi-category expansion (Hollywood, Bollywood, cartoons, classic/old shows, misc):** the app is anime-only for v1, but the Adapter/Facade design generalizes directly — this is the reason we built it this way instead of hardcoding Jikan calls into the UI. The component/service layer is already named category-agnostically (`MediaProvider`, `mediaService`, `components/media/*`) so this expansion doesn't require another rename pass.
  - Generalize the domain further: today `mediaService` is a single facade backed by the Jikan anime provider. Evolve it into a `ContentProvider` per **category** (e.g. `MovieProvider` backed by TMDB for Hollywood/Bollywood, `CartoonProvider`, `ClassicTvProvider`), all implementing the same shape (`getTop`, `search`, `getById`, `getCast`, `getGenres`, paged results) — `Character`/`VoiceActor` generalize to `CastMember`.
  - Introduce a `category` field/route segment (`/[category]/...`, e.g. `/anime`, `/movies`, `/cartoons`) with a `registry` keyed by category → provider(s), reusing the existing `CompositeProvider` fallback per category.
  - TMDB (needs a free API key — already accounted for via `providers.config.ts` auth support) is the natural provider for Hollywood/Bollywood movies & old shows; `MediaGrid`/`MediaCard`/`Pagination`/`HeroBanner` already operate on the shared domain shape, so a new category is mostly a new provider + route, not a UI rewrite.
  - Home page evolves into a category switcher/landing (tabs or nav sections) rather than a single anime grid.
  - Practically: none of this blocks v1 — ship anime first, then when a second category is requested, add a new provider folder + category route, same pattern as adding AniList/Kitsu.
- **Multi-theme system (color + structural variants):** the user wants the ability to switch, with one click, between whole visual presentations of the app — not just recoloring, but structurally different card/grid shapes (e.g. Theme 1: current Neon Glass, rectangular squircle cards, grid layout; Theme 2: "Circular Pop" — circular cards with a small inset circular avatar/thumbnail, different arrangement). Planned architecture (design now, implement later, capped at 2–3 themes to keep it maintainable):
  - **Two independent layers, don't conflate them:**
    1. **Palette layer** (cheap): CSS-variable tokens already in `app/globals.css` (`--color-bg`, `--color-neon-*`, glass alpha values) get scoped per theme via a `data-theme="neon-glass" | "circular-pop"` attribute on `<html>`, with each theme's overrides in a `@theme` block or a `[data-theme="..."] { --color-...: ... }` selector block. No component changes needed for this layer alone.
    2. **Structural layer** (real work): components whose *shape* differs per theme (starting with `MediaCard`, possibly `MediaGrid`'s arrangement) are NOT branched with conditional JSX inside one file — instead each theme gets its own variant file, selected through the same Adapter/Registry pattern already used for data providers, applied to presentation:
       - `components/media/card-variants/RectCard.tsx` (Theme 1), `CircularCard.tsx` (Theme 2), both accept the same `MediaSummary` props (already shape-agnostic domain model) and render differently.
       - `components/media/MediaCard.tsx` becomes a thin dispatcher: reads active theme from a `ThemeContext`/`useTheme()` hook and renders the matching variant. Same idea for `MediaGrid` if a theme changes the arrangement (e.g. circular cards in a packed/staggered layout vs a strict grid).
  - **Switching mechanism:** a lightweight `ThemeProvider` (React context) wrapping `app/layout.tsx`, storing the active theme id in `localStorage`/cookie so it persists across visits; a `ThemeSwitcher` UI control (e.g. in `Navbar`) flips it instantly client-side — sets the `data-theme` attribute (palette) and updates context (structural variant selection) in one click, no reload, no flash (read the stored theme before first paint via an inline script or cookie-based SSR read to avoid FOUC).
  - **Guardrail — why capped, not an open-ended engine:** every additional structural theme requires a matching variant for every "theme-sensitive" component (currently just card/grid). Define an explicit small contract (e.g. "a theme must supply Card + Grid-arrangement variants") rather than letting themes grow unbounded — 2–3 well-made themes beat N half-finished ones.
  - **Sequencing:** ship v1 (current anime app, single Neon Glass theme) first; add the `ThemeProvider`/`data-theme` palette layer as a fast follow (low cost, high visible payoff); build the second structural variant (Circular Pop) only once the palette-switch plumbing is proven, since it validates the registry/dispatcher pattern before committing to a second full card design.
- **More providers wired end-to-end:** flesh out AniList adapter fully (GraphQL), add Kitsu/TMDB adapters; enable `CompositeProvider` fallback chain in production config.
- **Auth-ready providers:** when a provider requires an API key (TMDB, AniList rate-limited tier), the `fetcher`/`providers.config.ts` design already absorbs this — just add `envKey` + header mapping.
- **Caching/edge layer:** move from Next `revalidate` to a shared KV/edge cache (e.g. Vercel KV) in front of the composite provider to cut origin calls further and smooth over provider outages.
- **User features:** favorites/watchlist (localStorage first, account-backed later), continue-watching, ratings/reviews, related/recommended anime on detail page.
- **Richer discovery:** genre landing pages, seasonal calendar, advanced filters (year, status, rating), sort options, "surprise me" random pick.
- **Auth & accounts:** optional sign-in (NextAuth) enabling personalization once there's a reason to persist user data — still no custom backend, using a BaaS (Supabase/Clerk) if needed.
- **Performance/SEO:** ISR tuning per route, sitemap generation from provider data, structured data (JSON-LD) for anime detail pages, image optimization audit.
- **PWA/offline:** installable app shell, offline-cached "recently viewed."
- **i18n:** multi-language titles/synopses (Jikan/AniList both expose localized fields) + UI localization.
- **Testing:** unit tests for mappers (DTO→domain) per provider, integration tests for `CompositeProvider` fallback behavior, Playwright e2e for core flows.
- **Observability:** lightweight client analytics (page views, search terms) and provider-health logging (which provider served each request, fallback frequency) to inform when to reprioritize/replace a provider.

## Verification
- `npm run dev` → open `http://localhost:3000`:
  - Home renders grid; switching tabs (Top/Airing/Movies) changes results; pagination next/prev works.
  - Search from navbar returns results for a known title (e.g. "Naruto").
  - Click a card → detail page shows synopsis, score, genres, trailer (if any), and character/voice-actor list.
- `npm run build` succeeds (no TS/lint errors); images load via `next/image` (remotePattern configured).
- Verify Jikan rate limits aren't hit during normal browsing (caching via `revalidate` in place).
