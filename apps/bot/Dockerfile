FROM oven/bun:1.3.3-slim AS base

# Produce a dependency-closed, bot-only workspace. This avoids shipping the
# web app, CMS, worker and their node modules in the final image.
FROM base AS pruner
WORKDIR /app
RUN bun add --global turbo
COPY . .
RUN turbo prune bot --docker

# --- STEP 2: RUNNER ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile --production --ignore-scripts
COPY --from=pruner /app/out/full/ ./

WORKDIR /app/apps/bot
CMD ["bun", "run", "src/index.ts"]
