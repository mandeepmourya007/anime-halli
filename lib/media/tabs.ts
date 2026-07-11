/**
 * Single source of truth for the home-page category tabs, consumed by both
 * `Navbar` (nav links) and `CategoryTabs` (the active tab switcher) — kept in
 * one place so a tab added to one doesn't silently drift from the other.
 */
export const HOME_TABS = [
  { value: "top", label: "Top" },
  { value: "airing", label: "Airing" },
  { value: "movies", label: "Movies" },
] as const;

export type HomeTab = (typeof HOME_TABS)[number]["value"];

export const VALID_HOME_TABS: ReadonlySet<string> = new Set(HOME_TABS.map((t) => t.value));
