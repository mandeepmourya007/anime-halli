# Deployment

← [[Anime Halli]]

- [`next.config.ts`](../../next.config.ts) — `output: "standalone"` (minimal self-contained server bundle), pinned `turbopack.root`.
- [`Dockerfile`](../../Dockerfile) — multi-stage build (`deps` → `builder` → `runner`), runs as non-root, copies only the standalone output + static assets.
- [`.dockerignore`](../../.dockerignore)
- [`docker-compose.yml`](../../docker-compose.yml) — local convenience wrapper.
- [`deploy.sh`](../../deploy.sh) — build + (re)run the container, waits for a health response. `./deploy.sh -p 8080` to pick a port.
- [`app/api/health/route.ts`](../../app/api/health/route.ts) + [`instrumentation.ts`](../../instrumentation.ts) — self-ping every 14 minutes (via Render's own `RENDER_EXTERNAL_URL`) to stop Render's free tier from spinning the service down after 15 min idle. No-op outside production.

## Known limitation

[`lib/http/rate-limiter.ts`](../../lib/http/rate-limiter.ts) is in-memory/process-local — correct on a single long-running container, but under-throttles relative to Jikan's global limit across multiple serverless instances. Caching (`revalidate`) still protects steady-state traffic regardless. See the README "Deploying" section for the full list of known gaps (no error monitoring, no analytics).
