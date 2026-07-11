import { tmdbProvider } from "@/lib/media";
import type { MediaSummary, Paged } from "@/lib/media/models";
import type { MovieRegion, MovieTab } from "@/lib/media/tabs";
import {
  COUNTRY_BY_REGION,
  MOVIE_REGIONS,
  MOVIE_TABS,
  VALID_MOVIE_REGIONS,
  VALID_MOVIE_TABS,
  resolveDimension,
  resolveListParams,
} from "@/lib/media/tabs";
import MediaGrid from "@/components/media/MediaGrid";
import CategoryTabs from "@/components/media/CategoryTabs";
import HeroCarousel from "@/components/media/HeroCarousel";
import Pagination from "@/components/media/Pagination";
import Container from "@/components/layout/Container";
import EmptyState from "@/components/ui/EmptyState";

type SearchParams = Promise<{ tab?: string; region?: string; page?: string }>;

// `region` and `tab` are independent dimensions (see lib/media/tabs.ts) — a
// region filters by country, `tab` is the sort/freshness within that filter.
function fetchTab(
  provider: NonNullable<typeof tmdbProvider>,
  region: MovieRegion,
  tab: MovieTab,
  page: number,
): Promise<Paged<MediaSummary>> {
  const country = COUNTRY_BY_REGION[region];
  if (country) {
    return provider.getMoviesByCountry(page, country, tab);
  }
  switch (tab) {
    case "trending":
      return provider.getTrendingMovies(page);
    case "new":
      return provider.getNewMovies(page);
    default:
      return provider.getMovies({ page });
  }
}

export default async function MoviesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { tab, page } = resolveListParams(params, VALID_MOVIE_TABS) as { tab: MovieTab; page: number };
  const region = resolveDimension(params.region, VALID_MOVIE_REGIONS, "all") as MovieRegion;

  if (!tmdbProvider) {
    return (
      <Container className="space-y-6 py-8">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Movies</h1>
        <EmptyState>
          Movies need TMDB enabled — set <code>TMDB_ENABLED=true</code> and{" "}
          <code>TMDB_API_KEY</code> in <code>.env</code> (see <code>.env.example</code>).
        </EmptyState>
      </Container>
    );
  }

  const result = await fetchTab(tmdbProvider, region, tab, page);
  const heroItems = page === 1 ? result.items : [];

  return (
    <Container className="space-y-8 py-8">
      <HeroCarousel items={heroItems} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Discover <span className="gradient-text">Movies</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryTabs
            tabs={MOVIE_REGIONS}
            activeTab={region}
            basePath="/movies"
            paramName="region"
            extraParams={{ tab }}
          />
          <CategoryTabs
            tabs={MOVIE_TABS}
            activeTab={tab}
            basePath="/movies"
            paramName="tab"
            extraParams={{ region }}
          />
        </div>
      </div>

      <MediaGrid items={result.items} />

      <Pagination
        page={result.page}
        hasNext={result.hasNext}
        lastPage={result.lastPage}
        basePath="/movies"
        extraParams={{ tab, region }}
      />
    </Container>
  );
}
