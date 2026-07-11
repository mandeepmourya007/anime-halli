import { describe, expect, it } from "vitest";
import { isSameTitle, normalizeTitle } from "./fuzzy-match";

describe("normalizeTitle", () => {
  it("is case-insensitive", () => {
    expect(normalizeTitle("Attack on Titan")).toBe(normalizeTitle("attack on titan"));
  });

  it("treats punctuation as a word separator, not a joiner", () => {
    expect(normalizeTitle("Kimetsu no Yaiba: Mugen Ressha-Hen")).toBe(
      normalizeTitle("Kimetsu no Yaiba Mugen Ressha Hen"),
    );
  });

  it("collapses repeated whitespace", () => {
    expect(normalizeTitle("Cowboy   Bebop")).toBe(normalizeTitle("Cowboy Bebop"));
  });
});

describe("isSameTitle — must match (real duplicates)", () => {
  it("same title, same year", () => {
    expect(isSameTitle("Cowboy Bebop", "Cowboy Bebop", 1998, 1998)).toBe(true);
  });

  it("same title, case-insensitive", () => {
    expect(isSameTitle("Spirited Away", "spirited away", 2001, 2001)).toBe(true);
  });

  it("same title, year off by 1 (within tolerance)", () => {
    expect(isSameTitle("Spirited Away", "Spirited Away", 2001, 2002)).toBe(true);
  });

  it("same title, one year missing — title-only match accepted", () => {
    expect(isSameTitle("Cowboy Bebop", "Cowboy Bebop", 1998, null)).toBe(true);
  });

  it("punctuation variance between sources", () => {
    expect(
      isSameTitle("Kimetsu no Yaiba: Mugen Ressha-Hen", "Kimetsu no Yaiba Mugen Ressha Hen", 2020, 2020),
    ).toBe(true);
  });
});

describe("isSameTitle — must NOT match (avoid false positives)", () => {
  it("different seasons of the same show", () => {
    expect(isSameTitle("Attack on Titan", "Attack on Titan Season 3 Part 2", 2013, 2019)).toBe(false);
  });

  it("a show and its sequel/spinoff", () => {
    expect(isSameTitle("Naruto", "Naruto: Shippuden", 2002, 2007)).toBe(false);
  });

  it("same title, year too far apart (likely a different production)", () => {
    expect(isSameTitle("Spirited Away", "Spirited Away", 2001, 2010)).toBe(false);
  });

  it("completely different titles", () => {
    expect(isSameTitle("Cowboy Bebop", "Naruto", 1998, 2002)).toBe(false);
  });
});
