FROM oven/bun:latest AS base

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

# --- STEP 2: BUILDER ---
FROM base AS builder
WORKDIR /app

# Build args
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG REDIS_URL
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG DISCORD_TOKEN
ARG DISCORD_APP_ID
ARG SANITY_API_TOKEN
ARG SANITY_PROJECT_ID
ARG SANITY_DATASET
ARG SANITY_API_VERSION
ARG RABBITMQ_URL
ARG RABBITMQ_QUEUE
ARG CORS_ORIGIN
ARG NEXT_PUBLIC_SERVER_URL

ENV DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    REDIS_URL=$REDIS_URL \
    GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    DISCORD_TOKEN=$DISCORD_TOKEN \
    DISCORD_APP_ID=$DISCORD_APP_ID \
    SANITY_API_TOKEN=$SANITY_API_TOKEN \
    SANITY_PROJECT_ID=$SANITY_PROJECT_ID \
    SANITY_DATASET=$SANITY_DATASET \
    SANITY_API_VERSION=$SANITY_API_VERSION \
    RABBITMQ_URL=$RABBITMQ_URL \
    RABBITMQ_QUEUE=$RABBITMQ_QUEUE \
    CORS_ORIGIN=$CORS_ORIGIN \
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

COPY . .
COPY --from=installer /app/node_modules ./node_modules

RUN bunx turbo build --filter=server

# --- STEP 3: RUNNER ---
FROM oven/bun:latest AS runner

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
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "dist/index.mjs"]