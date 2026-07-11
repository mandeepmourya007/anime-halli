/**
 * Raw TMDB v3 response types. Internal to this adapter only — nothing outside
 * `lib/providers/tmdb/` should ever import from this file.
 */

export interface TmdbGenreRef {
  id: number;
  name: string;
}

/** A movie item — from list/discover/search endpoints, or `/movie/{id}` detail. */
export interface TmdbMovie {
  id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  release_date: string | null;
  genre_ids?: number[];
  genres?: TmdbGenreRef[];
  runtime?: number | null;
  status?: string | null;
}

/** A TV item — TMDB uses `name`/`first_air_date` instead of `title`/`release_date`. */
export interface TmdbTv {
  id: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  first_air_date: string | null;
  genre_ids?: number[];
  genres?: TmdbGenreRef[];
  number_of_episodes?: number | null;
  status?: string | null;
}

/** `/search/multi` mixes movies, TV, and people in one list, tagged by `media_type`. */
export interface TmdbMultiSearchItem extends Partial<TmdbMovie>, Partial<TmdbTv> {
  media_type: "movie" | "tv" | "person";
}

export interface TmdbPagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbVideo {
  site: string;
  type: string;
  key: string;
}

export interface TmdbVideosResponse {
  results: TmdbVideo[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCreditsResponse {
  cast: TmdbCastMember[];
}

export interface TmdbGenresResponse {
  genres: TmdbGenreRef[];
}
