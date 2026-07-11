import type { AnimeDetail, AnimeSummary, Character, Genre, Paged } from "./models";

/** Provider-neutral query parameter types shared by every adapter. */
export interface ListQuery {
  page?: number;
}

export interface SearchQuery {
  q: string;
  page?: number;
}

export interface GenreQuery {
  genreId: string;
  page?: number;
}

/**
 * The contract every media data provider (Jikan, AniList, Kitsu, TMDB, ...) must implement.
 * The rest of the app depends ONLY on this interface + the domain models, never on a
 * vendor's response shape. Swapping/adding providers is a config change, not a UI change.
 */
export interface MediaProvider {
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
