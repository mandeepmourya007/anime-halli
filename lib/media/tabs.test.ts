import { describe, expect, it } from "vitest";
import { resolveListParams, VALID_ANIME_TABS } from "./tabs";

describe("resolveListParams", () => {
  it("falls back to 'trending' when tab is missing", () => {
    expect(resolveListParams({}, VALID_ANIME_TABS)).toEqual({ tab: "trending", page: 1 });
  });

  it("falls back to 'trending' when tab is invalid", () => {
    expect(resolveListParams({ tab: "not-a-real-tab" }, VALID_ANIME_TABS)).toEqual({
      tab: "trending",
      page: 1,
    });
  });

  it("keeps a valid tab", () => {
    expect(resolveListParams({ tab: "airing" }, VALID_ANIME_TABS).tab).toBe("airing");
  });

  it("clamps page to at least 1", () => {
    expect(resolveListParams({ page: "0" }, VALID_ANIME_TABS).page).toBe(1);
    expect(resolveListParams({ page: "-5" }, VALID_ANIME_TABS).page).toBe(1);
  });

  it("falls back to page 1 when page is not a number", () => {
    expect(resolveListParams({ page: "abc" }, VALID_ANIME_TABS).page).toBe(1);
  });

  it("parses a valid page number", () => {
    expect(resolveListParams({ page: "3" }, VALID_ANIME_TABS).page).toBe(3);
  });
});
