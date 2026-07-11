import Link from "next/link";
import { Suspense } from "react";
import Container from "@/components/layout/Container";
import NavLinks from "@/components/layout/NavLinks";
import SearchBar from "@/components/search/SearchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 py-3">
      <Container>
        <div className="glass glass-sheen flex flex-wrap items-center gap-3 rounded-squircle px-4 py-3 sm:gap-6 sm:px-6">
          <Link href="/" className="shrink-0 font-display text-base font-bold tracking-tight sm:text-2xl">
            <span className="gradient-text">Anime Halli</span>
          </Link>

          {/* Always visible — these are the only way to reach the Anime/Movies/
              Web Series routes, so hiding them on mobile would strand phone users.
              `sm:contents` unwraps this row on desktop so NavLinks/search sit as
              plain siblings in the outer flex row (original layout); on mobile it
              stays a real flex row of its own below the logo — cramming logo +
              3 tabs + search into one row doesn't fit on narrow phones even with
              a smaller logo, so this stays a separate full-width row. */}
          <div className="flex w-full flex-wrap items-center gap-3 sm:contents">
            <NavLinks />

            <div className="sm:ml-auto sm:min-w-[280px]">
              <Suspense fallback={<div className="h-10 w-10" />}>
                <SearchBar />
              </Suspense>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
