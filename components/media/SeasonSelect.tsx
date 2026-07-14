"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/format";
import type { Season } from "@/lib/media/models";

/**
 * A custom-built dropdown, not a native `<select>` — mobile browsers render a
 * native select's popup centered in the viewport rather than anchored under
 * the trigger, which looked broken against this app's themed layout. This
 * anchors the panel directly below the trigger and matches the glass/neon
 * theme end to end. Drives the server-rendered `?season=` param, same
 * URL-param convention as `CategoryTabs`/`Pagination`.
 */
export default function SeasonSelect({ seasons, selected }: { seasons: Season[]; selected: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedSeason = seasons.find((s) => s.seasonNumber === selected);

  function handleSelect(seasonNumber: number) {
    setIsOpen(false);
    if (seasonNumber === selected) return;
    router.push(`${pathname}?season=${seasonNumber}`, { scroll: false });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-squircle-sm border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:border-neon-cyan/50"
      >
        {selectedSeason?.name || `Season ${selected}`}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-20 mt-2 max-h-60 w-44 overflow-y-auto rounded-squircle-sm border border-white/10 bg-bg-elevated py-1 shadow-lg"
        >
          {seasons.map((season) => (
            <li key={season.seasonNumber}>
              <button
                type="button"
                role="option"
                aria-selected={season.seasonNumber === selected}
                onClick={() => handleSelect(season.seasonNumber)}
                className={cn(
                  "block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/10",
                  season.seasonNumber === selected ? "text-neon-cyan" : "text-white/80",
                )}
              >
                {season.name || `Season ${season.seasonNumber}`}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
