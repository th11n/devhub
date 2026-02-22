# -------- BASE --------
FROM --platform=$TARGETPLATFORM oven/bun:1.3.9 AS base

USER root

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

# Create app directory and give bun permissions
RUN mkdir -p /app && chown bun:bun /app

USER bun

ENV \
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  HUSKY=0 \
  NODE_ENV=production

WORKDIR /app

# Copy full monorepo
COPY --chown=bun:bun . .

# Install from ROOT workspace
RUN bun install --cwd /app

# Build apps
RUN bun run --cwd /app/apps/web build
RUN bun run --cwd /app/apps/server build

# Default workdir
WORKDIR /app