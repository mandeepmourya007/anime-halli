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
    // Fixed height = exactly 4 rows (1 col on mobile = 4 episodes visible
    // before scrolling) — card height is pinned via `h-24` on GlassCard below
    // so this math (4 * 6rem + 3 * 1rem gap) doesn't drift with content length.
    <div className="h-[27rem] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {episodes.map((episode) => {
          const airDate = formatAirDate(episode.airDate);
          const runtime = formatRuntime(episode.runtimeMinutes);

          return (
            <GlassCard key={episode.id} className="h-24 overflow-hidden">
              <div className="flex h-full gap-3 p-3">
                <MediaThumbnail
                  src={episode.thumbnailUrl}
                  alt={episode.name}
                  sizes="128px"
                  className="aspect-video w-32 flex-shrink-0 rounded-squircle-sm"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center bg-white/5 text-center text-[10px] text-white/40">
                      No thumbnail
                    </div>
                  }
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
    </div>
  );
}
