"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/format";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isOpen, setIsOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
  }

  return (
    <div className={cn("flex items-center justify-end sm:w-full", isOpen ? "w-full" : "w-auto")}>
      {/* Collapsed to an icon on mobile so the navbar doesn't burn a whole row
          on a full-width search box — expands in place when tapped. Always
          expanded at sm+ where there's room. */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close search" : "Open search"}
        className="shrink-0 rounded-squircle-sm p-2 text-white/70 transition-colors hover:text-white sm:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </>
          )}
        </svg>
      </button>

      <form
        onSubmit={handleSubmit}
        className={cn("items-center gap-2 sm:flex sm:w-full", isOpen ? "flex w-full" : "hidden")}
      >
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search anime..."
          aria-label="Search anime"
          autoFocus={isOpen}
          className="w-full rounded-squircle-sm border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-neon-cyan/50 focus:bg-white/10"
        />
        <button
          type="submit"
          className="shrink-0 rounded-squircle-sm bg-gradient-to-r from-neon-magenta to-neon-violet px-4 py-2 text-sm font-medium text-white shadow-glow-magenta transition-transform hover:scale-105"
        >
          Search
        </button>
      </form>
    </div>
  );
}
