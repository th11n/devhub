FROM oven/bun:1.1.34-slim AS base

# --- STEP 1: PRUNER ---
FROM base AS pruner
WORKDIR /app
RUN bun install -g turbo
COPY . .
RUN turbo prune web --docker

# --- STEP 2: INSTALLER ---
FROM base AS installer
WORKDIR /app

# First copy the pruned package.json and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock /app/bun.lock
RUN bun install --frozen-lockfile

# --- STEP 3: BUILDER ---
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_SERVER_URL
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG CORS_ORIGIN
ARG REDIS_URL

ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    CORS_ORIGIN=$CORS_ORIGIN \
    REDIS_URL=$REDIS_URL \
    NODE_ENV=production

COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/package.json ./package.json

RUN bun run build --filter=web

# --- STEP 4: RUNNER ---
FROM oven/bun:1.1.34-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 bun-group
RUN adduser --system --uid 1001 bun-user
USER bun-user

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=bun-user:bun-group /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bun-user:bun-group /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "apps/web/server.js"]
