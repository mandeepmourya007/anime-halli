import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";

interface MediaThumbnailProps {
  src: string | null;
  alt: string;
  sizes: string;
  /** Sizing/aspect classes for the wrapper (e.g. "aspect-[3/4] w-full"). */
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  fallback?: ReactNode;
  /** Overlays rendered on top of the image, e.g. a score badge or gradient. */
  children?: ReactNode;
}

export default function MediaThumbnail({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  priority,
  fallback,
  children,
}: MediaThumbnailProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        fallback ?? <div className="h-full w-full bg-white/5" />
      )}
      {children}
    </div>
  );
}
