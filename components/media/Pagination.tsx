import Link from "next/link";
import { cn } from "@/lib/utils/format";

interface PaginationProps {
  page: number;
  hasNext: boolean;
  lastPage: number;
  /** Base path, e.g. "/" or "/search" */
  basePath: string;
  /** Other query params to preserve, e.g. { tab: "top" } or { q: "naruto" } */
  extraParams?: Record<string, string>;
}

function buildHref(basePath: string, page: number, extraParams?: Record<string, string>) {
  const params = new URLSearchParams(extraParams);
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

/**
 * Builds a compact page list showing only the first 3 and last 3 pages, e.g.
 * for lastPage=20: [1, 2, 3, "...", 18, 19, 20]. Collapses everything else.
 */
function buildPageList(lastPage: number): (number | "...")[] {
  const EDGE = 3;

  if (lastPage <= EDGE * 2) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const first = Array.from({ length: EDGE }, (_, i) => i + 1);
  const last = Array.from({ length: EDGE }, (_, i) => lastPage - EDGE + 1 + i);
  return [...first, "...", ...last];
}

export default function Pagination({ page, hasNext, lastPage, basePath, extraParams }: PaginationProps) {
  const prevDisabled = page <= 1;
  const nextDisabled = !hasNext;
  const pages = buildPageList(lastPage);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={buildHref(basePath, Math.max(1, page - 1), extraParams)}
        aria-disabled={prevDisabled}
        className={cn(
          "glass rounded-squircle-sm px-4 py-2 text-sm font-medium text-white/80 transition-colors",
          prevDisabled ? "pointer-events-none opacity-40" : "hover:text-white",
        )}
      >
        ← Prev
      </Link>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-white/40">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p, extraParams)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "glass flex h-9 min-w-9 items-center justify-center rounded-squircle-sm px-3 text-sm font-medium transition-colors",
              p === page
                ? "gradient-text bg-white/10 font-bold"
                : "text-white/70 hover:text-white",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={buildHref(basePath, page + 1, extraParams)}
        aria-disabled={nextDisabled}
        className={cn(
          "glass rounded-squircle-sm px-4 py-2 text-sm font-medium text-white/80 transition-colors",
          nextDisabled ? "pointer-events-none opacity-40" : "hover:text-white",
        )}
      >
        Next →
      </Link>
    </nav>
  );
}
