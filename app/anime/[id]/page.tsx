import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAvailabilityForMedia, getSeasonEpisodes, mediaService } from "@/lib/media";
import { NotFoundError } from "@/lib/http/errors";
import AvailabilityList from "@/components/media/AvailabilityList";
import CastList from "@/components/media/CastList";
import HeroBanner from "@/components/media/HeroBanner";
import SeasonEpisodes from "@/components/media/SeasonEpisodes";
import TrailerEmbed from "@/components/media/TrailerEmbed";
import Container from "@/components/layout/Container";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ season?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;

  try {
    const anime = await mediaService.getById(id);
    // Plain string — the root layout's title template appends "— Anime Halli".
    return {
      title: anime.title,
      description: anime.synopsis ?? `Details, trailer, and cast for ${anime.title}.`,
      openGraph: { title: anime.title, images: anime.bannerUrl ? [anime.bannerUrl] : undefined },
    };
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      console.error(`generateMetadata failed for anime ${id}:`, err);
    }
    return { title: { absolute: "Anime Halli" } };
  }
}

export default async function AnimeDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { season } = await searchParams;
  const requestedSeason = season ? Number(season) : undefined;

  let anime;
  let cast;
  let availability;
  let seasonEpisodes;

  try {
    // `getAvailabilityForMedia`/`getSeasonEpisodes` never throw (see
    // lib/media/availability.ts, lib/media/episodes.ts) — safe to run alongside
    // the two calls whose failure actually matters below.
    [anime, cast, availability, seasonEpisodes] = await Promise.all([
      mediaService.getById(id),
      mediaService.getCast(id),
      getAvailabilityForMedia(id),
      getSeasonEpisodes(id, requestedSeason),
    ]);
  } catch (err) {
    // Only a genuine "this anime doesn't exist" should render as 404. Any other
    // failure (rate limit exhausted, network timeout, upstream outage) is a
    // real operational problem — log it and let Next's error boundary handle it,
    // rather than lying to the user that the title was never found.
    if (err instanceof NotFoundError) {
      notFound();
    }
    console.error(`Failed to load anime ${id}:`, err);
    throw err;
  }

  return (
    <Container className="space-y-8 py-8">
      <HeroBanner anime={anime} linked={false} />

      <AvailabilityList sources={availability} />

      {seasonEpisodes && <SeasonEpisodes data={seasonEpisodes} />}

      {anime.trailerYoutubeId && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">Trailer</h2>
          <TrailerEmbed youtubeId={anime.trailerYoutubeId} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-white">Cast</h2>
        <CastList cast={cast} />
      </section>
    </Container>
  );
}
