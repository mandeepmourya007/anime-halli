import type { StreamingSource } from "@/lib/media";
import Badge from "@/components/ui/Badge";

const TYPE_LABEL: Record<StreamingSource["type"], string> = {
  sub: "Stream",
  free: "Free",
  rent: "Rent",
  buy: "Buy",
  other: "",
};

/**
 * Renders nothing when there are no sources — this is expected for anime-only
 * titles TMDB doesn't catalog, not an error state (see lib/media/availability.ts).
 */
export default function AvailabilityList({ sources }: { sources: StreamingSource[] }) {
  if (sources.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold text-white">Where to Watch</h2>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, i) => (
          <a key={`${source.name}-${i}`} href={source.url} target="_blank" rel="noopener noreferrer">
            <Badge variant="outline" className="transition-colors hover:text-white">
              {source.name}
              {TYPE_LABEL[source.type] && ` · ${TYPE_LABEL[source.type]}`}
            </Badge>
          </a>
        ))}
      </div>
    </section>
  );
}
