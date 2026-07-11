import type { MediaDetail, MediaSummary, CastMember, Genre, Paged } from "@/lib/media/models";
import type { MediaProvider, GenreQuery, ListQuery, SearchQuery } from "@/lib/media/provider";
import type { ProviderConfig } from "@/lib/config/providers.config";
import { httpFetch } from "@/lib/http/fetcher";
import { authInjector } from "@/lib/http/auth-injector";
import { isSameTitle } from "@/lib/utils/fuzzy-match";
import type {
  TmdbCreditsResponse,
  TmdbGenresResponse,
  TmdbMovie,
  TmdbMultiSearchItem,
  TmdbPagedResponse,
  TmdbTv,
  TmdbVideosResponse,
} from "./tmdb.dto";
import {
  fromSourceId,
  toCastMember,
  toGenre,
  toMediaDetailFromMovie,
  toMediaDetailFromTv,
  toMediaSummaryFromMovie,
  toMediaSummaryFromMulti,
  toMediaSummaryFromTv,
} from "./tmdb.mappers";

const LIST_REVALIDATE_SECONDS = 60 * 30; // 30 minutes.
const DETAIL_REVALIDATE_SECONDS = 60 * 60; // 1 hour.

// TMDB no longer enforces a hard rate limit, but a generous self-throttle keeps
// this adapter consistent with every other provider and protects against runaway
// concurrent requests on a cache-cold burst.
const TMDB_RATE_LIMIT = { perSecond: 20 };

function toPaged<T>(items: T[], page: TmdbPagedResponse<unknown>): Paged<T> {
  return {
    items,
    page: page.page,
    hasNext: page.page < page.total_pages,
    lastPage: page.total_pages,
  };
}

