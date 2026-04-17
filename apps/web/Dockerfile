FROM oven/bun:1.2.4-slim AS base

FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune web --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN bun install

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

COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/package.json ./package.json

RUN bunx turbo build --filter=web

FROM oven/bun:1.2.4-slim AS runner
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