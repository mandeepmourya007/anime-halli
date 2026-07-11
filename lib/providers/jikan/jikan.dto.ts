/**
 * Raw Jikan v4 response types. Internal to this adapter only — nothing outside
 * `lib/providers/jikan/` should ever import from this file.
 */

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page?: number;
  items?: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanImageFormat {
  image_url: string | null;
  large_image_url?: string | null;
  small_image_url?: string | null;
}

export interface JikanImages {
  jpg: JikanImageFormat;
  webp?: JikanImageFormat;
}

export interface JikanTitle {
  type: string;
  title: string;
}

export interface JikanGenre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanTrailer {
  youtube_id: string | null;
  url?: string | null;
  embed_url?: string | null;
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  titles?: JikanTitle[];
  images: JikanImages;
  score: number | null;
  type: string | null;
  year: number | null;
  aired?: { prop?: { from?: { year?: number | null } } };
  synopsis: string | null;
  genres?: JikanGenre[];
  trailer?: JikanTrailer;
  status?: string | null;
  episodes?: number | null;
}

export interface JikanAnimeListResponse {
  data: JikanAnime[];
  pagination: JikanPagination;
}

export interface JikanAnimeFullResponse {
  data: JikanAnime;
}

export interface JikanVoiceActor {
  person: {
    mal_id: number;
    name: string;
    images?: { jpg?: JikanImageFormat };
  };
  language: string;
}

export interface JikanCharacterEntry {
  character: {
    mal_id: number;
    name: string;
    images?: JikanImages;
  };
  role: string;
  voice_actors: JikanVoiceActor[];
}

export interface JikanCharactersResponse {
  data: JikanCharacterEntry[];
}

export interface JikanGenreEntry {
  mal_id: number;
  name: string;
  count?: number;
}

export interface JikanGenresResponse {
  data: JikanGenreEntry[];
}
