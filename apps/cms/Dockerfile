FROM oven/bun:1.1.34-slim AS base

# --- STEP 1: PRUNER ---
FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune cms --docker

# --- STEP 2: INSTALLER ---
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock /app/bun.lock
RUN bun install --frozen-lockfile

# --- STEP 3: BUILDER ---
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
RUN bun run build --filter=cms

# --- STEP 4: RUNNER ---
# Sanity Studio builds to a static folder, so we can use a simple static server or bun to serve it.
# Usually Sanity 'start' command runs a server.
FROM oven/bun:1.1.34-slim AS runner
WORKDIR /app

COPY --from=builder /app/apps/cms/dist ./dist
COPY --from=builder /app/apps/cms/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

EXPOSE 3333

# Sanity Studio usually needs a way to serve the static files in production.
# The 'sanity start' command in production typically serves the 'dist' folder.
CMD ["bun", "run", "start", "--", "--host=0.0.0.0"]
