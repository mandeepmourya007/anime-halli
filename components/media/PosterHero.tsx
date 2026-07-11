import Image from "next/image";
import type { ReactNode } from "react";
import MediaThumbnail from "@/components/ui/MediaThumbnail";

/**
 * Hero layout for items with no landscape banner (Jikan/anime has none at
 * all — every image it returns is a portrait poster). A poster panel next to
 * the title/badges, over a blurred fill of the same image, reads as an
 * intentional design — stretching/letterboxing the portrait poster into a
 * wide backdrop frame (the previous approach) just looked like a bug.
 * Used by both HeroBanner and HeroCarousel.
 */
export default function PosterHero({
  posterUrl,
  alt,
  priority,
  children,
}: {
  posterUrl: string | null;
  alt: string;
  priority?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-96">
      {posterUrl && (
        <Image
          src={posterUrl}
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="scale-110 object-cover object-center blur-2xl brightness-[0.35]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-bg/50 via-bg/10 to-bg/50" />

      <div className="relative flex h-full items-center gap-4 p-4 sm:gap-8 sm:p-8">
        {posterUrl && (
          <MediaThumbnail
            src={posterUrl}
            alt={alt}
            sizes="200px"
            priority={priority}
            className="aspect-[2/3] h-[85%] flex-shrink-0 rounded-squircle shadow-2xl"
          />
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
