import Link from "next/link";
import type { MediaDetail, MediaSummary } from "@/lib/media/models";
import { formatScore, truncate, yearFrom } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import MediaThumbnail from "@/components/ui/MediaThumbnail";
import PosterHero from "@/components/media/PosterHero";

type HeroAnime = MediaSummary | MediaDetail;

function hasSynopsis(anime: HeroAnime): anime is MediaDetail {
  return "synopsis" in anime;
}

function Meta({ anime, genres }: { anime: HeroAnime; genres: { id: string; name: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="score">★ {formatScore(anime.score)}</Badge>
      <Badge>{anime.type}</Badge>
      <Badge>{yearFrom(anime.year)}</Badge>
      {genres.slice(0, 4).map((genre) => (
        <Badge key={genre.id} variant="outline">
          {genre.name}
        </Badge>
      ))}
    </div>
  );
}

export default function HeroBanner({ anime, linked = true }: { anime: HeroAnime; linked?: boolean }) {
  const genres = hasSynopsis(anime) ? anime.genres : [];
  const synopsis = hasSynopsis(anime) ? anime.synopsis : null;

  // No landscape banner at all (Jikan/anime) — a poster panel instead of
  // stretching/letterboxing a portrait poster into a wide backdrop frame.
  const content = anime.bannerUrl ? (
    <div className="glass glass-sheen relative overflow-hidden rounded-squircle-lg">
      <MediaThumbnail
        src={anime.bannerUrl}
        alt={anime.title}
        sizes="100vw"
        priority
        className="h-64 w-full sm:h-80 md:h-96"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent" />
      </MediaThumbnail>

      <div className="relative -mt-16 space-y-3 p-6 sm:-mt-20 sm:p-8">
        <Meta anime={anime} genres={genres} />
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          {anime.title}
        </h1>
        {synopsis && (
          <p className="max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
            {truncate(synopsis, 320)}
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="glass glass-sheen relative overflow-hidden rounded-squircle-lg">
      <PosterHero posterUrl={anime.posterUrl} alt={anime.title} priority>
        <div className="space-y-3">
          <Meta anime={anime} genres={genres} />
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl md:text-3xl">
            {anime.title}
          </h1>
          {synopsis && (
            <p className="max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base line-clamp-3">
              {truncate(synopsis, 320)}
            </p>
          )}
        </div>
      </PosterHero>
    </div>
  );

  if (!linked) return content;

  return <Link href={`/anime/${anime.id}`}>{content}</Link>;
}
