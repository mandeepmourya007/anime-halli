import type { Episode, MediaDetail, MediaSummary, CastMember, Genre, Paged } from "@/lib/media/models";
import type { MediaProvider, GenreQuery, ListQuery, SearchQuery } from "@/lib/media/provider";
import type { ProviderConfig } from "@/lib/config/providers.config";
import { httpFetch } from "@/lib/http/fetcher";
import type {
  JikanAnimeFullResponse,
  JikanAnimeListResponse,
  JikanCharactersResponse,
  JikanEpisodesResponse,
  JikanGenresResponse,
} from "./jikan.dto";
import {
  dedupeById,
  fromSourceId,
  toCastMember,
  toEpisode,
  toMediaDetail,
  toMediaSummary,
  toGenreFromEntry,
  toPaged,
} from "./jikan.mappers";

const LIST_REVALIDATE_SECONDS = 60 * 30; // 30 minutes — Jikan is rate-limited (3req/s, 60/min).
const DETAIL_REVALIDATE_SECONDS = 60 * 60; // 1 hour — detail data changes rarely.

// Jikan's documented limit. Caching handles steady-state repeat traffic; this
// proactively throttles cache-cold bursts (e.g. concurrent requests on first load).
const JIKAN_RATE_LIMIT = { perSecond: 3, perMinute: 60 };

export class JikanProvider implements MediaProvider {
  readonly name = "jikan";
  private readonly baseUrl: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl;
  }

  private buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private async fetchList(
    path: string,
    params: Record<string, string | number | undefined>,
  ): Promise<Paged<MediaSummary>> {
    const url = this.buildUrl(path, params);
    const res = await httpFetch<JikanAnimeListResponse>(url, {
      revalidate: LIST_REVALIDATE_SECONDS,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return toPaged(dedupeById(res.data.map(toMediaSummary)), res.pagination);
  }

  async getTop(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.fetchList("/top/anime", { page: q.page ?? 1 });
  }

  /** Popularity sort — distinct from getTop's default rank/score sort. Used by
   * the Anime page's Trending tab (see lib/media/anime-merge.ts), outside the
   * shared `MediaProvider` interface since "trending" isn't a cross-provider concept. */
  async getTrending(page: number): Promise<Paged<MediaSummary>> {
    return this.fetchList("/top/anime", { page, filter: "bypopularity" });
  }

  async getAiring(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.fetchList("/top/anime", { page: q.page ?? 1, filter: "airing" });
  }

  async getMovies(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.fetchList("/top/anime", { page: q.page ?? 1, type: "movie" });
  }

  async search(q: SearchQuery): Promise<Paged<MediaSummary>> {
    if (!q.q?.trim()) {
      return { items: [], page: 1, hasNext: false, lastPage: 1 };
    }
    return this.fetchList("/anime", { q: q.q, page: q.page ?? 1 });
  }

  async getById(id: string): Promise<MediaDetail> {
    const rawId = fromSourceId(id);
    const url = this.buildUrl(`/anime/${rawId}/full`);
    const res = await httpFetch<JikanAnimeFullResponse>(url, {
      revalidate: DETAIL_REVALIDATE_SECONDS,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return toMediaDetail(res.data);
  }

  async getCast(id: string): Promise<CastMember[]> {
    const rawId = fromSourceId(id);
    const url = this.buildUrl(`/anime/${rawId}/characters`);
    const res = await httpFetch<JikanCharactersResponse>(url, {
      revalidate: DETAIL_REVALIDATE_SECONDS,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return res.data.map(toCastMember);
  }

  /** Fallback episode source for anime with no matching TMDB tv entry — see
   * `lib/media/episodes.ts`. Title + air date only; no thumbnails or runtime.
   * First page (100 episodes) covers all but a handful of very long-running
   * shows, which is an acceptable gap for a fallback path. */
  async getEpisodes(rawId: string): Promise<Episode[]> {
    const url = this.buildUrl(`/anime/${rawId}/episodes`);
    const res = await httpFetch<JikanEpisodesResponse>(url, {
      revalidate: DETAIL_REVALIDATE_SECONDS,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return res.data.map(toEpisode);
  }

  async getGenres(): Promise<Genre[]> {
    const url = this.buildUrl("/genres/anime");
    const res = await httpFetch<JikanGenresResponse>(url, {
      revalidate: 60 * 60 * 24,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return res.data.map(toGenreFromEntry);
  }

  async getByGenre(q: GenreQuery): Promise<Paged<MediaSummary>> {
    const genres = await this.getGenres();
    const match = genres.find((g) => g.name.toLowerCase() === q.genreName.toLowerCase());
    if (!match) {
      return { items: [], page: 1, hasNext: false, lastPage: 1 };
    }
    return this.fetchList("/anime", { genres: match.id, page: q.page ?? 1 });
  }
}
