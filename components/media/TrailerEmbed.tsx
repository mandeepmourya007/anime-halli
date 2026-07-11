export default function TrailerEmbed({ youtubeId }: { youtubeId: string | null }) {
  if (!youtubeId) return null;

  return (
    <div className="glass overflow-hidden rounded-squircle-lg">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
