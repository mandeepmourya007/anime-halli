import type { MetadataRoute } from "next";
import { mediaService } from "@/lib/media";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = ["", "/?tab=airing", "/?tab=movies", "/search"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  // Only the first page of top anime — enumerating every title isn't feasible
  // through Jikan without a huge number of requests, and this call is already
  // cached (see JikanProvider's revalidate window), so it doesn't add load.
  try {
    const top = await mediaService.getTop({ page: 1 });
    const animeEntries: MetadataRoute.Sitemap = top.items.map((anime) => ({
      url: `${SITE_URL}/anime/${anime.id}`,
      lastModified: new Date(),
    }));
    return [...staticEntries, ...animeEntries];
  } catch {
    // Upstream unavailable at build/request time — still serve the static routes.
    return staticEntries;
  }
}
