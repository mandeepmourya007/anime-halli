import type { MediaDetail, MediaSummary, CastMember, Genre, Paged } from "./models";

/** Provider-neutral query parameter types shared by every adapter. */
export interface ListQuery {
  page?: number;
}

export interface SearchQuery {
  q: string;
  page?: number;
}

export interface GenreQuery {
  /**
   * A genre NAME, not a provider-specific ID — TMDB and Jikan use incompatible
   * genre ID taxonomies, so the merged system filters by name and each adapter
   * resolves it to its own ID internally.
   */
  genreName: string;
  page?: number;
}

/**
 * The contract every media data provider (Jikan, TMDB, AniList, ...) must implement.
 * The rest of the app depends ONLY on this interface + the domain models, never on a
 * vendor's response shape. Swapping/adding providers is a config change, not a UI change.
 *
 * Every id returned by `getById`/`search`/list methods MUST be prefixed with this
 * provider's `name` (e.g. `jikan-1`, `tmdb-movie-603`) — `MergingProvider.getById`/
 * `getCast` route a merged id back to its source by parsing this prefix, so a mapper
 * that forgets it breaks routing silently (see `lib/providers/merging.provider.ts`).
 */
export interface MediaProvider {
  name: string;
  getTop(q: ListQuery): Promise<Paged<MediaSummary>>;
  getAiring(q: ListQuery): Promise<Paged<MediaSummary>>;
  getMovies(q: ListQuery): Promise<Paged<MediaSummary>>;
  search(q: SearchQuery): Promise<Paged<MediaSummary>>;
  getById(id: string): Promise<MediaDetail>;
  getCast(id: string): Promise<CastMember[]>;
  getGenres(): Promise<Genre[]>;
  getByGenre(q: GenreQuery): Promise<Paged<MediaSummary>>;
}
