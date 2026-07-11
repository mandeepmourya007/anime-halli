/**
 * Best-effort duplicate detection between titles from different providers that
 * share no common ID (e.g. TMDB vs Jikan). Deliberately conservative — biased
 * toward false negatives (missing a real duplicate, which is just cosmetic —
 * the title shows up twice) over false positives (wrongly merging two distinct
 * titles, which is actively misleading). See MergingProvider for how this is used.
 *
 * Normalization intentionally does NOT strip season/cour/part numbers — doing
 * so is exactly what would wrongly merge distinct seasons (e.g. "Attack on
 * Titan" vs "Attack on Titan Season 3 Part 2").
 */

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics (romanization variance)
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // punctuation becomes a separator, not a joiner
    // ("Ressha-Hen" -> "ressha hen", matching "Ressha Hen" — not "resshahen")
    .replace(/\s+/g, " ")
    .trim();
}

const YEAR_TOLERANCE = 1;

/**
 * True if `titleA`/`titleB` normalize to the same string AND, when both years
 * are known, are within `YEAR_TOLERANCE` of each other. If either year is
 * missing, the year check is skipped (title-only match) — accepted as part of
 * the "best-effort" nature of this comparison rather than rejecting on missing data.
 */
export function isSameTitle(
  titleA: string,
  titleB: string,
  yearA: number | null,
  yearB: number | null,
): boolean {
  if (normalizeTitle(titleA) !== normalizeTitle(titleB)) return false;
  if (yearA == null || yearB == null) return true;
  return Math.abs(yearA - yearB) <= YEAR_TOLERANCE;
}
