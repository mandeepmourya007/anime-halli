import { describe, expect, it } from "vitest";
import { dedupeById, toCastMember, toMediaSummary } from "./jikan.mappers";
import type { JikanAnime, JikanCharacterEntry } from "./jikan.dto";

function makeAnime(overrides: Partial<JikanAnime> = {}): JikanAnime {
  return {
    mal_id: 1,
    title: "Cowboy Bebop",
    images: { jpg: { image_url: "img.jpg", large_image_url: "img-large.jpg" } },
    score: 8.75,
    type: "TV",
    year: 1998,
    synopsis: "Space bounty hunters.",
    ...overrides,
  };
}

describe("toMediaSummary", () => {
  it("maps core fields, prefixes the id, and falls back to aired.prop.from.year when year is missing", () => {
    const summary = toMediaSummary(
      makeAnime({ year: null, aired: { prop: { from: { year: 1998 } } } }),
    );
    expect(summary).toMatchObject({
      id: "jikan-1",
      title: "Cowboy Bebop",
      posterUrl: "img-large.jpg",
      score: 8.75,
      type: "TV",
      year: 1998,
    });
  });

  it("maps an unrecognized type/status to 'Unknown' instead of throwing", () => {
    const summary = toMediaSummary(makeAnime({ type: "SomeFutureType" }));
    expect(summary.type).toBe("Unknown");
  });

  it("handles a null score without crashing", () => {
    const summary = toMediaSummary(makeAnime({ score: null }));
    expect(summary.score).toBeNull();
  });
});

describe("dedupeById", () => {
  it("removes duplicate ids while preserving order", () => {
    const items = [{ id: "1" }, { id: "2" }, { id: "1" }, { id: "3" }];
    expect(dedupeById(items).map((i) => i.id)).toEqual(["1", "2", "3"]);
  });

  it("is a no-op when there are no duplicates", () => {
    const items = [{ id: "1" }, { id: "2" }];
    expect(dedupeById(items)).toEqual(items);
  });

  it("handles an empty array", () => {
    expect(dedupeById([])).toEqual([]);
  });
});

describe("toCastMember", () => {
  function makeCharacterEntry(overrides: Partial<JikanCharacterEntry> = {}): JikanCharacterEntry {
    return {
      character: { mal_id: 42, name: "Spike Spiegel" },
      role: "Main",
      voice_actors: [],
      ...overrides,
    };
  }

  it("prefixes the id and picks the Japanese voice actor as secondaryName", () => {
    const member = toCastMember(
      makeCharacterEntry({
        voice_actors: [
          { language: "English", person: { mal_id: 1, name: "Steve Blum" } },
          { language: "Japanese", person: { mal_id: 2, name: "Kouichi Yamadera" } },
        ],
      }),
    );
    expect(member.id).toBe("jikan-42");
    expect(member.primaryName).toBe("Spike Spiegel");
    expect(member.secondaryName).toBe("Kouichi Yamadera");
  });

  it("leaves secondaryName null when no Japanese voice actor exists", () => {
    const member = toCastMember(
      makeCharacterEntry({
        voice_actors: [{ language: "English", person: { mal_id: 1, name: "Steve Blum" } }],
      }),
    );
    expect(member.secondaryName).toBeNull();
  });
});
