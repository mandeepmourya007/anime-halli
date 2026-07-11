/**
 * Per-provider configuration, sourced from env. Adding auth/keys to a provider later
 * is purely an env + config change — no code in `lib/providers/*` or `app/` needs to move.
 */

export interface ProviderAuthConfig {
  /** HTTP header name to send the credential under, e.g. "Authorization". */
  header: string;
  /** Env var name holding the credential value. */
  envKey: string;
  /** Optional prefix, e.g. "Bearer ". */
  prefix?: string;
}

export interface ProviderConfig {
  id: string;
  baseUrl: string;
  auth?: ProviderAuthConfig;
  enabled: boolean;
  /** Lower number = higher priority when composed via CompositeProvider. */
  priority: number;
  /**
   * "partial" marks an adapter that doesn't implement the full `MediaProvider`
   * contract yet (e.g. a scaffold proving the pattern for a new API). The
   * registry refuses to start if a "partial" provider is enabled with a
   * priority ahead of a "complete" one, since that would make basic requests
   * (search, detail) fail outright instead of falling back.
   */
  status: "complete" | "partial";
}

/**
 * How multiple enabled `MediaProvider`s are combined:
 * - "merge" — fan out to all, dedupe, prefer higher-priority sources (see `MergingProvider`).
 * - "fallback" — try in priority order, only move on when one fails (see `CompositeProvider`).
 * Only matters when more than one provider is enabled.
 */
export const MEDIA_COMPOSITION_STRATEGY: "merge" | "fallback" =
  process.env.MEDIA_COMPOSITION_STRATEGY === "fallback" ? "fallback" : "merge";

export const providersConfig: ProviderConfig[] = [
  {
    id: "tmdb",
    baseUrl: process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3",
    auth: process.env.TMDB_API_KEY
      ? { header: "Authorization", envKey: "TMDB_API_KEY", prefix: "Bearer " }
      : undefined,
    // Opt-in — requires a free TMDB API key (v4 read-access Bearer token).
    enabled: process.env.TMDB_ENABLED === "true",
    priority: 0,
    status: "complete",
  },
  {
    id: "jikan",
    baseUrl: process.env.JIKAN_BASE_URL ?? "https://api.jikan.moe/v4",
    enabled: true,
    priority: 1,
    status: "complete",
  },
  {
    id: "anilist",
    baseUrl: process.env.ANILIST_BASE_URL ?? "https://graphql.anilist.co",
    auth: process.env.ANILIST_API_KEY
      ? { header: "Authorization", envKey: "ANILIST_API_KEY", prefix: "Bearer " }
      : undefined,
    enabled: process.env.ANILIST_ENABLED === "true",
    priority: 2,
    // Only getTop() is wired for real — see lib/providers/anilist/anilist.provider.ts.
    status: "partial",
  },
];

/**
 * Watchmode isn't a `MediaProvider` (no title metadata — see docs/plan-anime-discovery-app.md),
 * so it gets its own small config shape rather than a slot in `providersConfig`. Its API
 * key is a query parameter, not a header, so it doesn't use `ProviderAuthConfig`/`authInjector`
 * — the adapter appends it directly when building each request URL.
 */
export interface WatchmodeConfig {
  enabled: boolean;
  apiKey: string | undefined;
  baseUrl: string;
  /** ISO country codes for availability lookups (free tier: up to 3). */
  countries: string[];
}

export const watchmodeConfig: WatchmodeConfig = {
  enabled: process.env.WATCHMODE_ENABLED === "true",
  apiKey: process.env.WATCHMODE_API_KEY,
  baseUrl: process.env.WATCHMODE_BASE_URL ?? "https://api.watchmode.com/v1",
  countries: (process.env.WATCHMODE_COUNTRIES ?? "US")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean),
};
