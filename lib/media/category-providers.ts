import { JikanProvider } from "@/lib/providers/jikan/jikan.provider";
import { TmdbProvider } from "@/lib/providers/tmdb/tmdb.provider";
import { providersConfig } from "@/lib/config/providers.config";

/**
 * Concrete provider singletons for the dedicated category pages (Anime/Movies/
 * Web Series) — each needs source-specific queries (e.g. "Bollywood", "anime-
 * scoped TMDB") that don't belong on the shared `MediaProvider` interface (see
 * docs/plan). Lives in `lib/media/` (not `app/`) so pages still only ever
 * import from the facade, never reach into `lib/providers/*` directly.
 *
 * `mediaService` (the merged/deduped `MediaProvider`) is unaffected and still
 * powers search and the detail page — this is additive, not a replacement.
 */

const jikanConfig = providersConfig.find((c) => c.id === "jikan");
if (!jikanConfig) {
  throw new Error('Missing "jikan" entry in providers.config.ts');
}
export const jikanProvider = new JikanProvider(jikanConfig);

const tmdbConfig = providersConfig.find((c) => c.id === "tmdb");
export const tmdbProvider = tmdbConfig?.enabled ? new TmdbProvider(tmdbConfig) : null;
