# syntax=docker/dockerfile:1

# ---- deps: install dependencies only (cached separately from source changes) ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: build the Next.js app ----
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: minimal production image, runs as a non-root user ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Render's network doesn't route IPv6 to external hosts; Node's fetch (undici) can
# otherwise pick an AAAA record for dual-stack APIs like Jikan (Cloudflare-fronted)
# and fail with a bare "fetch failed" / no HTTP status.
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Next.js "standalone" output (see next.config.ts) — a self-contained server
# with only the dependencies it actually uses, no need to npm install here.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "--env-file-if-exists=/etc/secrets/.env", "server.js"]
