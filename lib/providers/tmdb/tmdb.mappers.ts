import type { MediaDetail, MediaStatus, MediaSummary, CastMember, Genre } from "@/lib/media/models";
import type {
  TmdbCastMember,
  TmdbGenreRef,
  TmdbMovie,
  TmdbMultiSearchItem,
  TmdbTv,
  TmdbVideo,
} from "./tmdb.dto";

/**
 * Single quarantine point for TMDB's response shape. If TMDB changes a field/path,
 * this is the only file that needs to change — the rest of the app never notices.
 *
 * TMDB movie ids and TV ids are separate namespaces (a numeric id can mean a
 * completely different title depending on which), so — unlike Jikan, which has
 * one namespace — this adapter's ids always encode the content kind too:
 * "tmdb-movie-603" / "tmdb-tv-1396".
 */

const PREFIX = "tmdb-";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TmdbKind = "movie" | "tv";

export function toSourceId(kind: TmdbKind, rawId: number | string): string {
  return `${PREFIX}${kind}-${rawId}`;
}

/** Strips this adapter's prefix and parses out the content kind + raw numeric id.
 * Throws if given an id that doesn't belong to this adapter. */
export function fromSourceId(id: string): { kind: TmdbKind; rawId: string } {
  if (!id.startsWith(PREFIX)) {
    throw new Error(`Not a TMDB id: "${id}"`);
  }
  const rest = id.slice(PREFIX.length);
  const [kind, rawId] = rest.split("-");
  if (kind !== "movie" && kind !== "tv") {
    throw new Error(`Unrecognized TMDB id kind in "${id}"`);
  }
  return { kind, rawId };
}

export function imageUrl(path: string | null | undefined, size: "w500" | "w1280"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

function yearFromDate(date: string | null | undefined): number | null {
  if (!date) return null;
  const year = Number(date.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : null;
}

const MOVIE_STATUS_MAP: Record<string, MediaStatus> = {
  Released: "finished",
  Rumored: "upcoming",
  Planned: "upcoming",
  "In Production": "upcoming",
  "Post Production": "upcoming",
  Canceled: "unknown",
};

const TV_STATUS_MAP: Record<string, MediaStatus> = {
  "Returning Series": "airing",
  Ended: "finished",
  Canceled: "finished",
  Planned: "upcoming",
  "In Production": "upcoming",
  Pilot: "upcoming",
};

export function toMediaSummaryFromMovie(dto: TmdbMovie): MediaSummary {
  return {
    id: toSourceId("movie", dto.id),
    title: dto.title,
    posterUrl: imageUrl(dto.poster_path, "w500"),
    // TMDB includes backdrop_path even at list/summary level (not detail-only),
    // so the hero can use a real landscape image instead of a stretched poster.
    bannerUrl: imageUrl(dto.backdrop_path, "w1280"),
    score: dto.vote_average ?? null,
    type: "Movie",
    year: yearFromDate(dto.release_date),
  };
}

export function toMediaSummaryFromTv(dto: TmdbTv): MediaSummary {
  return {
    id: toSourceId("tv", dto.id),
    title: dto.name,
    posterUrl: imageUrl(dto.poster_path, "w500"),
    bannerUrl: imageUrl(dto.backdrop_path, "w1280"),
    score: dto.vote_average ?? null,
    type: "TV",
    year: yearFromDate(dto.first_air_date),
  };
}

/** `/search/multi` mixes movies, TV, and people — returns null for people, which
 * this app has no domain model for. */
export function toMediaSummaryFromMulti(dto: TmdbMultiSearchItem): MediaSummary | null {
  if (dto.media_type === "movie") return toMediaSummaryFromMovie(dto as TmdbMovie);
  if (dto.media_type === "tv") return toMediaSummaryFromTv(dto as TmdbTv);
  return null;
}

export function toGenre(dto: TmdbGenreRef): Genre {
  return { id: String(dto.id), name: dto.name };
}

function findTrailerYoutubeId(videos: TmdbVideo[] | undefined): string | null {
  const trailer = videos?.find((v) => v.site === "YouTube" && v.type === "Trailer");
  return trailer?.key ?? null;
}

export function toMediaDetailFromMovie(dto: TmdbMovie, videos?: TmdbVideo[]): MediaDetail {
  return {
    ...toMediaSummaryFromMovie(dto), // already includes bannerUrl (backdrop_path)
    synopsis: dto.overview,
    genres: (dto.genres ?? []).map(toGenre),
    trailerYoutubeId: findTrailerYoutubeId(videos),
    status: (dto.status ? MOVIE_STATUS_MAP[dto.status] : undefined) ?? "unknown",
    episodes: null,
  };
}

export function toMediaDetailFromTv(dto: TmdbTv, videos?: TmdbVideo[]): MediaDetail {
  return {
    ...toMediaSummaryFromTv(dto), // already includes bannerUrl (backdrop_path)
    synopsis: dto.overview,
    genres: (dto.genres ?? []).map(toGenre),
    trailerYoutubeId: findTrailerYoutubeId(videos),
    status: (dto.status ? TV_STATUS_MAP[dto.status] : undefined) ?? "unknown",
    episodes: dto.number_of_episodes ?? null,
  };
}

/** TMDB's cast entry is an actor playing a character — the inverse of Jikan's
 * character-with-voice-actor. Primary = actor, secondary = character played.
 * Person ids are a separate namespace from movie/tv ids and are only ever used
 * as a React list key (never routed to), so they get their own simple prefix
 * rather than reusing the movie/tv `toSourceId` scheme. */
export function toCastMember(dto: TmdbCastMember): CastMember {
  return {
    id: `${PREFIX}person-${dto.id}`,
    primaryName: dto.name,
    secondaryName: dto.character || null,
    imageUrl: imageUrl(dto.profile_path, "w500"),
  };
}
