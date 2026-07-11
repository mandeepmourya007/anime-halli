@AGENTS.md

## Keep the mind map in sync

This repo has an Obsidian mind map at `docs/mindmap/` — a hub note (`Anime Halli.md`), branch notes (Architecture, Data Layer, UI Components, Pages and Routes, Styling and Theme, Testing and CI, Deployment, Future Scope), and a visual `Anime Halli.canvas`.

Whenever a code change adds, removes, or renames something structural — a component, page, provider/adapter, pattern, deployment mechanism, or test — update the relevant branch note(s) in the same change (not as a separate follow-up). If the change introduces a genuinely new top-level area, add a node + edge to `Anime Halli.canvas` (file nodes point to real repo paths, e.g. `"file": "lib/providers/jikan/jikan.provider.ts"`) and link it from the hub note.

Keep it a lightweight map, not exhaustive documentation: update file references and one-line "why", don't restate implementation detail already obvious from the code.
