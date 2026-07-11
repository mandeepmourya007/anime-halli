import { jikanProvider, tmdbProvider } from "./category-providers";
import type { MediaSummary, Paged } from "./models";
import type { AnimeTab } from "./tabs";
import { fetchAndMergePaged } from "@/lib/providers/merging.provider";

/**
 * The Anime page's own merge — Jikan (always anime) + TMDB's anime-scoped
 * queries (genre=Animation + origin=Japan), TMDB preferred on a detected
 * duplicate. Deliberately NOT `mediaService`: that facade's TMDB side calls
 * the general-purpose `getTop`/`getAiring`/`getMovies` (also used directly by
 * the Movies/Web Series pages), which return generic trending movies/TV, not
 * anime — merging that into an anime feed would pull in unrelated content.
 */
export function getAnimeList(tab: AnimeTab, page: number): Promise<Paged<MediaSummary>> {
  const jikanCall = () => {
    switch (tab) {
      case "trending":
        return jikanProvider.getTrending(page);
      case "airing":
        return jikanProvider.getAiring({ page });
      case "movies":
        return jikanProvider.getMovies({ page });
      default:
        return jikanProvider.getTop({ page });
    }
  };

  if (!tmdbProvider) {
    return fetchAndMergePaged(page, [jikanCall]);
  }

  const tmdb = tmdbProvider;
  const tmdbCall = () => {
    switch (tab) {
      case "trending":
        return tmdb.getAnimeTrending(page);
      case "airing":
        return tmdb.getAnimeAiring(page);
      case "movies":
        return tmdb.getAnimeMovies(page);
      default:
        return tmdb.getAnimeTop(page);
    }
  };

  // TMDB first = higher priority on a detected duplicate (see fetchAndMergePaged).
  return fetchAndMergePaged(page, [tmdbCall, jikanCall]);
}
