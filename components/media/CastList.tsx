import type { Character } from "@/lib/media/models";
import GlassCard from "@/components/ui/GlassCard";
import MediaThumbnail from "@/components/ui/MediaThumbnail";

export default function CastList({ characters }: { characters: Character[] }) {
  if (characters.length === 0) {
    return <p className="text-sm text-white/50">No character data available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {characters.map((character) => (
        <GlassCard key={character.id} className="overflow-hidden">
          <div className="flex gap-3 p-3">
            <MediaThumbnail
              src={character.imageUrl}
              alt={character.name}
              sizes="80px"
              className="h-20 w-16 flex-shrink-0 rounded-squircle-sm"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-white/90">{character.name}</p>
              <p className="text-xs text-white/50">{character.role}</p>
              {character.voiceActor && (
                <p className="truncate text-xs text-neon-cyan/90">{character.voiceActor.name}</p>
              )}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
