import { jikanProvider, tmdbProvider } from "./category-providers";
import type { Episode, Season } from "./models";

export interface SeasonEpisodesData {
  seasons: Season[];
  selectedSeason: number;
  episodes: Episode[];
}

const TMDB_TV_ID_PATTERN = /^tmdb-tv-(\d+)$/;
const TMDB_MOVIE_ID_PATTERN = /^tmdb-movie-/;
const JIKAN_ID_PATTERN = /^jikan-(\d+)$/;

/**
 * Resolves the seasons + selected season's episodes for a merged media id —
 * mirrors `getAvailabilityForMedia` (never throws; returns `null` when the
 * media has no episode/season concept, or a lookup fails). Lives in
 * `lib/media/` so the app only ever imports the facade, never `lib/providers/*`.
 *
 * - `tmdb-tv-*`: real seasons + episodes straight from TMDB.
 * - `jikan-*` (anime): Jikan has no seasons and no episode thumbnails/runtime,
 *   so this first tries to match the anime's title to a TMDB tv entry (which
 *   does have both) and only falls back to Jikan's flat, title-only episode
 *   list when no confident match exists.
 * - `tmdb-movie-*` / anything else: `null` — no episodes section to render.
 */
export async function getSeasonEpisodes(
  mediaId: string,
  requestedSeason?: number,
): Promise<SeasonEpisodesData | null> {
  try {
    const tvMatch = TMDB_TV_ID_PATTERN.exec(mediaId);
    if (tvMatch) {
      return await getTmdbTvSeasonEpisodes(tvMatch[1], requestedSeason);
    }

    if (TMDB_MOVIE_ID_PATTERN.test(mediaId)) return null;

    const jikanMatch = JIKAN_ID_PATTERN.exec(mediaId);
    if (jikanMatch) {
      return await getAnimeSeasonEpisodes(mediaId, requestedSeason);
    }

    return null;
  } catch (err) {
    console.error(`Failed to load season episodes for ${mediaId}:`, err);
    return null;
  }
}

async function getTmdbTvSeasonEpisodes(
  rawId: string,
  requestedSeason?: number,
): Promise<SeasonEpisodesData | null> {
  if (!tmdbProvider) return null;

  const seasons = await tmdbProvider.getTvSeasons(rawId);
  if (seasons.length === 0) return null;

  const selectedSeason = resolveSelectedSeason(seasons, requestedSeason);
  const episodes = await tmdbProvider.getTvSeasonEpisodes(rawId, selectedSeason);
  return { seasons, selectedSeason, episodes };
}

/** No TMDB provider configured, or no confident title match — a single
 * synthetic "season" wrapping Jikan's flat, title-only episode list. */
async function jikanFallback(jikanRawId: string): Promise<SeasonEpisodesData> {
  const episodes = await jikanProvider.getEpisodes(jikanRawId);
  const seasons: Season[] = [
    { seasonNumber: 1, name: "Episodes", episodeCount: episodes.length, year: null, posterUrl: null },
  ];
  return { seasons, selectedSeason: 1, episodes };
}

async function getAnimeSeasonEpisodes(
  jikanId: string,
  requestedSeason?: number,
): Promise<SeasonEpisodesData> {
  const jikanRawId = jikanId.slice("jikan-".length);

  if (!tmdbProvider) return jikanFallback(jikanRawId);

  const anime = await jikanProvider.getById(jikanId);
  const tvId = await tmdbProvider.searchTvId(anime.title, anime.year);
  if (!tvId) return jikanFallback(jikanRawId);

  const matched = await getTmdbTvSeasonEpisodes(tvId, requestedSeason);
  return matched ?? (await jikanFallback(jikanRawId));
}

function resolveSelectedSeason(seasons: Season[], requestedSeason?: number): number {
  if (requestedSeason != null && seasons.some((s) => s.seasonNumber === requestedSeason)) {
    return requestedSeason;
  }
  // Default to the latest season, not just the last array entry — TMDB
  // generally returns seasons in order, but sorting here is a cheap guarantee.
  return Math.max(...seasons.map((s) => s.seasonNumber));
}
