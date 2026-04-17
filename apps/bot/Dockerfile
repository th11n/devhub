FROM oven/bun:1.2.15-slim AS base

# --- STEP 1: PRUNER ---
FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune bot --docker

# --- STEP 2: INSTALLER ---
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN bun install

# --- STEP 3: RUNNER ---
FROM oven/bun:1.2.15-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=pruner /app/out/full/apps/bot ./apps/bot
COPY --from=pruner /app/out/full/packages ./packages
COPY --from=installer /app/node_modules ./node_modules

WORKDIR /app/apps/bot
CMD ["bun", "run", "src/index.ts"]
