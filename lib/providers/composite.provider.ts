import type { MediaDetail, MediaSummary, CastMember, Genre, Paged } from "@/lib/media/models";
import type { MediaProvider, GenreQuery, ListQuery, SearchQuery } from "@/lib/media/provider";
import { NotFoundError, ProviderError } from "@/lib/http/errors";

/**
 * Composite / Chain-of-Responsibility provider: tries each configured provider in
 * priority order for a given method. Only falls through to the next provider on
 * errors that plausibly mean "this provider can't serve the request right now"
 * (rate limit, auth, generic upstream failure). A `NotFoundError` means the
 * resource genuinely doesn't exist at that provider — since providers don't share
 * an ID namespace (e.g. MAL ids vs. AniList ids), retrying it against a different
 * provider would silently return the wrong title, so it's rethrown immediately.
 * Any other error (a bug, an unimplemented scaffold method) is also rethrown
 * immediately rather than masked as "all providers failed".
 */
export class CompositeProvider implements MediaProvider {
  readonly name = "composite";
  private readonly providers: MediaProvider[];

  constructor(providers: MediaProvider[]) {
    if (providers.length === 0) {
      throw new Error("CompositeProvider requires at least one provider");
    }
    this.providers = providers;
  }

  private async tryEach<T>(fn: (provider: MediaProvider) => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        return await fn(provider);
      } catch (err) {
        if (err instanceof NotFoundError || !(err instanceof ProviderError)) {
          throw err;
        }

        // RateLimitError, AuthError, or a generic ProviderError — this specific
        // provider can't serve the request right now; try the next one.
        lastError = err;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new ProviderError("All providers failed", { provider: this.name });
  }

  getTop(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.tryEach((p) => p.getTop(q));
  }

  getAiring(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.tryEach((p) => p.getAiring(q));
  }

  getMovies(q: ListQuery): Promise<Paged<MediaSummary>> {
    return this.tryEach((p) => p.getMovies(q));
  }

  search(q: SearchQuery): Promise<Paged<MediaSummary>> {
    return this.tryEach((p) => p.search(q));
  }

  getById(id: string): Promise<MediaDetail> {
    return this.tryEach((p) => p.getById(id));
  }

  getCast(id: string): Promise<CastMember[]> {
    return this.tryEach((p) => p.getCast(id));
  }

  getGenres(): Promise<Genre[]> {
    return this.tryEach((p) => p.getGenres());
  }

  getByGenre(q: GenreQuery): Promise<Paged<MediaSummary>> {
    return this.tryEach((p) => p.getByGenre(q));
  }
}
