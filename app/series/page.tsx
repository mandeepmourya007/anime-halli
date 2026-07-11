import { tmdbProvider } from "@/lib/media";
import type { MediaSummary, Paged } from "@/lib/media/models";
import type { SeriesTab } from "@/lib/media/tabs";
import { SERIES_TABS, VALID_SERIES_TABS, resolveListParams } from "@/lib/media/tabs";
import MediaGrid from "@/components/media/MediaGrid";
import CategoryTabs from "@/components/media/CategoryTabs";
import HeroCarousel from "@/components/media/HeroCarousel";
import Pagination from "@/components/media/Pagination";
import Container from "@/components/layout/Container";
import EmptyState from "@/components/ui/EmptyState";

type SearchParams = Promise<{ tab?: string; page?: string }>;

function fetchTab(
  provider: NonNullable<typeof tmdbProvider>,
  tab: SeriesTab,
  page: number,
): Promise<Paged<MediaSummary>> {
  switch (tab) {
    case "trending":
      return provider.getTrendingTv(page);
    case "new":
      return provider.getNewTv(page);
    default:
      return provider.getTopTv(page);
  }
}

export default async function SeriesPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab, page } = resolveListParams(await searchParams, VALID_SERIES_TABS) as {
    tab: SeriesTab;
    page: number;
  };

  if (!tmdbProvider) {
    return (
      <Container className="space-y-6 py-8">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Web Series</h1>
        <EmptyState>
          Web Series needs TMDB enabled — set <code>TMDB_ENABLED=true</code> and{" "}
          <code>TMDB_API_KEY</code> in <code>.env</code> (see <code>.env.example</code>).
        </EmptyState>
      </Container>
    );
  }

  const result = await fetchTab(tmdbProvider, tab, page);
  const heroItems = page === 1 ? result.items : [];

  return (
    <Container className="space-y-8 py-8">
      <HeroCarousel items={heroItems} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Discover <span className="gradient-text">Web Series</span>
        </h2>
        <CategoryTabs tabs={SERIES_TABS} activeTab={tab} basePath="/series" />
      </div>

      <MediaGrid items={result.items} />

      <Pagination
        page={result.page}
        hasNext={result.hasNext}
        lastPage={result.lastPage}
        basePath="/series"
        extraParams={{ tab }}
      />
    </Container>
  );
}
