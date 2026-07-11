import type { MediaDetail, MediaStatus, MediaSummary, MediaType, CastMember, Genre, Paged } from "@/lib/media/models";
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

const PREFIX = "jikan-";

/** Ids from this adapter are always prefixed so they stay unambiguous once a second
 * media provider (TMDB) is in the mix — see MergingProvider / registry.ts. */
export function toSourceId(rawId: string | number): string {
  return `${PREFIX}${rawId}`;
}

/** Strips this adapter's own prefix before querying Jikan directly by id. Throws if
 * given an id that doesn't belong to this adapter — callers should route by prefix
 * before calling in (see MergingProvider.getById). */
export function fromSourceId(id: string): string {
  if (!id.startsWith(PREFIX)) {
    throw new Error(`Not a Jikan id: "${id}"`);
  }
  return id.slice(PREFIX.length);
}

const TYPE_MAP: Record<string, MediaType> = {
  TV: "TV",
  Movie: "Movie",
  OVA: "OVA",
  ONA: "ONA",
  Special: "Special",
  Music: "Music",
};

const STATUS_MAP: Record<string, MediaStatus> = {
  "Finished Airing": "finished",
  "Currently Airing": "airing",
  "Not yet aired": "upcoming",
};

function toMediaType(raw: string | null | undefined): MediaType {
  if (!raw) return "Unknown";
  return TYPE_MAP[raw] ?? "Unknown";
}

function toMediaStatus(raw: string | null | undefined): MediaStatus {
  if (!raw) return "unknown";
  return STATUS_MAP[raw] ?? "unknown";
}

function toImageUrl(images: JikanAnime["images"] | undefined): string | null {
  return images?.jpg?.large_image_url ?? images?.jpg?.image_url ?? null;
}

export function toMediaSummary(dto: JikanAnime): MediaSummary {
  return {
    id: toSourceId(dto.mal_id),
    title: dto.title,
    posterUrl: toImageUrl(dto.images),
    // Jikan has no landscape/backdrop image at all — every image field it
    // returns is a portrait poster. Hero components must fall back to
    // `posterUrl` with `fit="contain"` rather than force-crop this.
    bannerUrl: null,
    score: dto.score ?? null,
    type: toMediaType(dto.type),
    year: dto.year ?? dto.aired?.prop?.from?.year ?? null,
  };
}

export function toMediaDetail(dto: JikanAnime): MediaDetail {
  return {
    ...toMediaSummary(dto),
    synopsis: dto.synopsis ?? null,
    genres: (dto.genres ?? []).map(toGenre),
    trailerYoutubeId: dto.trailer?.youtube_id ?? null,
    status: toMediaStatus(dto.status),
    episodes: dto.episodes ?? null,
  };
}

export function toGenre(dto: { mal_id: number; name: string }): Genre {
  return { id: String(dto.mal_id), name: dto.name };
}

export function toGenreFromEntry(dto: JikanGenreEntry): Genre {
  return { id: String(dto.mal_id), name: dto.name };
}

/**
 * Jikan's cast entry is a fictional character with a nested voice actor — maps onto
 * the unified `CastMember` as primary = character, secondary = (Japanese) voice actor.
 */
export function toCastMember(entry: JikanCharacterEntry): CastMember {
  const jpVoiceActor = entry.voice_actors?.find((va) => va.language === "Japanese");

  return {
    id: toSourceId(entry.character.mal_id),
    primaryName: entry.character.name,
    secondaryName: jpVoiceActor?.person.name ?? null,
    imageUrl: entry.character.images?.jpg?.image_url ?? null,
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
