import { getAvailability, type StreamingSource } from "@/lib/providers/watchmode/watchmode.provider";

export type { StreamingSource };

const TMDB_ID_PATTERN = /^tmdb-(movie|tv)-(\d+)$/;

/**
 * Resolves streaming availability for a merged media id — but only when that
 * id is a TMDB one (`tmdb-movie-603` / `tmdb-tv-1396`), since Watchmode's
 * lookup is TMDB-ID-based. Any other id shape (e.g. a Jikan-only anime with no
 * TMDB id) returns an empty list, not an error — this is what makes the
 * "Where to Watch" section a movies/TV feature more than an anime one, and
 * that's expected, not a bug (see docs/plan-anime-discovery-app.md).
 *
 * Lives in `lib/media/` (not called directly from `app/`) so the app only ever
 * imports the facade, never reaches into `lib/providers/*` itself.
 */
export async function getAvailabilityForMedia(mediaId: string): Promise<StreamingSource[]> {
  const match = TMDB_ID_PATTERN.exec(mediaId);
  if (!match) return [];
  const [, kind, rawId] = match;
  return getAvailability(rawId, kind as "movie" | "tv");
}
