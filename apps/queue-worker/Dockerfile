FROM oven/bun:1.3.3 AS base

# --- STEP 1: INSTALLER ---
FROM base AS installer
WORKDIR /app

COPY package.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY apps/cms/package.json ./apps/cms/
COPY apps/bot/package.json ./apps/bot/
COPY apps/queue-worker/package.json ./apps/queue-worker/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/queue/package.json ./packages/queue/
COPY packages/redis/package.json ./packages/redis/
COPY packages/ui/package.json ./packages/ui/

ENV PUPPETEER_SKIP_DOWNLOAD=true

# Keep type packages and other development-only dependencies out of the
# runtime image. Chromium is supplied by the OS below.
RUN bun install --production --ignore-scripts

# --- STEP 2: RUNNER ---
FROM oven/bun:1.3.3 AS runner

RUN set -eux; \
  apt-get update; \
  apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    libxss1 \
    libnss3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libdrm2 \
    libxkbcommon0 \
    libxrandr2 \
    libxdamage1 \
    libxcomposite1 \
    libxshmfence1 \
  ; \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=installer /app/ ./
# The worker needs only its source, its two shared packages and the small
# Sanity client module. Do not copy the monorepo (or its build artefacts).
COPY apps/queue-worker ./apps/queue-worker
COPY packages/queue ./packages/queue
COPY packages/redis ./packages/redis
COPY apps/server/src/sanity.ts ./apps/server/src/sanity.ts

WORKDIR /app/apps/queue-worker
CMD ["bun", "run", "src/index.ts"]
