import type { MediaDetail, MediaSummary, CastMember, Genre, Paged } from "@/lib/media/models";
import type { MediaProvider, GenreQuery, ListQuery } from "@/lib/media/provider";
import type { ProviderConfig } from "@/lib/config/providers.config";
import { ProviderError } from "@/lib/http/errors";

/**
 * Minimal AniList adapter scaffold. Proves the `MediaProvider` contract holds for a
 * completely different (GraphQL) API. `getTop` is wired for real to prove the pattern;
 * the rest throw "not implemented" until this adapter is fleshed out (see plan's
 * Future Scope). Fully wiring this is intentionally out of scope for this pass.
 */

const PREFIX = "anilist-";

interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { extraLarge: string | null };
  averageScore: number | null;
  format: string | null;
  seasonYear: number | null;
}

interface AniListPageResponse {
  data: {
    Page: {
      pageInfo: { currentPage: number; hasNextPage: boolean; lastPage: number };
      media: AniListMedia[];
    };
  };
}

const TOP_QUERY = `
  query ($page: Int) {
    Page(page: $page, perPage: 25) {
      pageInfo { currentPage hasNextPage lastPage }
      media(sort: SCORE_DESC, type: ANIME) {
        id
        title { romaji english }
        coverImage { extraLarge }
        averageScore
        format
        seasonYear
      }
    }
  }
`;

function toSummary(m: AniListMedia): MediaSummary {
  return {
    id: `${PREFIX}${m.id}`,
    title: m.title.english ?? m.title.romaji,
    posterUrl: m.coverImage.extraLarge ?? null,
    bannerUrl: null, // AniList's bannerImage exists but isn't fetched by this scaffold's query yet.
    score: m.averageScore ? m.averageScore / 10 : null,
    type: m.format === "MOVIE" ? "Movie" : m.format === "TV" ? "TV" : "Unknown",
    year: m.seasonYear ?? null,
  };
}

export class AniListProvider implements MediaProvider {
  readonly name = "anilist";
  private readonly baseUrl: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl;
  }

  async getTop(q: ListQuery): Promise<Paged<MediaSummary>> {
    // AniList's GraphQL endpoint needs a POST body, unlike the shared GET-oriented
    // `httpFetch`. Wired directly here just to prove the `MediaProvider` contract
    // holds for a non-REST API; full retry/backoff wiring is Future Scope.
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: TOP_QUERY, variables: { page: q.page ?? 1 } }),
      next: { revalidate: 60 * 30 },
    });

    if (!res.ok) {
      throw new ProviderError(`AniList request failed (${res.status})`, {
        status: res.status,
        provider: this.name,
      });
    }

    const json = (await res.json()) as AniListPageResponse;
    const { pageInfo, media } = json.data.Page;
    return {
      items: media.map(toSummary),
      page: pageInfo.currentPage,
      hasNext: pageInfo.hasNextPage,
      lastPage: pageInfo.lastPage,
    };
  }

  async getAiring(): Promise<Paged<MediaSummary>> {
    throw new Error("AniListProvider.getAiring not implemented yet");
  }

  async getMovies(): Promise<Paged<MediaSummary>> {
    throw new Error("AniListProvider.getMovies not implemented yet");
  }

  async search(): Promise<Paged<MediaSummary>> {
    throw new Error("AniListProvider.search not implemented yet");
  }

  async getById(): Promise<MediaDetail> {
    throw new Error("AniListProvider.getById not implemented yet");
  }

  async getCast(): Promise<CastMember[]> {
    throw new Error("AniListProvider.getCast not implemented yet");
  }

  async getGenres(): Promise<Genre[]> {
    throw new Error("AniListProvider.getGenres not implemented yet");
  }

  async getByGenre(q: GenreQuery): Promise<Paged<MediaSummary>> {
    void q;
    throw new Error("AniListProvider.getByGenre not implemented yet");
  }
}
