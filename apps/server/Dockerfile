FROM oven/bun:1.2.4 AS base

# --- STEP 1: PRUNER ---
FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune server --docker

# --- STEP 2: INSTALLER ---
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN bun install

# --- STEP 3: BUILDER ---
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/package.json ./package.json
RUN bunx turbo build --filter=server

# --- STEP 4: RUNNER ---
FROM oven/bun:1.2.4 AS runner

# Install Chromium (ARM64 compatible, Debian-based)
RUN set -eux; \
  apt-get update; \
  apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    libxss1 \
    libnss3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libdrm2 \
    libxkbcommon0 \
    libxrandr2 \
    libxdamage1 \
    libxcomposite1 \
    libxshmfence1 \
  ; \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "dist/index.mjs"]
