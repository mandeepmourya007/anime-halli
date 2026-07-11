"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/format";

const NAV_LINKS = [
  { href: "/", label: "Anime" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Web Series" },
] as const;

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-squircle bg-white/5 p-1.5 text-sm font-medium [scrollbar-width:none] sm:flex-none sm:w-auto [&::-webkit-scrollbar]:hidden">
      {NAV_LINKS.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-squircle-sm px-3 py-2 transition-colors sm:px-4",
              isActive
                ? "bg-gradient-to-r from-neon-magenta to-neon-violet text-white shadow-glow-magenta"
                : "text-white/60 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
