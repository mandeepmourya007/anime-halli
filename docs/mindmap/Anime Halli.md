# Anime Halli

Next.js anime discovery app. Frontend-only, no custom backend — data comes from a provider-agnostic data layer (default: Jikan v4). Visual style: dark "Neon Glass" / iOS Liquid Glass.

See [[Anime Halli.canvas|the visual mind map]] for the same structure as a canvas.

## Branches

- [[Architecture]] — the patterns holding it together (Adapter, Facade, Composite, Factory)
- [[Data Layer]] — providers, mappers, HTTP fetcher, rate limiting
- [[UI Components]] — shared building blocks (cards, grids, nav, glass primitives)
- [[Pages and Routes]] — home, search, detail, SEO routes
- [[Styling and Theme]] — Tailwind v4 tokens, glass/squircle utilities, accessibility
- [[Testing and CI]] — vitest suite, GitHub Actions
- [[Deployment]] — Docker, deploy script, standalone output
- [[Future Scope]] — multi-category expansion, multi-theme system, more providers

## Source of truth docs

- [Implementation plan](../plan-anime-discovery-app.md)
- [Component wireframes](../wireframes.md)
