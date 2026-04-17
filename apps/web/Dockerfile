FROM oven/bun:1.2.15-slim AS base

# --- STEP 1: INSTALLER ---
FROM base AS installer
WORKDIR /app

# Copy root config and lockfile
COPY package.json bun.lock turbo.json ./

# Copy all package.json files to allow bun install to work with workspaces
# We use a trick to copy only package.json files to keep the layer cacheable
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

ARG NEXT_PUBLIC_SERVER_URL
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG CORS_ORIGIN
ARG REDIS_URL
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    CORS_ORIGIN=$CORS_ORIGIN \
    REDIS_URL=$REDIS_URL \
    GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    NODE_ENV=production

# Copy all source
COPY . .
# Copy node_modules from installer
COPY --from=installer /app/node_modules ./node_modules

RUN bunx turbo build --filter=web

# --- STEP 3: RUNNER ---
FROM oven/bun:1.2.15-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 bun-group
RUN adduser --system --uid 1001 bun-user
USER bun-user

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=bun-user:bun-group /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bun-user:bun-group /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "apps/web/server.js"]