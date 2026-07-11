import { createMediaProvider } from "@/lib/providers/registry";

/**
 * FACADE — the ONLY thing UI should import to talk to media data. Configured provider
 * (or fallback chain) is built once here from `lib/config/providers.config.ts`.
 * Never import a concrete provider or call `fetch` directly from `app/` or `components/`.
 *
 * Named generically (not `animeService`) because this facade is meant to grow into a
 * category-aware media service (anime, movies, cartoons, ...) — see Future Scope in
 * docs/plan-anime-discovery-app.md. Today it's backed by the Jikan anime provider.
 */
export const mediaService = createMediaProvider();

export type { MediaProvider, GenreQuery, ListQuery, SearchQuery } from "./provider";
export type { AnimeDetail, AnimeStatus, AnimeSummary, AnimeType, Character, Genre, Paged, VoiceActor } from "./models";
