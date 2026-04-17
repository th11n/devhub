FROM node:22.12.0-slim AS base
RUN npm install -g bun

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

COPY --from=installer /app ./
COPY . .

RUN bunx turbo build --filter=cms

# --- STEP 3: RUNNER ---
FROM node:22.12.0-slim AS runner
WORKDIR /app
RUN npm install -g bun

COPY --from=builder /app ./

WORKDIR /app/apps/cms

EXPOSE 3333

CMD ["bun", "run", "start", "--host", "0.0.0.0"]