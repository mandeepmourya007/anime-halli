import Link from "next/link";
import type { AnimeDetail, AnimeSummary } from "@/lib/media/models";
import { formatScore, truncate, yearFrom } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import MediaThumbnail from "@/components/ui/MediaThumbnail";

type HeroAnime = AnimeSummary | AnimeDetail;

function hasSynopsis(anime: HeroAnime): anime is AnimeDetail {
  return "synopsis" in anime;
}

export default function HeroBanner({ anime, linked = true }: { anime: HeroAnime; linked?: boolean }) {
  const banner = hasSynopsis(anime) ? anime.bannerUrl ?? anime.posterUrl : anime.posterUrl;
  const genres = hasSynopsis(anime) ? anime.genres : [];
  const synopsis = hasSynopsis(anime) ? anime.synopsis : null;

  const content = (
    <div className="glass glass-sheen relative overflow-hidden rounded-squircle-lg">
      <MediaThumbnail
        src={banner}
        alt={anime.title}
        sizes="100vw"
        priority
        className="h-64 w-full sm:h-80 md:h-96"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent" />
      </MediaThumbnail>

      <div className="relative -mt-16 space-y-3 p-6 sm:-mt-20 sm:p-8">
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
  );

  if (!linked) return content;

  return <Link href={`/anime/${anime.id}`}>{content}</Link>;
}
