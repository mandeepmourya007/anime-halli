import { describe, expect, it } from "vitest";
import { MergingProvider } from "./merging.provider";
import { NotFoundError } from "@/lib/http/errors";
import type { MediaProvider } from "@/lib/media/provider";
import type { MediaSummary, Paged } from "@/lib/media/models";

function summary(overrides: Partial<MediaSummary> = {}): MediaSummary {
  return {
    id: "stub-1",
    title: "Some Title",
    posterUrl: null,
    score: null,
    type: "Unknown",
    year: null,
    ...overrides,
  };
}

function paged(items: MediaSummary[], overrides: Partial<Paged<MediaSummary>> = {}): Paged<MediaSummary> {
  return { items, page: 1, hasNext: false, lastPage: 1, ...overrides };
}

function makeStubProvider(name: string, overrides: Partial<MediaProvider> = {}): MediaProvider {
  const notImplemented = () => Promise.reject(new Error(`${name}: not stubbed`));
  return {
    name,
    getTop: notImplemented,
    getAiring: notImplemented,
    getMovies: notImplemented,
    search: notImplemented,
    getById: notImplemented,
    getCast: notImplemented,
    getGenres: notImplemented,
    getByGenre: notImplemented,
    ...overrides,
  };
}

describe("MergingProvider — list merge + dedupe", () => {
  it("keeps the higher-priority (earlier) source's item on a detected duplicate", async () => {
    const tmdb = makeStubProvider("tmdb", {
      getTop: async () =>
        paged([summary({ id: "tmdb-movie-1", title: "Spirited Away", year: 2001 })]),
    });
    const jikan = makeStubProvider("jikan", {
      getTop: async () =>
        paged([summary({ id: "jikan-199", title: "Spirited Away", year: 2001 })]),
    });
    const merged = new MergingProvider([tmdb, jikan]); // tmdb first = higher priority

    const result = await merged.getTop({ page: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("tmdb-movie-1");
  });

  it("keeps distinct titles from both sources", async () => {
    const tmdb = makeStubProvider("tmdb", {
      getTop: async () => paged([summary({ id: "tmdb-movie-1", title: "The Matrix", year: 1999 })]),
    });
    const jikan = makeStubProvider("jikan", {
      getTop: async () => paged([summary({ id: "jikan-1", title: "Cowboy Bebop", year: 1998 })]),
    });
    const merged = new MergingProvider([tmdb, jikan]);

    const result = await merged.getTop({ page: 1 });
    expect(result.items.map((i) => i.id).sort()).toEqual(["jikan-1", "tmdb-movie-1"]);
  });

  it("tolerates one provider failing — returns the other's results", async () => {
    const tmdb = makeStubProvider("tmdb", {
      getTop: async () => {
        throw new Error("tmdb down");
      },
    });
    const jikan = makeStubProvider("jikan", {
      getTop: async () => paged([summary({ id: "jikan-1", title: "Cowboy Bebop" })]),
    });
    const merged = new MergingProvider([tmdb, jikan]);

    const result = await merged.getTop({ page: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("jikan-1");
  });

  it("throws when every provider fails", async () => {
    const tmdb = makeStubProvider("tmdb", {
      getTop: async () => {
        throw new Error("tmdb down");
      },
    });
    const jikan = makeStubProvider("jikan", {
      getTop: async () => {
        throw new Error("jikan down");
      },
    });
    const merged = new MergingProvider([tmdb, jikan]);

    await expect(merged.getTop({ page: 1 })).rejects.toThrow();
  });

  it("merges hasNext/lastPage across sources", async () => {
    const tmdb = makeStubProvider("tmdb", {
      getTop: async () => paged([], { hasNext: false, lastPage: 5 }),
    });
    const jikan = makeStubProvider("jikan", {
      getTop: async () => paged([], { hasNext: true, lastPage: 10 }),
    });
    const merged = new MergingProvider([tmdb, jikan]);

    const result = await merged.getTop({ page: 1 });
    expect(result.hasNext).toBe(true);
    expect(result.lastPage).toBe(10);
  });
});

describe("MergingProvider — id-prefix routing", () => {
  it("routes getById to the provider matching the id's prefix", async () => {
    const tmdb = makeStubProvider("tmdb", { getById: async () => ({ id: "tmdb-movie-1" }) as never });
    const jikan = makeStubProvider("jikan", { getById: async () => ({ id: "jikan-1" }) as never });
    const merged = new MergingProvider([tmdb, jikan]);

    const result = await merged.getById("jikan-1");
    expect(result).toEqual({ id: "jikan-1" });
  });

  it("throws NotFoundError when no provider matches the id's prefix", async () => {
    const tmdb = makeStubProvider("tmdb");
    const merged = new MergingProvider([tmdb]);

    await expect(merged.getById("unknown-1")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("MergingProvider — genre union", () => {
  it("dedupes genre names case-insensitively across sources", async () => {
    const tmdb = makeStubProvider("tmdb", {
      getGenres: async () => [{ id: "16", name: "Animation" }, { id: "28", name: "Action" }],
    });
    const jikan = makeStubProvider("jikan", {
      getGenres: async () => [{ id: "1", name: "action" }, { id: "2", name: "Comedy" }],
    });
    const merged = new MergingProvider([tmdb, jikan]);

    const genres = await merged.getGenres();
    expect(genres.map((g) => g.name.toLowerCase()).sort()).toEqual(["action", "animation", "comedy"]);
  });
});
