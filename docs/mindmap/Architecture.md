# Architecture

← [[Anime Halli]]

The UI never talks to a vendor API directly. It depends only on a domain-model interface; a config-driven registry decides which real adapter(s) back it.

## Patterns in play

- **Adapter** — each provider (e.g. Jikan) maps its own API shape onto the shared `MediaProvider` interface.
- **Facade** — [`lib/media/index.ts`](../../lib/media/index.ts) exports `mediaService`, the single entry point every page/component imports.
- **Factory** — [`lib/providers/registry.ts`](../../lib/providers/registry.ts) builds the active provider(s) from [`lib/config/providers.config.ts`](../../lib/config/providers.config.ts).
- **Composite / Chain-of-Responsibility** — [`lib/providers/composite.provider.ts`](../../lib/providers/composite.provider.ts) falls through to the next provider on rate-limit/auth/upstream errors, but rethrows `NotFoundError` and unexpected errors immediately (provider ID namespaces aren't shared, so blind fallback on 404 would silently serve the wrong title).
- **DTO → domain mapper** — each provider's own `*.mappers.ts` is the only place that knows that vendor's response shape.

## Why

Swapping or adding a provider (or eventually a whole content category — see [[Future Scope]]) should be a new adapter + config entry, never a UI change. See details in [[Data Layer]].
