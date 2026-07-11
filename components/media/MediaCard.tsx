import type { MediaSummary } from "@/lib/media/models";
import { formatScore, yearFrom } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import GlassCard from "@/components/ui/GlassCard";
import MediaThumbnail from "@/components/ui/MediaThumbnail";
import MediaLink from "@/components/media/MediaLink";

export default function MediaCard({ anime }: { anime: MediaSummary }) {
  return (
    <MediaLink id={anime.id} className="group block">
      <GlassCard hoverGlow className="overflow-hidden">
        <MediaThumbnail
          src={anime.posterUrl}
          alt={anime.title}
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
          className="aspect-[3/4] w-full"
          imageClassName="transition-transform duration-300 group-hover:scale-105"
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/40">
              No image
            </div>
          }
        >
          <div className="absolute left-2 top-2">
            <Badge variant="score">★ {formatScore(anime.score)}</Badge>
          </div>
        </MediaThumbnail>
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-white/90">{anime.title}</h3>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{anime.type}</span>
            <span>&middot;</span>
            <span>{yearFrom(anime.year)}</span>
          </div>
        </div>
      </GlassCard>
    </MediaLink>
  );
}
