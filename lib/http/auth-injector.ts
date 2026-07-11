import type { ProviderAuthConfig } from "@/lib/config/providers.config";

/**
 * Turns a declarative `ProviderAuthConfig` into the `injectAuth` function
 * `httpFetch` expects. `ProviderAuthConfig` has existed since the original
 * provider-agnostic design, but nothing used it until TMDB — the first
 * provider that actually needs a real auth header.
 */
export function authInjector(config: ProviderAuthConfig | undefined) {
  if (!config) return undefined;

  return (headers: Record<string, string>) => {
    const value = process.env[config.envKey];
    if (!value) return;
    headers[config.header] = `${config.prefix ?? ""}${value}`;
  };
}
