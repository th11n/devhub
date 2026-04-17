FROM node:22.12.0 AS base

FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune server --docker

FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN bun install

FROM base AS builder
WORKDIR /app

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
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    NODE_ENV=production

COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/package.json ./package.json

RUN bunx turbo build --filter=server

FROM node:22.12.0 AS runner

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
COPY --from=installer /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "dist/index.mjs"]