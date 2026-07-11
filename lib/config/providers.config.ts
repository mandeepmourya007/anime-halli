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

export const providersConfig: ProviderConfig[] = [
  {
    id: "jikan",
    baseUrl: process.env.JIKAN_BASE_URL ?? "https://api.jikan.moe/v4",
    enabled: true,
    priority: 0,
    status: "complete",
  },
  {
    id: "anilist",
    baseUrl: process.env.ANILIST_BASE_URL ?? "https://graphql.anilist.co",
    auth: process.env.ANILIST_API_KEY
      ? { header: "Authorization", envKey: "ANILIST_API_KEY", prefix: "Bearer " }
      : undefined,
    enabled: process.env.ANILIST_ENABLED === "true",
    priority: 1,
    // Only getTop() is wired for real — see lib/providers/anilist/anilist.provider.ts.
    status: "partial",
  },
];
