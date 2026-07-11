import Link from "next/link";
import { Suspense } from "react";
import Container from "@/components/layout/Container";
import SearchBar from "@/components/search/SearchBar";

const CATEGORY_LINKS = [
  { href: "/?tab=top", label: "Top" },
  { href: "/?tab=airing", label: "Airing" },
  { href: "/?tab=movies", label: "Movies" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 py-3">
      <Container>
        <div className="glass glass-sheen flex flex-wrap items-center gap-3 rounded-squircle px-4 py-3 sm:gap-6 sm:px-6">
          <Link href="/" className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            <span className="gradient-text">Anime Halli</span>
          </Link>

          <nav className="hidden items-center gap-4 text-sm font-medium text-white/70 sm:flex">
            {CATEGORY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto w-full sm:w-auto sm:min-w-[280px]">
            <Suspense fallback={<div className="h-10" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </Container>
    </header>
  );
}
