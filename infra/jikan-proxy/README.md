# jikan-proxy

Cloudflare Worker that forwards GET requests to `api.jikan.moe/v4`. Exists to work
around Render's runtime egress to Jikan timing out (`ETIMEDOUT` on every attempt) —
see [lib/http/fetcher.ts](../../lib/http/fetcher.ts) logging that surfaced this.

## Deploy

```bash
cd infra/jikan-proxy
npx wrangler login   # first time only
npx wrangler deploy
```

This prints a URL like `https://jikan-proxy.<your-subdomain>.workers.dev`.

## Wire it up

On Render, set the app's `JIKAN_BASE_URL` env var to that Worker URL (no trailing
slash, no `/v4` — the Worker already targets `/v4`):

```
JIKAN_BASE_URL=https://jikan-proxy.<your-subdomain>.workers.dev
```

`lib/config/providers.config.ts` already reads this env var — no app code changes
needed. Redeploy the Render service after setting it.
