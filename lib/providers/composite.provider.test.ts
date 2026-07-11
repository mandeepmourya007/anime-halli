import { describe, expect, it, vi } from "vitest";
import { CompositeProvider } from "./composite.provider";
import { AuthError, NotFoundError, ProviderError, RateLimitError } from "@/lib/http/errors";
import type { MediaProvider } from "@/lib/media/provider";
import type { AnimeDetail } from "@/lib/media/models";

function makeStubProvider(name: string, overrides: Partial<MediaProvider> = {}): MediaProvider {
  const notImplemented = () => Promise.reject(new Error(`${name}: not stubbed`));
  return {
    name,
    getTop: notImplemented,
    getAiring: notImplemented,
    getMovies: notImplemented,
    search: notImplemented,
    getById: notImplemented,
    getCharacters: notImplemented,
    getGenres: notImplemented,
    getByGenre: notImplemented,
    ...overrides,
  };
}

const FAKE_DETAIL = { id: "1", title: "Cowboy Bebop" } as AnimeDetail;

describe("CompositeProvider", () => {
  it("returns the first provider's result when it succeeds", async () => {
    const primary = makeStubProvider("primary", { getById: async () => FAKE_DETAIL });
    const fallback = makeStubProvider("fallback");
    const composite = new CompositeProvider([primary, fallback]);

    await expect(composite.getById("1")).resolves.toBe(FAKE_DETAIL);
  });

  it("falls through to the next provider on RateLimitError", async () => {
    const primary = makeStubProvider("primary", {
      getById: async () => {
        throw new RateLimitError();
      },
    });
    const fallback = makeStubProvider("fallback", { getById: async () => FAKE_DETAIL });
    const composite = new CompositeProvider([primary, fallback]);

    await expect(composite.getById("1")).resolves.toBe(FAKE_DETAIL);
  });

  it("falls through to the next provider on AuthError", async () => {
    const primary = makeStubProvider("primary", {
      getById: async () => {
        throw new AuthError();
      },
    });
    const fallback = makeStubProvider("fallback", { getById: async () => FAKE_DETAIL });
    const composite = new CompositeProvider([primary, fallback]);

    await expect(composite.getById("1")).resolves.toBe(FAKE_DETAIL);
  });

  it("does NOT fall through on NotFoundError — rethrows immediately", async () => {
    const fallbackGetById = vi.fn(async () => FAKE_DETAIL);
    const primary = makeStubProvider("primary", {
      getById: async () => {
        throw new NotFoundError();
      },
    });
    const fallback = makeStubProvider("fallback", { getById: fallbackGetById });
    const composite = new CompositeProvider([primary, fallback]);

    await expect(composite.getById("1")).rejects.toBeInstanceOf(NotFoundError);
    expect(fallbackGetById).not.toHaveBeenCalled();
  });

  it("does NOT fall through on an unexpected non-ProviderError — rethrows immediately", async () => {
    const fallbackGetById = vi.fn(async () => FAKE_DETAIL);
    const primary = makeStubProvider("primary", {
      getById: async () => {
        throw new Error("not implemented yet");
      },
    });
    const fallback = makeStubProvider("fallback", { getById: fallbackGetById });
    const composite = new CompositeProvider([primary, fallback]);

    await expect(composite.getById("1")).rejects.toThrow("not implemented yet");
    expect(fallbackGetById).not.toHaveBeenCalled();
  });

  it("throws the last error when every provider fails with a fallback-eligible error", async () => {
    const primary = makeStubProvider("primary", {
      getById: async () => {
        throw new RateLimitError("primary rate limited");
      },
    });
    const fallback = makeStubProvider("fallback", {
      getById: async () => {
        throw new ProviderError("fallback down");
      },
    });
    const composite = new CompositeProvider([primary, fallback]);

    await expect(composite.getById("1")).rejects.toThrow("fallback down");
  });

  it("requires at least one provider", () => {
    expect(() => new CompositeProvider([])).toThrow();
  });
});
