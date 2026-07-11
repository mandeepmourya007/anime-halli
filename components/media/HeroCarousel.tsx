"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MediaSummary } from "@/lib/media";
import { cn, formatScore, yearFrom } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import MediaThumbnail from "@/components/ui/MediaThumbnail";
import PosterHero from "@/components/media/PosterHero";

const ROTATE_MS = 6000;
const MAX_SLIDES = 4;

function BadgesAndTitle({ anime, titleClassName }: { anime: MediaSummary; titleClassName: string }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="score">★ {formatScore(anime.score)}</Badge>
        <Badge>{anime.type}</Badge>
        <Badge>{yearFrom(anime.year)}</Badge>
      </div>
      <h1 className={cn("font-display font-bold text-white", titleClassName)}>{anime.title}</h1>
    </div>
  );
}

/**
 * Auto-rotating hero for the category pages (Anime/Movies/Web Series) — cycles
 * through the top few items of the active tab, image and text together, via a
 * `key`-remount crossfade (see `.animate-hero-fade` in globals.css). The detail
 * page keeps using the static single-item `HeroBanner` — a carousel makes no
 * sense there, it's already showing the one item the user picked.
 */
export default function HeroCarousel({ items }: { items: MediaSummary[] }) {
  const slides = items.slice(0, MAX_SLIDES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const anime = slides[index];

  return (
    <div className="glass glass-sheen relative overflow-hidden rounded-squircle-lg">
      <Link href={`/anime/${anime.id}`} className="block">
        {anime.bannerUrl ? (
          <>
            <MediaThumbnail
              key={`img-${anime.id}`}
              src={anime.bannerUrl}
              alt={anime.title}
              sizes="100vw"
              priority
              className="animate-hero-fade h-64 w-full sm:h-80 md:h-96"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent" />
            </MediaThumbnail>
            <div key={`text-${anime.id}`} className="animate-hero-fade relative -mt-16 p-6 sm:-mt-20 sm:p-8">
              <BadgesAndTitle anime={anime} titleClassName="text-3xl sm:text-4xl md:text-5xl" />
            </div>
          </>
        ) : (
          <div key={`img-${anime.id}`} className="animate-hero-fade">
            <PosterHero posterUrl={anime.posterUrl} alt={anime.title} priority>
              <BadgesAndTitle anime={anime} titleClassName="text-xl sm:text-2xl md:text-3xl line-clamp-2" />
            </PosterHero>
          </div>
        )}
      </Link>

      {slides.length > 1 && (
        <div className="relative flex justify-center gap-2 pb-4 sm:absolute sm:bottom-4 sm:right-6 sm:justify-end sm:pb-0">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${slide.title}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-8 bg-white" : "w-4 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
