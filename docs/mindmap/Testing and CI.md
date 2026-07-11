# Testing and CI

← [[Anime Halli]] · covers [[Data Layer]]

## Tests (vitest, `npm run test`)

- [`lib/providers/jikan/jikan.mappers.test.ts`](../../lib/providers/jikan/jikan.mappers.test.ts) — DTO→domain mapping, id prefixing, `dedupeById` (Jikan's `filter=airing` can return the same `mal_id` twice), Japanese voice-actor selection.
- [`lib/providers/composite.provider.test.ts`](../../lib/providers/composite.provider.test.ts) — the fallback-discrimination fix: `NotFoundError` and unexpected errors rethrow immediately; `RateLimitError`/`AuthError` fall through.
- [`lib/providers/registry.test.ts`](../../lib/providers/registry.test.ts) — `assertProviderOrdering` (a partial/scaffold provider can't outrank a complete one).
- [`lib/providers/merging.provider.test.ts`](../../lib/providers/merging.provider.test.ts) — dedup keeps the higher-priority source, distinct titles from both sources survive, one provider failing doesn't break the merge, id-prefix routing, genre-name union.
- [`lib/utils/fuzzy-match.test.ts`](../../lib/utils/fuzzy-match.test.ts) — the conservative-matching contract: real duplicates (punctuation/case variance, year off-by-one) must match; distinct seasons/sequels/unrelated titles must NOT match. This is the test suite that matters most if the merge ever produces a wrong result.

## CI

- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) — lint + test + build on every push/PR to `main`.

## Dev workflow tooling

- [`.claude/skills/senior-review/SKILL.md`](../../.claude/skills/senior-review/SKILL.md) — `/senior-review` runs a two-persona (FE Engineer + Architect) review of the current diff, checks reuse of existing components/utils before approving new code, fixes confirmed issues, verifies, then outputs feature-by-feature commit commands.

No accessibility (axe/Lighthouse) or e2e suite yet — see [[Future Scope]].
