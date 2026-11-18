FROM oven/bun:1.3.3-slim AS base

# --- STEP 1: PRUNER ---
FROM base AS pruner
WORKDIR /app
RUN bun add --global turbo
COPY . .
RUN turbo prune cms --docker

# --- STEP 2: BUILDER ---
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./

RUN bunx turbo build --filter=cms

# --- STEP 3: RUNNER ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile --production --ignore-scripts
COPY --from=pruner /app/out/full/ ./
COPY --from=builder /app/apps/cms/dist ./apps/cms/dist

WORKDIR /app/apps/cms

EXPOSE 3333

CMD ["bun", "run", "start", "--host", "0.0.0.0"]
