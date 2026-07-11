import { describe, expect, it } from "vitest";
import { assertProviderOrdering } from "./registry";
import type { ProviderConfig } from "@/lib/config/providers.config";

function config(overrides: Partial<ProviderConfig>): ProviderConfig {
  return {
    id: "test",
    baseUrl: "https://example.com",
    enabled: true,
    priority: 0,
    status: "complete",
    ...overrides,
  };
}

describe("assertProviderOrdering", () => {
  it("allows a disabled partial provider regardless of priority", () => {
    expect(() =>
      assertProviderOrdering([
        config({ id: "jikan", priority: 0, status: "complete" }),
        config({ id: "anilist", priority: 1, status: "partial", enabled: false }),
      ]),
    ).not.toThrow();
  });

  it("allows a partial provider ranked after a complete provider", () => {
    expect(() =>
      assertProviderOrdering([
        config({ id: "jikan", priority: 0, status: "complete" }),
        config({ id: "anilist", priority: 1, status: "partial" }),
      ]),
    ).not.toThrow();
  });

  it("throws when a partial provider outranks a complete provider", () => {
    expect(() =>
      assertProviderOrdering([
        config({ id: "jikan", priority: 1, status: "complete" }),
        config({ id: "anilist", priority: 0, status: "partial" }),
      ]),
    ).toThrow(/anilist/);
  });

  it("allows any ordering when no complete provider is enabled", () => {
    expect(() =>
      assertProviderOrdering([config({ id: "anilist", priority: 0, status: "partial" })]),
    ).not.toThrow();
  });
});
