import Link from "next/link";
import { cn } from "@/lib/utils/format";

interface Tab {
  value: string;
  label: string;
}

/**
 * Reusable across all three category pages (Anime/Movies/Web Series) — each
 * passes its own tab set and base path (see lib/media/tabs.ts). A page can
 * render more than one independent `CategoryTabs` for orthogonal dimensions
 * (e.g. Movies' region + sort) by giving each a distinct `paramName` and
 * passing the other dimension's current value via `extraParams`, so switching
 * one never drops the other.
 */
export default function CategoryTabs({
  tabs,
  activeTab,
  basePath,
  paramName = "tab",
  extraParams,
}: {
  tabs: readonly Tab[];
  activeTab: string;
  basePath: string;
  paramName?: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <div className="glass inline-flex items-center gap-1 rounded-squircle p-1.5">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        const params = new URLSearchParams(extraParams);
        params.set(paramName, tab.value);
        return (
          <Link
            key={tab.value}
            href={`${basePath}?${params.toString()}`}
            className={cn(
              "rounded-squircle-sm px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-gradient-to-r from-neon-magenta to-neon-violet text-white shadow-glow-magenta"
                : "text-white/60 hover:text-white",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
