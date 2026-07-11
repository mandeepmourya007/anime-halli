import { describe, expect, it } from "vitest";
import { dedupeById, toAnimeSummary, toCharacter } from "./jikan.mappers";
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

describe("toAnimeSummary", () => {
  it("maps core fields and falls back to aired.prop.from.year when year is missing", () => {
    const summary = toAnimeSummary(
      makeAnime({ year: null, aired: { prop: { from: { year: 1998 } } } }),
    );
    expect(summary).toMatchObject({
      id: "1",
      title: "Cowboy Bebop",
      posterUrl: "img-large.jpg",
      score: 8.75,
      type: "TV",
      year: 1998,
    });
  });

  it("maps an unrecognized type/status to 'Unknown' instead of throwing", () => {
    const summary = toAnimeSummary(makeAnime({ type: "SomeFutureType" }));
    expect(summary.type).toBe("Unknown");
  });

  it("handles a null score without crashing", () => {
    const summary = toAnimeSummary(makeAnime({ score: null }));
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

describe("toCharacter", () => {
  function makeCharacterEntry(overrides: Partial<JikanCharacterEntry> = {}): JikanCharacterEntry {
    return {
      character: { mal_id: 42, name: "Spike Spiegel" },
      role: "Main",
      voice_actors: [],
      ...overrides,
    };
  }

  it("picks the Japanese voice actor when multiple languages are present", () => {
    const character = toCharacter(
      makeCharacterEntry({
        voice_actors: [
          { language: "English", person: { mal_id: 1, name: "Steve Blum" } },
          { language: "Japanese", person: { mal_id: 2, name: "Kouichi Yamadera" } },
        ],
      }),
    );
    expect(character.voiceActor?.name).toBe("Kouichi Yamadera");
    expect(character.voiceActor?.language).toBe("Japanese");
  });

  it("leaves voiceActor undefined when no Japanese voice actor exists", () => {
    const character = toCharacter(
      makeCharacterEntry({
        voice_actors: [{ language: "English", person: { mal_id: 1, name: "Steve Blum" } }],
      }),
    );
    expect(character.voiceActor).toBeUndefined();
  });
});
