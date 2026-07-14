/**
 * Domain models — stable, app-internal types independent of any provider's API shape.
 * UI and components should only ever depend on these types, never on a vendor DTO.
 *
 * Generalized (not anime-specific) because a real second content source (TMDB, general
 * movie/TV) now exists alongside the anime source (Jikan) — see docs/plan-anime-discovery-app.md.
 */

export type MediaType =
  | "TV"
  | "Movie"
  | "OVA"
  | "ONA"
  | "Special"
  | "Music"
  | "Unknown";

/**
 * Generic lifecycle status — broadened from anime-only wording ("Finished Airing"
 * etc.) since TMDB's movie/TV statuses ("Released", "Returning Series", "Canceled",
 * "Post Production", ...) don't map onto anime-specific terms. Not currently
 * rendered anywhere in the UI, so this was safe to broaden without a visual change.
 */
export type MediaStatus = "airing" | "finished" | "upcoming" | "unknown";

export interface Genre {
  id: string;
  name: string;
}

export interface MediaSummary {
  /** Always source-prefixed, e.g. "jikan-1", "tmdb-603" — see each adapter's mapper. */
  id: string;
  title: string;
  posterUrl: string | null;
  /**
   * A true wide/landscape image, distinct from `posterUrl` (portrait) — TMDB
   * provides this even at list level (`backdrop_path`); Jikan has no landscape
   * image at all, so it's always `null` for anime. Hero components must fall
   * back to `posterUrl` with `fit="contain"` when this is null, rather than
   * force-cropping a portrait poster into a landscape frame.
   */
  bannerUrl: string | null;
  score: number | null;
  type: MediaType;
  year: number | null;
}

export interface MediaDetail extends MediaSummary {
  synopsis: string | null;
  genres: Genre[];
  trailerYoutubeId: string | null;
  status: MediaStatus;
  episodes: number | null;
}

/**
 * Unifies two structurally inverted shapes: Jikan's cast entry is a fictional
 * character with a nested voice actor; TMDB's cast entry is an actor with the
 * character they play. Rather than pick one side, both map onto "primary" (the
 * character, for anime; the actor, for TMDB) and "secondary" (the voice actor,
 * for anime; the character played, for TMDB) — `CastList` renders primary bold
 * + secondary as the subtitle either way, so the UI doesn't need to know which
 * source a title came from.
 */
export interface CastMember {
  id: string;
  primaryName: string;
  secondaryName: string | null;
  imageUrl: string | null;
}

export interface Paged<T> {
  items: T[];
  page: number;
  hasNext: boolean;
  lastPage: number;
}

/**
 * A season within a show — currently TMDB-only (Jikan has no season concept),
 * see `lib/media/episodes.ts`. Deliberately not on `MediaDetail`/`MediaProvider`
 * since it's fetched separately (per-season episode lists would be far too
 * heavy to include in every detail response).
 */
export interface Season {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  year: number | null;
  posterUrl: string | null;
}

/**
 * A single episode within a season. `thumbnailUrl`/`runtimeMinutes` are null
 * for the Jikan fallback path (no TMDB match) — Jikan has no still images or
 * per-episode runtime, only a title and air date.
 */
export interface Episode {
  id: string;
  episodeNumber: number;
  name: string;
  thumbnailUrl: string | null;
  airDate: string | null;
  runtimeMinutes: number | null;
  overview: string | null;
}
