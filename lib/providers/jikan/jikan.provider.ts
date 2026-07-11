import type { AnimeDetail, AnimeSummary, Character, Genre, Paged } from "@/lib/media/models";
import type { MediaProvider, GenreQuery, ListQuery, SearchQuery } from "@/lib/media/provider";
import type { ProviderConfig } from "@/lib/config/providers.config";
import { httpFetch } from "@/lib/http/fetcher";
import type {
  JikanAnimeFullResponse,
  JikanAnimeListResponse,
  JikanCharactersResponse,
  JikanGenresResponse,
} from "./jikan.dto";
import {
  dedupeById,
  toAnimeDetail,
  toAnimeSummary,
  toCharacter,
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
  ): Promise<Paged<AnimeSummary>> {
    const url = this.buildUrl(path, params);
    const res = await httpFetch<JikanAnimeListResponse>(url, {
      revalidate: LIST_REVALIDATE_SECONDS,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return toPaged(dedupeById(res.data.map(toAnimeSummary)), res.pagination);
  }

  async getTop(q: ListQuery): Promise<Paged<AnimeSummary>> {
    return this.fetchList("/top/anime", { page: q.page ?? 1 });
  }

  async getAiring(q: ListQuery): Promise<Paged<AnimeSummary>> {
    return this.fetchList("/top/anime", { page: q.page ?? 1, filter: "airing" });
  }

  async getMovies(q: ListQuery): Promise<Paged<AnimeSummary>> {
    return this.fetchList("/top/anime", { page: q.page ?? 1, type: "movie" });
  }

  async search(q: SearchQuery): Promise<Paged<AnimeSummary>> {
    if (!q.q?.trim()) {
      return { items: [], page: 1, hasNext: false, lastPage: 1 };
    }
    return this.fetchList("/anime", { q: q.q, page: q.page ?? 1 });
  }

  async getById(id: string): Promise<AnimeDetail> {
    const url = this.buildUrl(`/anime/${id}/full`);
    const res = await httpFetch<JikanAnimeFullResponse>(url, {
      revalidate: DETAIL_REVALIDATE_SECONDS,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return toAnimeDetail(res.data);
  }

  async getCharacters(id: string): Promise<Character[]> {
    const url = this.buildUrl(`/anime/${id}/characters`);
    const res = await httpFetch<JikanCharactersResponse>(url, {
      revalidate: DETAIL_REVALIDATE_SECONDS,
      provider: this.name,
      rateLimit: JIKAN_RATE_LIMIT,
    });
    return res.data.map(toCharacter);
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

  async getByGenre(q: GenreQuery): Promise<Paged<AnimeSummary>> {
    return this.fetchList("/anime", { genres: q.genreId, page: q.page ?? 1 });
  }
}
