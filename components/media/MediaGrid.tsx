import type { AnimeSummary } from "@/lib/media/models";
import MediaCard from "@/components/media/MediaCard";
import EmptyState from "@/components/ui/EmptyState";

export default function MediaGrid({ items }: { items: AnimeSummary[] }) {
  if (items.length === 0) {
    return <EmptyState>No results found.</EmptyState>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((anime) => (
        <MediaCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
