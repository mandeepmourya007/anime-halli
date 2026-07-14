import type { CastMember } from "@/lib/media/models";
import GlassCard from "@/components/ui/GlassCard";
import MediaThumbnail from "@/components/ui/MediaThumbnail";

export default function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) {
    return <p className="text-sm text-white/50">No cast data available.</p>;
  }

  return (
    // Fixed height = exactly 2 rows (2 cols on mobile = 4 cards visible before
    // scrolling) — card height is pinned via `h-24` on GlassCard below so this
    // math (2 * 6rem + 1rem gap) doesn't drift if content length changes.
    <div className="h-[13rem] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cast.map((member) => (
          <GlassCard key={member.id} className="h-24 overflow-hidden">
            <div className="flex h-full gap-3 p-2">
              <MediaThumbnail
                src={member.imageUrl}
                alt={member.primaryName}
                sizes="80px"
                className="h-20 w-16 flex-shrink-0 rounded-squircle-sm"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold text-white/90">{member.primaryName}</p>
                {member.secondaryName && (
                  <p className="truncate text-xs text-neon-cyan/90">{member.secondaryName}</p>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
