import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mediaService } from "@/lib/media";
import { NotFoundError } from "@/lib/http/errors";
import CastList from "@/components/media/CastList";
import HeroBanner from "@/components/media/HeroBanner";
import TrailerEmbed from "@/components/media/TrailerEmbed";
import Container from "@/components/layout/Container";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;

  try {
    const anime = await mediaService.getById(id);
    return {
      title: `${anime.title} — Anime Halli`,
      description: anime.synopsis ?? `Details, trailer, and cast for ${anime.title}.`,
    };
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      console.error(`generateMetadata failed for anime ${id}:`, err);
    }
    return { title: "Anime Halli" };
  }
}

export default async function AnimeDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  let anime;
  let characters;

  try {
    [anime, characters] = await Promise.all([
      mediaService.getById(id),
      mediaService.getCharacters(id),
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

      {anime.trailerYoutubeId && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">Trailer</h2>
          <TrailerEmbed youtubeId={anime.trailerYoutubeId} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-white">Characters &amp; Voice Actors</h2>
        <CastList characters={characters} />
      </section>
    </Container>
  );
}
