import type { MediaProvider } from "@/lib/media/provider";
import { providersConfig, type ProviderConfig } from "@/lib/config/providers.config";
import { AniListProvider } from "./anilist/anilist.provider";
import { CompositeProvider } from "./composite.provider";
import { JikanProvider } from "./jikan/jikan.provider";

/** Factory: maps a provider id to its concrete adapter constructor. */
const PROVIDER_FACTORIES: Record<string, (config: ProviderConfig) => MediaProvider> = {
  jikan: (config) => new JikanProvider(config),
  anilist: (config) => new AniListProvider(config),
};

/**
 * Refuses to start if a "partial" (scaffold) provider would rank ahead of a
 * "complete" one. Without this, misconfiguring priority/env vars would make a
 * provider whose methods mostly throw "not implemented" serve real traffic
 * before Jikan ever gets a chance — see docs/plan-anime-discovery-app.md.
 */
function assertProviderOrdering(configs: ProviderConfig[]): void {
  const enabled = configs.filter((c) => c.enabled);
  const completePriorities = enabled.filter((c) => c.status === "complete").map((c) => c.priority);
  if (completePriorities.length === 0) return;

  const minCompletePriority = Math.min(...completePriorities);
  const misconfigured = enabled.find((c) => c.status === "partial" && c.priority < minCompletePriority);

  if (misconfigured) {
    throw new Error(
      `Provider "${misconfigured.id}" is a partial/scaffold adapter but has priority ` +
        `${misconfigured.priority}, ranking it ahead of a fully-implemented provider. ` +
        `Raise its priority number (lower priority) or set enabled: false in providers.config.ts.`,
    );
  }
}

function buildEnabledProviders(): MediaProvider[] {
  assertProviderOrdering(providersConfig);

  return providersConfig
    .filter((config) => config.enabled)
    .sort((a, b) => a.priority - b.priority)
    .map((config) => {
      const factory = PROVIDER_FACTORIES[config.id];
      if (!factory) {
        throw new Error(`No provider factory registered for id "${config.id}"`);
      }
      return factory(config);
    });
}

/**
 * Builds the active provider(s) from config. A single enabled provider is returned
 * as-is; multiple enabled providers are wrapped in a `CompositeProvider` fallback chain.
 */
export function createMediaProvider(): MediaProvider {
  const providers = buildEnabledProviders();

  if (providers.length === 0) {
    throw new Error("No anime providers are enabled in providers.config.ts");
  }

  if (providers.length === 1) {
    return providers[0];
  }

  return new CompositeProvider(providers);
}
