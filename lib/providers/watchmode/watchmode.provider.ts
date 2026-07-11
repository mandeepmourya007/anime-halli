import { httpFetch } from "@/lib/http/fetcher";
import { watchmodeConfig } from "@/lib/config/providers.config";
import type { WatchmodeSearchResponse, WatchmodeSourcesResponse } from "./watchmode.dto";

/**
 * Enrichment only — no title metadata, so this is deliberately NOT a
 * `MediaProvider` and gets no facade/interface abstraction (see plan): one
 * function, called from the detail page only, once a TMDB id is known.
 *
 * Availability is structurally unavailable for anime-only titles TMDB doesn't
 * catalog — that's an inherent limitation of a TMDB-ID-based lookup, not a bug.
 */

export interface StreamingSource {
  name: string;
  type: "sub" | "free" | "rent" | "buy" | "other";
  url: string;
}

const REVALIDATE_SECONDS = 60 * 60 * 24; // availability changes slowly.
const RATE_LIMIT = { perSecond: 5 };

function mapSourceType(raw: string): StreamingSource["type"] {
  switch (raw) {
    case "sub":
      return "sub";
    case "free":
    case "tve":
      return "free";
    case "rent":
      return "rent";
    case "purchase":
      return "buy";
    default:
      return "other";
  }
}

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${watchmodeConfig.baseUrl}${path}`);
  url.searchParams.set("apiKey", watchmodeConfig.apiKey ?? "");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function findWatchmodeId(tmdbId: string, kind: "movie" | "tv"): Promise<number | null> {
  const searchField = kind === "movie" ? "tmdb_movie_id" : "tmdb_tv_id";
  const res = await httpFetch<WatchmodeSearchResponse>(
    buildUrl("/search/", { search_field: searchField, search_value: tmdbId }),
    { revalidate: REVALIDATE_SECONDS, provider: "watchmode", rateLimit: RATE_LIMIT },
  );
  return res.title_results?.[0]?.id ?? null;
}

/**
 * `tmdbId` is the raw numeric TMDB id (already stripped of our "tmdb-movie-"/
 * "tmdb-tv-" prefix — see lib/media/availability.ts, the only intended caller).
 * Never throws — availability is a bonus enrichment, not core data, so any
 * failure (missing key, no match, upstream error) degrades to an empty list
 * rather than breaking the detail page.
 */
export async function getAvailability(tmdbId: string, kind: "movie" | "tv"): Promise<StreamingSource[]> {
  if (!watchmodeConfig.enabled || !watchmodeConfig.apiKey) return [];

  try {
    const watchmodeId = await findWatchmodeId(tmdbId, kind);
    if (watchmodeId === null) return [];

    const sources = await httpFetch<WatchmodeSourcesResponse>(
      buildUrl(`/title/${watchmodeId}/sources/`, { regions: watchmodeConfig.countries.join(",") }),
      { revalidate: REVALIDATE_SECONDS, provider: "watchmode", rateLimit: RATE_LIMIT },
    );

    return sources
      .filter((s) => watchmodeConfig.countries.includes(s.region))
      .map((s) => ({ name: s.name, type: mapSourceType(s.type), url: s.web_url }));
  } catch {
    return [];
  }
}
