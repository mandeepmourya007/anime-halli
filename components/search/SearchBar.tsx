"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search anime..."
        aria-label="Search anime"
        className="w-full rounded-squircle-sm border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-neon-cyan/50 focus:bg-white/10"
      />
      <button
        type="submit"
        className="rounded-squircle-sm bg-gradient-to-r from-neon-magenta to-neon-violet px-4 py-2 text-sm font-medium text-white shadow-glow-magenta transition-transform hover:scale-105"
      >
        Search
      </button>
    </form>
  );
}
