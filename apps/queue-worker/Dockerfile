FROM oven/bun:1.2.15 AS base

# --- STEP 1: INSTALLER ---
FROM base AS installer
WORKDIR /app

COPY package.json bun.lock turbo.json ./
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

RUN bun install

# --- STEP 2: RUNNER ---
FROM oven/bun:1.2.15 AS runner

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

ARG RABBITMQ_URL
ARG RABBITMQ_QUEUE
ARG REDIS_URL
ARG DATABASE_URL
ARG DISCORD_TOKEN
ARG DISCORD_APP_ID

ENV RABBITMQ_URL=$RABBITMQ_URL \
    RABBITMQ_QUEUE=$RABBITMQ_QUEUE \
    REDIS_URL=$REDIS_URL \
    DATABASE_URL=$DATABASE_URL \
    DISCORD_TOKEN=$DISCORD_TOKEN \
    DISCORD_APP_ID=$DISCORD_APP_ID

COPY --from=installer /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/queue-worker
CMD ["bun", "run", "src/index.ts"]
