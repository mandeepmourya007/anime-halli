import { mediaService } from "@/lib/media";
import MediaGrid from "@/components/media/MediaGrid";
import Pagination from "@/components/media/Pagination";
import Container from "@/components/layout/Container";
import EmptyState from "@/components/ui/EmptyState";

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const query = q.trim();

  if (!query) {
    return (
      <Container className="space-y-6 py-8">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Search</h1>
        <EmptyState>Type something in the search bar to find anime.</EmptyState>
      </Container>
    );
  }

  const result = await mediaService.search({ q: query, page });

  return (
    <Container className="space-y-6 py-8">
      <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
        Results for <span className="gradient-text">&ldquo;{query}&rdquo;</span>
      </h1>

      <MediaGrid items={result.items} />

      {result.items.length > 0 && (
        <Pagination
          page={result.page}
          hasNext={result.hasNext}
          lastPage={result.lastPage}
          basePath="/search"
          extraParams={{ q: query }}
        />
      )}
    </Container>
  );
}
