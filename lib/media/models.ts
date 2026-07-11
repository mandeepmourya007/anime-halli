/**
 * Domain models — stable, app-internal types independent of any provider's API shape.
 * UI and components should only ever depend on these types, never on a vendor DTO.
 */

export type AnimeType = "TV" | "Movie" | "OVA" | "ONA" | "Special" | "Music" | "Unknown";

export type AnimeStatus =
  | "Finished Airing"
  | "Currently Airing"
  | "Not yet aired"
  | "Unknown";

export interface Genre {
  id: string;
  name: string;
}

export interface AnimeSummary {
  id: string;
  title: string;
  posterUrl: string | null;
  score: number | null;
  type: AnimeType;
  year: number | null;
}

export interface AnimeDetail extends AnimeSummary {
  synopsis: string | null;
  bannerUrl: string | null;
  genres: Genre[];
  trailerYoutubeId: string | null;
  status: AnimeStatus;
  episodes: number | null;
}

export interface VoiceActor {
  name: string;
  language: string;
  imageUrl: string | null;
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string | null;
  role: string;
  voiceActor?: VoiceActor;
}

export interface Paged<T> {
  items: T[];
  page: number;
  hasNext: boolean;
  lastPage: number;
}
