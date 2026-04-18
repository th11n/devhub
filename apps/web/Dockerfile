FROM oven/bun:1.2.15-slim AS base

# --- STEP 1: PRUNER ---
FROM base AS pruner
WORKDIR /app
RUN bun install -g turbo
COPY . .
RUN turbo prune web --docker

# --- STEP 2: BUILDER ---
FROM base AS builder
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_SERVER_URL
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG REDIS_URL
ARG CORS_ORIGIN
ARG SANITY_PROJECT_ID
ARG SANITY_DATASET

ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    REDIS_URL=$REDIS_URL \
    CORS_ORIGIN=$CORS_ORIGIN \
    SANITY_PROJECT_ID=$SANITY_PROJECT_ID \
    SANITY_DATASET=$SANITY_DATASET \
    NODE_ENV=production

RUN bunx turbo build --filter=web --concurrency=1

RUN cp -rL /app/apps/web/.next/standalone /app/standalone_physical

# --- STEP 3: RUNNER ---
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/standalone_physical ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3001
CMD ["node", "apps/web/server.js"]
