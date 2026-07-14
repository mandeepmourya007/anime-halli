import type { Episode } from "@/lib/media/models";
import { formatAirDate, formatRuntime } from "@/lib/utils/format";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import MediaThumbnail from "@/components/ui/MediaThumbnail";

export default function EpisodeList({ episodes }: { episodes: Episode[] }) {
  if (episodes.length === 0) {
    return <EmptyState>No episodes available for this season.</EmptyState>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {episodes.map((episode) => {
        const airDate = formatAirDate(episode.airDate);
        const runtime = formatRuntime(episode.runtimeMinutes);

        return (
          <GlassCard key={episode.id} className="overflow-hidden">
            <div className="flex gap-3 p-3">
              <MediaThumbnail
                src={episode.thumbnailUrl}
                alt={episode.name}
                sizes="128px"
                className="aspect-video w-32 flex-shrink-0 rounded-squircle-sm"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm font-semibold text-white/90">
                  Ep {episode.episodeNumber} · {episode.name}
                </p>
                {(airDate || runtime) && (
                  <p className="text-xs text-white/50">
                    {[airDate, runtime].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
