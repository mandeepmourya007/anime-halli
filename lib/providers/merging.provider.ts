import type { MediaDetail, MediaSummary, CastMember, Genre, Paged } from "@/lib/media/models";
import type { MediaProvider, GenreQuery, ListQuery, SearchQuery } from "@/lib/media/provider";
import { NotFoundError } from "@/lib/http/errors";
import { isSameTitle } from "@/lib/utils/fuzzy-match";

/**
 * Fan-out + dedupe composition strategy — sits alongside (not instead of)
 * `CompositeProvider`'s fallback strategy. Every enabled provider is called in
 * parallel for list methods; results are merged with higher-priority sources
 * (earlier in `providers`) preferred on a detected duplicate. `providers` must
 * already be priority-ordered by the caller (see registry.ts).
 *
 * Known limitation: pagination across independently-paginated upstream APIs is
 * approximate. "Page N of the merged list" means "page N from every source,
 * merged" — a title that lands on one source's page 1 and another's page 2 will
 * never be compared, so a cross-page duplicate can leak through undetected.
 * Solving this properly needs a persistent cross-reference index; out of scope
 * for now (see docs/mindmap/Future Scope.md).
 */
export class MergingProvider implements MediaProvider {
  readonly name = "merging";
  private readonly providers: MediaProvider[];

  constructor(providers: MediaProvider[]) {
    if (providers.length === 0) {
      throw new Error("MergingProvider requires at least one provider");
    }
    this.providers = providers;
  }

  private mergeLists(
    page: number,
    fn: (provider: MediaProvider) => Promise<Paged<MediaSummary>>,
  ): Promise<Paged<MediaSummary>> {
    return fetchAndMergePaged(page, this.providers.map((p) => () => fn(p)));
  }

  getTop(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.mergeLists(q.page ?? 1, (p) => p.getTop(q));
  }

  getAiring(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.mergeLists(q.page ?? 1, (p) => p.getAiring(q));
  }

  getMovies(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.mergeLists(q.page ?? 1, (p) => p.getMovies(q));
  }

  search(q: SearchQuery): Promise<Paged<MediaSummary>> {
    return this.mergeLists(q.page ?? 1, (p) => p.search(q));
  }

  getByGenre(q: GenreQuery): Promise<Paged<MediaSummary>> {
    return this.mergeLists(q.page ?? 1, (p) => p.getByGenre(q));
  }

  /** Every adapter always prefixes its ids with its own provider name (see each
   * adapter's mapper) — so single-item lookups route by prefix, never by fuzzy
   * matching. This is what keeps getById/getCast unambiguous. */
  private findProviderForId(id: string): MediaProvider {
    const provider = this.providers.find((p) => id.startsWith(`${p.name}-`));
    if (!provider) {
      throw new NotFoundError(`No configured provider matches id "${id}"`);
    }
    return provider;
  }

  // `async` (not a plain arrow returning a Promise) so a synchronous throw from
  // `findProviderForId` — e.g. an unrecognized id — becomes a rejected Promise,
  // consistent with every other method here, instead of throwing immediately.
  async getById(id: string): Promise<MediaDetail> {
    return this.findProviderForId(id).getById(id);
  }

  async getCast(id: string): Promise<CastMember[]> {
    return this.findProviderForId(id).getCast(id);
  }

  async getGenres(): Promise<Genre[]> {
    const settled = await Promise.allSettled(this.providers.map((p) => p.getGenres()));
    const byName = new Map<string, Genre>();
    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      for (const genre of result.value) {
        const key = genre.name.toLowerCase();
        if (!byName.has(key)) byName.set(key, genre);
      }
    }
    return Array.from(byName.values());
  }
}

/** `sourceLists` must already be in priority order (index 0 = highest priority).
 * Keeps the first occurrence of a title, dropping later (lower-priority) matches. */
function dedupeAcrossSources(sourceLists: MediaSummary[][]): MediaSummary[] {
  const accepted: MediaSummary[] = [];
  for (const list of sourceLists) {
    for (const item of list) {
      const isDuplicate = accepted.some((existing) =>
        isSameTitle(existing.title, item.title, existing.year, item.year),
      );
      if (!isDuplicate) accepted.push(item);
    }
  }
  return accepted;
}

/** Combines already-fetched paged results (priority order = call order) into
 * one deduped page. Exported so any fan-out+merge (not just `MergingProvider`
 * itself) can reuse the same combining rules — e.g. the Anime page's
 * Jikan+TMDB-anime-scoped merge in lib/media/anime-merge.ts. */
export function mergePagedResults(page: number, results: Paged<MediaSummary>[]): Paged<MediaSummary> {
  return {
    items: dedupeAcrossSources(results.map((r) => r.items)),
    page,
    hasNext: results.some((r) => r.hasNext),
    lastPage: Math.max(...results.map((r) => r.lastPage)),
  };
}

/**
 * Fans out to each `call`, tolerating individual failures (only throws if
 * every call fails), then merges via `mergePagedResults`. `calls` must already
 * be in priority order (index 0 = highest priority on a detected duplicate).
 */
export async function fetchAndMergePaged(
  page: number,
  calls: Array<() => Promise<Paged<MediaSummary>>>,
): Promise<Paged<MediaSummary>> {
  const settled = await Promise.allSettled(calls.map((c) => c()));

  const fulfilled: Paged<MediaSummary>[] = [];
  let firstError: unknown;
  for (const result of settled) {
    if (result.status === "fulfilled") {
      fulfilled.push(result.value);
    } else if (firstError === undefined) {
      firstError = result.reason;
    }
  }

  if (fulfilled.length === 0) {
    throw firstError instanceof Error ? firstError : new Error("All sources failed");
  }

  return mergePagedResults(page, fulfilled);
}
