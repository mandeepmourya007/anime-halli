/**
 * Single source of truth for each category page's sub-tabs — consumed by
 * `CategoryTabs` (the tab switcher) and each page's own tab validation, kept
 * in one place per category so a tab added to one doesn't silently drift.
 */

/**
 * Backed by lib/media/anime-merge.ts — Jikan (always anime) + TMDB's
 * anime-scoped queries (genre=Animation + origin=Japan), TMDB preferred on
 * overlap, so anime that TMDB also catalogs get its real backdrop image
 * instead of a stretched poster. Trending/Top are genuinely different sorts
 * (popularity vs. rating), not the same data relabeled.
 */
export const ANIME_TABS = [
  { value: "trending", label: "Trending" },
  { value: "top", label: "Top" },
  { value: "airing", label: "Airing" },
  { value: "movies", label: "Movies" },
] as const;

/**
 * Sort/freshness dimension — independent of region (see `MOVIE_REGIONS`
 * below). Bollywood/Hollywood used to live in this same list, which meant you
 * could only ever see "Bollywood" (one fixed query) and never "Top Bollywood"
 * or "Trending Bollywood" — region and sort are two different axes, not one
 * flat list of mutually-exclusive tabs.
 */
export const MOVIE_TABS = [
  { value: "trending", label: "Trending" },
  { value: "top", label: "Top" },
  { value: "new", label: "New" },
] as const;

/** Region dimension for Movies — crossed with `MOVIE_TABS`, e.g. "Trending
 * Bollywood" or "Top Hollywood", via the TMDB country-scoped discover query. */
export const MOVIE_REGIONS = [
  { value: "all", label: "All" },
  { value: "bollywood", label: "Bollywood" },
  { value: "hollywood", label: "Hollywood" },
] as const;

/** TMDB `with_origin_country` code per region — kept next to `MOVIE_REGIONS`
 * so adding a region means editing one data table, not page code. `"all"` has
 * no entry (no country filter). */
export const COUNTRY_BY_REGION: Partial<Record<(typeof MOVIE_REGIONS)[number]["value"], string>> = {
  bollywood: "IN",
  hollywood: "US",
};

export const SERIES_TABS = [
  { value: "trending", label: "Trending" },
  { value: "top", label: "Top" },
  { value: "new", label: "New" },
] as const;

export type AnimeTab = (typeof ANIME_TABS)[number]["value"];
export type MovieTab = (typeof MOVIE_TABS)[number]["value"];
export type MovieRegion = (typeof MOVIE_REGIONS)[number]["value"];
export type SeriesTab = (typeof SERIES_TABS)[number]["value"];

export const VALID_ANIME_TABS: ReadonlySet<string> = new Set(ANIME_TABS.map((t) => t.value));
export const VALID_MOVIE_TABS: ReadonlySet<string> = new Set(MOVIE_TABS.map((t) => t.value));
export const VALID_MOVIE_REGIONS: ReadonlySet<string> = new Set(MOVIE_REGIONS.map((r) => r.value));
export const VALID_SERIES_TABS: ReadonlySet<string> = new Set(SERIES_TABS.map((t) => t.value));

/** Default/fallback tab for every category page — Trending is the first tab
 * everywhere (see ANIME_TABS/MOVIE_TABS/SERIES_TABS above), so it's also what
 * loads with no `?tab=` in the URL. */
const DEFAULT_TAB = "trending";

/**
 * Shared by all three category pages — validates `?tab=` against that page's
 * own valid set (falling back to `DEFAULT_TAB`) and clamps `?page=` to >= 1.
 * Small, but the exact three-liner it replaces was duplicated across all
 * three pages.
 */
export function resolveListParams(
  params: { tab?: string; page?: string },
  validTabs: ReadonlySet<string>,
): { tab: string; page: number } {
  const tab = params.tab && validTabs.has(params.tab) ? params.tab : DEFAULT_TAB;
  const page = Math.max(1, Number(params.page) || 1);
  return { tab, page };
}

/** Same fallback pattern as `resolveListParams`, for a second independent
 * dimension (currently just Movies' region) — falls back to `fallback`. */
export function resolveDimension(
  value: string | undefined,
  validValues: ReadonlySet<string>,
  fallback: string,
): string {
  return value && validValues.has(value) ? value : fallback;
}
