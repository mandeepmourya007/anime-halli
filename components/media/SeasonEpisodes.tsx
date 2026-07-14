import type { SeasonEpisodesData } from "@/lib/media/episodes";
import EpisodeList from "./EpisodeList";
import SeasonSelect from "./SeasonSelect";

export default function SeasonEpisodes({ data }: { data: SeasonEpisodesData }) {
  const { seasons, selectedSeason, episodes } = data;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Episodes</h2>
          <p className="text-sm text-white/50">
            {seasons.length} {seasons.length === 1 ? "season" : "seasons"}
          </p>
        </div>
        {seasons.length > 1 && <SeasonSelect seasons={seasons} selected={selectedSeason} />}
      </div>

      <EpisodeList episodes={episodes} />
    </section>
  );
}
