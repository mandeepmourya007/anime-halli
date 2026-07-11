# Component Wireframes — Neon Glass / Liquid Glass

Low-fidelity layout reference for the core UI pieces. Visual language: dark base (`--color-bg: #0a0a0f`), `.glass` + `.glass-sheen` surfaces, squircle radii, magenta→violet→cyan gradient accents, neon glow on hover/focus.

## 1. MediaCard (grid item)

Used in `MediaGrid`, search results, related-titles rails.

```
┌──────────────────────────┐
│ ┌───────────────────────┐│ ← poster image, squircle-lg radius,
│ │                       ││   16:9 or 2:3 aspect, next/image fill
│ │        POSTER         ││
│ │                       ││
│ │                  ⭐8.7 ││ ← score badge, glass pill, top-right
│ └───────────────────────┘│    overlaid on image
│  Attack on Titan          │ ← title, font-display, 1 line truncate
│  TV · 2013                │ ← type · year, muted foreground
└──────────────────────────┘
     ▲ .glass card, hover: neon-glow-hover (translateY(-2px) + glow)
```

**States:** default / hover (glow+lift) / focus-visible (ring in neon-cyan) / loading (`Skeleton` shimmer, same box shape) / image-missing (fallback gradient placeholder with title initial).

**Responsive:** grid-cols 2 (mobile) → 3 (tablet) → 5 (desktop), gap-4/6.

## 2. MediaGrid + Pagination (list view)

```
┌──────────────────────────────────────────────────────────────┐
│  DISCOVER                                          (gradient) │
│  [ Top ] [ Airing ] [ Movies ] [ Genre ▾ ]      ← CategoryTabs│
│                                                    (glass pill,│
│                                                  active=filled)│
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │Card│ │Card│ │Card│ │Card│ │Card│                          │
│  └────┘ └────┘ └────┘ └────┘ └────┘                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │Card│ │Card│ │Card│ │Card│ │Card│                          │
│  └────┘ └────┘ └────┘ └────┘ └────┘                          │
│                                                                │
│              ⟨  1  2  [3]  4  …  12  ⟩         ← Pagination   │
└────────────────────────────────────────────────────────────────┘
```

**CategoryTabs:** horizontal scroll on mobile, `.glass` pill container; active tab = filled gradient background + white text, inactive = transparent + muted text.

**Pagination:** glass pill row, current page = gradient-filled circle, prev/next arrows disabled state when `!hasPrev`/`!hasNext` (from domain `Paged<T>`). Whole row hidden if `lastPage <= 1`.

**Empty state:** centered glass card, illustration/icon + "Nothing here yet" + (on search) "try another title".

## 3. SearchBar + Search Results

**Navbar search (collapsed → expanded):**
```
Collapsed (default):        Expanded (focused/typed):
┌───────────────────┐       ┌──────────────────────────────┐
│ 🔍  Search anime…  │  →   │ 🔍 naruto              [x] ⏎ │
└───────────────────┘       └──────────────────────────────┘
  .glass pill, muted           same pill, ring-neon-cyan focus
```
Client component; on submit (Enter or debounced input) → `router.push('/search?q=...')`.

**Search results page (`/search?q=`):**
```
┌──────────────────────────────────────────────────────────────┐
│  Results for "naruto"                       (gradient text)  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │Card│ │Card│ │Card│ │Card│ │Card│      ← same MediaGrid     │
│  └────┘ └────┘ └────┘ └────┘ └────┘                          │
│              ⟨  1  [2]  3  ⟩                                  │
└──────────────────────────────────────────────────────────────┘

No query:                         No results:
┌─────────────────────────┐       ┌─────────────────────────┐
│   Type to search anime   │       │  No results for "zzzq"   │
│        🔍 (muted)         │       │  Try a different title   │
└─────────────────────────┘       └─────────────────────────┘
```

## 4. Modal (glass dialog — trailer / quick-view)

Used for: trailer playback from a card (optional quick-play), image lightbox on detail page, confirmation dialogs (future: remove-from-watchlist).

```
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← backdrop:
        ░░  ┌──────────────────────────────┐  ░░    bg-black/60 + blur-sm
        ░░  │ ✕                             │  ░░
        ░░  │                                │  ░░
        ░░  │        16:9 TRAILER            │  ░░  ← .glass + .glass-sheen
        ░░  │        (iframe)                │  ░░    panel, squircle-lg,
        ░░  │                                │  ░░    centered, max-w-3xl
        ░░  │  Attack on Titan — Trailer      │  ░░
        ░░  └──────────────────────────────┘  ░░
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

**Behavior:** open on trigger click, close on `✕` / backdrop click / `Esc`; focus-trapped; body scroll-locked while open; entrance = fade + scale-in (150ms), exit = fade-out.

**Structural placement:** implement as a shared `components/ui/Modal.tsx` primitive (portal to `<body>`) reused by `TrailerEmbed`'s "watch trailer" trigger and any future dialogs — not built into `TrailerEmbed` itself, so it's reusable beyond trailers.

## 5. HeroBanner (detail page header — for context)

```
┌────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ backdrop image, gradient-to-bg overlay▓▓▓│
│▓▓                                                        ▓▓│
│▓▓  Attack on Titan                        (huge, display)▓▓│
│▓▓  ⭐8.7   TV · 2013 · 25 eps                             ▓▓│
│▓▓  [Action] [Drama] [Fantasy]      ← Badge chips, glass    ▓▓│
│▓▓                                                        ▓▓│
│▓▓  Synopsis text, 3-4 lines, muted foreground…            ▓▓│
│▓▓                                                        ▓▓│
│▓▓  [ ▶ Watch Trailer ]  ← glass button, neon-glow-hover    ▓▓│
└────────────────────────────────────────────────────────────┘
```

## Shared primitives referenced above
- `GlassCard` — base surface (`MediaCard`, `Modal` panel, search-empty-state box all compose this).
- `Badge` — genre chips, score pill.
- `Skeleton` — card/grid loading placeholders matching real component dimensions (prevents layout shift).
- `GradientText` — section headings ("Discover", "Results for…").

## Build note
These are layout/interaction specs, not pixel mockups — implement directly in Tailwind using the existing `.glass`/`.glass-sheen`/squircle tokens in `app/globals.css`. `Modal` is a new primitive not yet in the original component list — add `components/ui/Modal.tsx` when trailer quick-view / future dialogs are implemented.
