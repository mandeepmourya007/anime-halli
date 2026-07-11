import type { AnimeDetail, AnimeStatus, AnimeSummary, AnimeType, Character, Genre, Paged } from "@/lib/media/models";
import type {
  JikanAnime,
  JikanCharacterEntry,
  JikanGenreEntry,
  JikanPagination,
} from "./jikan.dto";

/**
 * Single quarantine point for Jikan's response shape. If Jikan changes a field/path,
 * this is the only file that needs to change — the rest of the app never notices.
 */

const TYPE_MAP: Record<string, AnimeType> = {
  TV: "TV",
  Movie: "Movie",
  OVA: "OVA",
  ONA: "ONA",
  Special: "Special",
  Music: "Music",
};

const STATUS_MAP: Record<string, AnimeStatus> = {
  "Finished Airing": "Finished Airing",
  "Currently Airing": "Currently Airing",
  "Not yet aired": "Not yet aired",
};

function toAnimeType(raw: string | null | undefined): AnimeType {
  if (!raw) return "Unknown";
  return TYPE_MAP[raw] ?? "Unknown";
}

function toAnimeStatus(raw: string | null | undefined): AnimeStatus {
  if (!raw) return "Unknown";
  return STATUS_MAP[raw] ?? "Unknown";
}

export function toAnimeSummary(dto: JikanAnime): AnimeSummary {
  return {
    id: String(dto.mal_id),
    title: dto.title,
    posterUrl: dto.images?.jpg?.large_image_url ?? dto.images?.jpg?.image_url ?? null,
    score: dto.score ?? null,
    type: toAnimeType(dto.type),
    year: dto.year ?? dto.aired?.prop?.from?.year ?? null,
  };
}

export function toAnimeDetail(dto: JikanAnime): AnimeDetail {
  return {
    ...toAnimeSummary(dto),
    synopsis: dto.synopsis ?? null,
    bannerUrl: dto.images?.jpg?.large_image_url ?? dto.images?.jpg?.image_url ?? null,
    genres: (dto.genres ?? []).map(toGenre),
    trailerYoutubeId: dto.trailer?.youtube_id ?? null,
    status: toAnimeStatus(dto.status),
    episodes: dto.episodes ?? null,
  };
}

export function toGenre(dto: { mal_id: number; name: string }): Genre {
  return { id: String(dto.mal_id), name: dto.name };
}

export function toGenreFromEntry(dto: JikanGenreEntry): Genre {
  return { id: String(dto.mal_id), name: dto.name };
}

export function toCharacter(entry: JikanCharacterEntry): Character {
  const jpVoiceActor = entry.voice_actors?.find((va) => va.language === "Japanese");

  return {
    id: String(entry.character.mal_id),
    name: entry.character.name,
    imageUrl: entry.character.images?.jpg?.image_url ?? null,
    role: entry.role,
    voiceActor: jpVoiceActor
      ? {
          name: jpVoiceActor.person.name,
          language: jpVoiceActor.language,
          imageUrl: jpVoiceActor.person.images?.jpg?.image_url ?? null,
        }
      : undefined,
  };
}

/**
 * Jikan's `/top/anime?filter=airing` (and occasionally other list endpoints) can return
 * the same mal_id twice within one page. Dedupe here, at the adapter boundary, so the
 * domain layer and UI never have to know about this upstream quirk.
 */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function toPaged<T>(items: T[], pagination: JikanPagination): Paged<T> {
  return {
    items,
    page: pagination.current_page ?? 1,
    hasNext: pagination.has_next_page,
    lastPage: pagination.last_visible_page,
  };
}
