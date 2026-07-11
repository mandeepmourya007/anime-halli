import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional classnames + resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Truncate text to `maxLength`, appending an ellipsis when clipped. */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/** Format a 0-10 score for display, or a placeholder when absent. */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "N/A";
  return score.toFixed(2);
}

/** Extract a display year from a domain year field, or a placeholder when absent. */
export function yearFrom(year: number | null | undefined): string {
  return year ? String(year) : "TBA";
}
