import { mediaService } from "@/lib/media";
import type { AnimeSummary, Paged } from "@/lib/media/models";
import MediaGrid from "@/components/media/MediaGrid";
import CategoryTabs from "@/components/media/CategoryTabs";
import HeroBanner from "@/components/media/HeroBanner";
import Pagination from "@/components/media/Pagination";
import Container from "@/components/layout/Container";

type SearchParams = Promise<{ tab?: string; page?: string }>;

const VALID_TABS = new Set(["top", "airing", "movies"]);

async function fetchTab(tab: string, page: number): Promise<Paged<AnimeSummary>> {
  switch (tab) {
    case "airing":
      return mediaService.getAiring({ page });
    case "movies":
      return mediaService.getMovies({ page });
    default:
      return mediaService.getTop({ page });
  }
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { tab: rawTab, page: rawPage } = await searchParams;
  const tab = rawTab && VALID_TABS.has(rawTab) ? rawTab : "top";
  const page = Math.max(1, Number(rawPage) || 1);

  const [result, heroResult] = await Promise.all([
    fetchTab(tab, page),
    page === 1 ? mediaService.getTop({ page: 1 }) : Promise.resolve(null),
  ]);

  const hero = heroResult?.items[0];

  return (
    <Container className="space-y-8 py-8">
      {hero && page === 1 && <HeroBanner anime={hero} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Discover <span className="gradient-text">Anime</span>
        </h2>
        <CategoryTabs activeTab={tab} />
      </div>

      <MediaGrid items={result.items} />

      <Pagination
        page={result.page}
        hasNext={result.hasNext}
        lastPage={result.lastPage}
        basePath="/"
        extraParams={{ tab }}
      />
    </Container>
  );
}
