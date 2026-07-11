import type { CastMember } from "@/lib/media/models";
import GlassCard from "@/components/ui/GlassCard";
import MediaThumbnail from "@/components/ui/MediaThumbnail";

export default function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) {
    return <p className="text-sm text-white/50">No cast data available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cast.map((member) => (
        <GlassCard key={member.id} className="overflow-hidden">
          <div className="flex gap-3 p-3">
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
  );
}
