/**
 * Raw Watchmode v1 response shapes. Internal to this adapter only.
 *
 * NOTE: written against Watchmode's public documentation; not yet exercised
 * against a live key at review time (see docs/plan-anime-discovery-app.md) —
 * `type` is intentionally kept as a loose `string` and mapped defensively in
 * watchmode.provider.ts so an unexpected value degrades to "other" rather than
 * breaking the detail page.
 */

export interface WatchmodeSearchTitleResult {
  id: number;
  name: string;
  tmdb_id?: number;
  tmdb_type?: string;
}

export interface WatchmodeSearchResponse {
  title_results: WatchmodeSearchTitleResult[];
}

export interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  web_url: string;
  format?: string;
  price?: number | null;
}

export type WatchmodeSourcesResponse = WatchmodeSource[];
