import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer className="mt-16 py-8">
      <Container>
        <div className="glass rounded-squircle px-6 py-5 text-center text-sm text-white/50">
          <p>
            Built with Next.js &middot; Data via{" "}
            <a
              href="https://jikan.moe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 underline-offset-4 hover:underline"
            >
              Jikan
            </a>{" "}
            (unofficial MyAnimeList API) &middot; Not affiliated with MyAnimeList.
          </p>
        </div>
      </Container>
    </footer>
  );
}