export class TmdbProvider implements MediaProvider {
  readonly name = "tmdb";
  private readonly baseUrl: string;
  private readonly injectAuth: ((headers: Record<string, string>) => void) | undefined;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl;
    this.injectAuth = authInjector(config.auth);
  }

  private buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private fetchJson<T>(path: string, params: Record<string, string | number | undefined> = {}, revalidate = LIST_REVALIDATE_SECONDS) {
    return httpFetch<T>(this.buildUrl(path, params), {
      revalidate,
      provider: this.name,
      rateLimit: TMDB_RATE_LIMIT,
      injectAuth: this.injectAuth,
    });
  }

  async getTop(q: ListQuery): Promise<Paged<MediaSummary>> {
    const page = await this.fetchJson<TmdbPagedResponse<TmdbMultiSearchItem>>("/trending/all/week", {
      page: q.page ?? 1,
    });
    const items = page.results
      .map(toMediaSummaryFromMulti)
      .filter((item): item is MediaSummary => item !== null);
    return toPaged(items, page);
  }

  async getAiring(q: ListQuery): Promise<Paged<MediaSummary>> {
    const page = await this.fetchJson<TmdbPagedResponse<TmdbTv>>("/tv/on_the_air", { page: q.page ?? 1 });
    return toPaged(page.results.map(toMediaSummaryFromTv), page);
  }

  async getMovies(q: ListQuery): Promise<Paged<MediaSummary>> {
    const page = await this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/movie/top_rated", { page: q.page ?? 1 });
    return toPaged(page.results.map(toMediaSummaryFromMovie), page);
  }

  /**
   * Category-specific views for the dedicated Movies/Web Series pages — outside
   * the shared `MediaProvider` interface, since these are TMDB-only concepts
   * (e.g. origin-country filtering), not part of the cross-provider contract.
   */

  async getTrendingMovies(page: number): Promise<Paged<MediaSummary>> {
    const res = await this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/trending/movie/week", { page });
    return toPaged(res.results.map(toMediaSummaryFromMovie), res);
  }

  async getNewMovies(page: number): Promise<Paged<MediaSummary>> {
    const res = await this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/movie/now_playing", { page });
    return toPaged(res.results.map(toMediaSummaryFromMovie), res);
  }

  /**
   * Bollywood (`countryCode: "IN"`) / Hollywood (`"US"`) — filtered by origin
   * country rather than language, which catches co-productions and doesn't
   * miss dubbed/subtitled releases. `sort` is the same Top/Trending/New
   * dimension as the unfiltered Movies tabs — region and sort are independent
   * (see lib/media/tabs.ts), so Bollywood/Hollywood get their own Top/Trending/
   * New instead of one fixed query.
   */
  async getMoviesByCountry(
    page: number,
    countryCode: string,
    sort: "top" | "trending" | "new" = "trending",
  ): Promise<Paged<MediaSummary>> {
    const params: Record<string, string | number> = { with_origin_country: countryCode, page };

    if (sort === "top") {
      // TMDB has no per-country "trending" signal, so "top" here means
      // critically well-rated with a minimum vote count (avoids a single
      // 10/10 vote from one person outranking genuinely popular films).
      params.sort_by = "vote_average.desc";
      params["vote_count.gte"] = 100;
    } else if (sort === "new") {
      params.sort_by = "primary_release_date.desc";
      params["primary_release_date.lte"] = new Date().toISOString().slice(0, 10);
    } else {
      params.sort_by = "popularity.desc";
    }

    const res = await this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/discover/movie", params);
    return toPaged(res.results.map(toMediaSummaryFromMovie), res);
  }

  async getTopTv(page: number): Promise<Paged<MediaSummary>> {
    const res = await this.fetchJson<TmdbPagedResponse<TmdbTv>>("/tv/top_rated", { page });
    return toPaged(res.results.map(toMediaSummaryFromTv), res);
  }

  async getTrendingTv(page: number): Promise<Paged<MediaSummary>> {
    const res = await this.fetchJson<TmdbPagedResponse<TmdbTv>>("/trending/tv/week", { page });
    return toPaged(res.results.map(toMediaSummaryFromTv), res);
  }

  async getNewTv(page: number): Promise<Paged<MediaSummary>> {
    const res = await this.fetchJson<TmdbPagedResponse<TmdbTv>>("/tv/on_the_air", { page });
    return toPaged(res.results.map(toMediaSummaryFromTv), res);
  }

  async search(q: SearchQuery): Promise<Paged<MediaSummary>> {
    if (!q.q?.trim()) {
      return { items: [], page: 1, hasNext: false, lastPage: 1 };
    }
    const page = await this.fetchJson<TmdbPagedResponse<TmdbMultiSearchItem>>("/search/multi", {
      query: q.q,
      page: q.page ?? 1,
    });
    const items = page.results
      .map(toMediaSummaryFromMulti)
      .filter((item): item is MediaSummary => item !== null);
    return toPaged(items, page);
  }

  async getById(id: string): Promise<MediaDetail> {
    const { kind, rawId } = fromSourceId(id);
    if (kind === "movie") {
      const [movie, videos] = await Promise.all([
        this.fetchJson<TmdbMovie>(`/movie/${rawId}`, {}, DETAIL_REVALIDATE_SECONDS),
        this.fetchJson<TmdbVideosResponse>(`/movie/${rawId}/videos`, {}, DETAIL_REVALIDATE_SECONDS),
      ]);
      return toMediaDetailFromMovie(movie, videos.results);
    }
    const [tv, videos] = await Promise.all([
      this.fetchJson<TmdbTv>(`/tv/${rawId}`, {}, DETAIL_REVALIDATE_SECONDS),
      this.fetchJson<TmdbVideosResponse>(`/tv/${rawId}/videos`, {}, DETAIL_REVALIDATE_SECONDS),
    ]);
    return toMediaDetailFromTv(tv, videos.results);
  }

  async getCast(id: string): Promise<CastMember[]> {
    const { kind, rawId } = fromSourceId(id);
    const path = kind === "movie" ? `/movie/${rawId}/credits` : `/tv/${rawId}/credits`;
    const res = await this.fetchJson<TmdbCreditsResponse>(path, {}, DETAIL_REVALIDATE_SECONDS);
    return res.cast.map(toCastMember);
  }

  /** Shared by getGenres/getByGenre/getAnime* — TMDB has separate genre
   * taxonomies per content type, every caller needs the raw per-type lists
   * resolved the same way. */
  private async resolveGenreLists(): Promise<{ movie: Genre[]; tv: Genre[] }> {
    const [movieGenres, tvGenres] = await Promise.all([
      this.fetchJson<TmdbGenresResponse>("/genre/movie/list", {}, 60 * 60 * 24),
      this.fetchJson<TmdbGenresResponse>("/genre/tv/list", {}, 60 * 60 * 24),
    ]);
    return { movie: movieGenres.genres.map(toGenre), tv: tvGenres.genres.map(toGenre) };
  }

  /** Combines an already-fetched movie page + TV page into one deduped,
   * score-sorted `Paged<MediaSummary>` — shared by `getByGenre` and the
   * anime-scoped `getAnimeTop`, since both merge two TMDB endpoints the same way. */
  private mergeMovieAndTvPages(
    moviePage: TmdbPagedResponse<TmdbMovie> | null,
    tvPage: TmdbPagedResponse<TmdbTv> | null,
    page: number,
  ): Paged<MediaSummary> {
    // Merging two independently-paginated TMDB endpoints (movie + tv) into one
    // page — approximate, same caveat as the cross-provider merge (see
    // MergingProvider): "page N" here means "page N of each, combined", not a
    // globally consistent offset.
    const sorted = [
      ...(moviePage?.results.map(toMediaSummaryFromMovie) ?? []),
      ...(tvPage?.results.map(toMediaSummaryFromTv) ?? []),
    ].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // A movie and its TV adaptation can share a title — dedupe the same way
    // MergingProvider does, keeping the first (here: highest-scored) match
    // rather than showing both.
    const items: MediaSummary[] = [];
    for (const item of sorted) {
      const isDuplicate = items.some((existing) =>
        isSameTitle(existing.title, item.title, existing.year, item.year),
      );
      if (!isDuplicate) items.push(item);
    }

    const hasNext = [moviePage, tvPage].some((p) => p && p.page < p.total_pages);
    const lastPage = Math.max(moviePage?.total_pages ?? 1, tvPage?.total_pages ?? 1);

    return { items, page, hasNext, lastPage };
  }

  async getGenres(): Promise<Genre[]> {
    const { movie, tv } = await this.resolveGenreLists();
    const byName = new Map<string, Genre>();
    for (const g of [...movie, ...tv]) {
      const key = g.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, g);
    }
    return Array.from(byName.values());
  }

  async getByGenre(q: GenreQuery): Promise<Paged<MediaSummary>> {
    const { movie: movieGenres, tv: tvGenres } = await this.resolveGenreLists();
    const nameLower = q.genreName.toLowerCase();
    const movieGenreId = movieGenres.find((g) => g.name.toLowerCase() === nameLower)?.id;
    const tvGenreId = tvGenres.find((g) => g.name.toLowerCase() === nameLower)?.id;

    if (movieGenreId === undefined && tvGenreId === undefined) {
      return { items: [], page: 1, hasNext: false, lastPage: 1 };
    }

    const [moviePage, tvPage] = await Promise.all([
      movieGenreId !== undefined
        ? this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/discover/movie", {
            with_genres: movieGenreId,
            page: q.page ?? 1,
          })
        : null,
      tvGenreId !== undefined
        ? this.fetchJson<TmdbPagedResponse<TmdbTv>>("/discover/tv", {
            with_genres: tvGenreId,
            page: q.page ?? 1,
          })
        : null,
    ]);

    return this.mergeMovieAndTvPages(moviePage, tvPage, q.page ?? 1);
  }

  /**
   * Anime-scoped views for the Anime page's Jikan+TMDB merge (see
   * lib/media/anime-merge.ts) — filtered to genre=Animation + origin=Japan,
   * the standard heuristic for "this is anime" on TMDB. Deliberately separate
   * from `getTop`/`getAiring`/`getMovies` above: those are general-purpose
   * (also used directly by the Movies/Web Series pages), and making them
   * anime-only would break that unrelated usage.
   */

  private async resolveAnimeGenreIds(): Promise<{ movie?: string; tv?: string }> {
    const { movie, tv } = await this.resolveGenreLists();
    return {
      movie: movie.find((g) => g.name.toLowerCase() === "animation")?.id,
      tv: tv.find((g) => g.name.toLowerCase() === "animation")?.id,
    };
  }

  /** Top = highest-rated (distinct from Trending = most popular right now). */
  async getAnimeTop(page: number): Promise<Paged<MediaSummary>> {
    const { movie: movieGenreId, tv: tvGenreId } = await this.resolveAnimeGenreIds();
    const [moviePage, tvPage] = await Promise.all([
      movieGenreId
        ? this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/discover/movie", {
            with_genres: movieGenreId,
            with_origin_country: "JP",
            sort_by: "vote_average.desc",
            "vote_count.gte": 100,
            page,
          })
        : null,
      tvGenreId
        ? this.fetchJson<TmdbPagedResponse<TmdbTv>>("/discover/tv", {
            with_genres: tvGenreId,
            with_origin_country: "JP",
            sort_by: "vote_average.desc",
            "vote_count.gte": 100,
            page,
          })
        : null,
    ]);
    return this.mergeMovieAndTvPages(moviePage, tvPage, page);
  }

  /** Most popular right now — distinct from Top's all-time rating sort. */
  async getAnimeTrending(page: number): Promise<Paged<MediaSummary>> {
    const { movie: movieGenreId, tv: tvGenreId } = await this.resolveAnimeGenreIds();
    const [moviePage, tvPage] = await Promise.all([
      movieGenreId
        ? this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/discover/movie", {
            with_genres: movieGenreId,
            with_origin_country: "JP",
            sort_by: "popularity.desc",
            page,
          })
        : null,
      tvGenreId
        ? this.fetchJson<TmdbPagedResponse<TmdbTv>>("/discover/tv", {
            with_genres: tvGenreId,
            with_origin_country: "JP",
            sort_by: "popularity.desc",
            page,
          })
        : null,
    ]);
    return this.mergeMovieAndTvPages(moviePage, tvPage, page);
  }

  async getAnimeAiring(page: number): Promise<Paged<MediaSummary>> {
    const { tv: tvGenreId } = await this.resolveAnimeGenreIds();
    if (!tvGenreId) return { items: [], page, hasNext: false, lastPage: 1 };

    const res = await this.fetchJson<TmdbPagedResponse<TmdbTv>>("/discover/tv", {
      with_genres: tvGenreId,
      with_origin_country: "JP",
      with_status: "0", // Returning Series
      sort_by: "popularity.desc",
      page,
    });
    return toPaged(res.results.map(toMediaSummaryFromTv), res);
  }

  async getAnimeMovies(page: number): Promise<Paged<MediaSummary>> {
    const { movie: movieGenreId } = await this.resolveAnimeGenreIds();
    if (!movieGenreId) return { items: [], page, hasNext: false, lastPage: 1 };

    const res = await this.fetchJson<TmdbPagedResponse<TmdbMovie>>("/discover/movie", {
      with_genres: movieGenreId,
      with_origin_country: "JP",
      sort_by: "popularity.desc",
      page,
    });
    return toPaged(res.results.map(toMediaSummaryFromMovie), res);
  }
}
