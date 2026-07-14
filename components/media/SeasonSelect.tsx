"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Season } from "@/lib/media/models";

/**
 * The first client-interactive control in the media area — a native `<select>`
 * (best mobile UX; no custom popover to manage) that drives the server-rendered
 * `?season=` param, mirroring the URL-param convention `CategoryTabs`/
 * `Pagination` already use elsewhere. Only rendered when there's more than one
 * season to choose from (see `SeasonEpisodes`).
 */
export default function SeasonSelect({ seasons, selected }: { seasons: Season[]; selected: number }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={selected}
      onChange={(e) => router.push(`${pathname}?season=${e.target.value}`, { scroll: false })}
      aria-label="Select season"
      className="glass rounded-squircle-sm border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition-colors focus:border-neon-cyan/50"
    >
      {seasons.map((season) => (
        <option key={season.seasonNumber} value={season.seasonNumber} className="bg-bg-elevated text-white">
          {season.name || `Season ${season.seasonNumber}`}
        </option>
      ))}
    </select>
  );
}
