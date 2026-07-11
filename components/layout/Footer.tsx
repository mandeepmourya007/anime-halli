import { providersConfig } from "@/lib/config/providers.config";
import Container from "@/components/layout/Container";

const tmdbEnabled = providersConfig.some((p) => p.id === "tmdb" && p.enabled);

export default function Footer() {
  return (
    <footer className="mt-10 pb-4">
      <Container>
        <div className="text-center text-[10px] leading-tight text-white/30">
          <p>
            Data via{" "}
            <a
              href="https://jikan.moe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 underline-offset-4 hover:underline"
            >
              Jikan
            </a>
            {tmdbEnabled && (
              <>
                {" "}
                &middot; This product uses the{" "}
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 underline-offset-4 hover:underline"
                >
                  TMDB
                </a>{" "}
                API but is not endorsed, certified, or otherwise approved by TMDB.
              </>
            )}
          </p>
        </div>
      </Container>
    </footer>
  );
}
