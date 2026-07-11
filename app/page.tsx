import { getAnimeList, type AnimeTab } from "@/lib/media";
import { ANIME_TABS, VALID_ANIME_TABS, resolveListParams } from "@/lib/media/tabs";
import MediaGrid from "@/components/media/MediaGrid";
import CategoryTabs from "@/components/media/CategoryTabs";
import HeroCarousel from "@/components/media/HeroCarousel";
import Pagination from "@/components/media/Pagination";
import Container from "@/components/layout/Container";

type SearchParams = Promise<{ tab?: string; page?: string }>;

export default async function AnimePage({ searchParams }: { searchParams: SearchParams }) {
  const { tab, page } = resolveListParams(await searchParams, VALID_ANIME_TABS) as {
    tab: AnimeTab;
    page: number;
  };

  const result = await getAnimeList(tab, page);
  const heroItems = page === 1 ? result.items : [];

  return (
    <Container className="space-y-8 py-8">
      <HeroCarousel items={heroItems} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Discover <span className="gradient-text">Anime</span>
        </h2>
        <CategoryTabs tabs={ANIME_TABS} activeTab={tab} basePath="/" />
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
