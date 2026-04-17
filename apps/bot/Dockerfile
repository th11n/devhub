FROM oven/bun:1.2.15-slim AS base

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
FROM oven/bun:1.2.15-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=installer /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/bot
CMD ["bun", "run", "src/index.ts"]
