const FOURTEEN_MINUTES = 14 * 60 * 1000;

/**
 * Pings this app's own health route every 14 minutes to prevent Render's free
 * tier from spinning the service down (Render sleeps a service after 15 min of
 * no inbound traffic). No-op outside production or when Render hasn't set
 * `RENDER_EXTERNAL_URL` (e.g. local dev, other hosts).
 */
function keepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url || process.env.NODE_ENV !== "production") return;

  setInterval(() => {
    fetch(`${url}/api/health`).catch(() => {
      // Ignore — a failed self-ping isn't worth surfacing anywhere.
    });
  }, FOURTEEN_MINUTES);
}

export function register() {
  keepAlive();
}
