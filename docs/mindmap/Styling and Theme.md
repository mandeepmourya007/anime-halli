# Styling and Theme

← [[Anime Halli]] · consumed by [[UI Components]]

- [`app/globals.css`](../../app/globals.css) — Tailwind v4 theming via `@theme` (no `tailwind.config.ts`). Dark base (`#0a0a0f`), neon magenta/cyan/violet tokens, squircle radius tokens.
- `.glass` / `.glass-sheen` — the Liquid Glass utilities (translucent bg, backdrop blur+saturate, thin border, layered shadow, specular top-edge highlight).
- `.gradient-text`, `.neon-glow-hover` — accent utilities.
- `.bg-blobs` / `.bg-blob-*` — the blurred gradient shapes behind content that the glass surfaces refract against.
- `:focus-visible` ring (neon cyan) — added because glass surfaces have no contrast against the default browser outline; accessibility fix.
- Fonts: Space Grotesk (display) + Inter (body) via `next/font/google`, wired in `app/layout.tsx`.

Only one visual theme exists today ("Neon Glass"). A second structural theme (e.g. circular cards) is deliberately deferred — see [[Future Scope]].
