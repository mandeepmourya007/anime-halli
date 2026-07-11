/**
 * Cloudflare Worker that forwards requests to Jikan. Exists because Render's runtime
 * egress to api.jikan.moe times out (ETIMEDOUT on every attempt) — likely Cloudflare/MAL
 * silently dropping connections from cloud/datacenter IP ranges. Routing through a Worker
 * changes the network path: Cloudflare-to-Cloudflare traffic isn't subject to the same
 * block, so this app calls this Worker's URL (via JIKAN_BASE_URL) instead of Jikan directly.
 */

const JIKAN_ORIGIN = "https://api.jikan.moe/v4";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const incoming = new URL(request.url);
    const target = new URL(`${JIKAN_ORIGIN}${incoming.pathname}${incoming.search}`);

    const res = await fetch(target.toString(), {
      headers: { Accept: "application/json" },
    });

    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": res.headers.get("Cache-Control") ?? "public, max-age=60",
      },
    });
  },
};
