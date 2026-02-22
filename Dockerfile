# -------- BASE --------
FROM oven/bun:1.3.9

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

# ---- Build-time args (Next build needs these) ----
ARG NEXT_PUBLIC_SERVER_URL
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG CORS_ORIGIN
ARG REDIS_URL

# Optionally add more NEXT_PUBLIC_* here as you discover them:
# ARG NEXT_PUBLIC_APP_URL
# ARG NEXT_PUBLIC_SENTRY_DSN

# Make build-time args available as env during build (and runtime too)
ENV \
  NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  HUSKY=0 \
  NODE_ENV=production \
  DATABASE_URL=$DATABASE_URL \
  BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
  BETTER_AUTH_URL=$BETTER_AUTH_URL \
  CORS_ORIGIN=$CORS_ORIGIN \
  REDIS_URL=$REDIS_URL

WORKDIR /app

# Copy full monorepo
COPY --chown=bun:bun . .

# Install from ROOT workspace
RUN bun install --cwd /app

# Build apps (now env is available during build)
RUN bun run --cwd /app/apps/web build
RUN bun run --cwd /app/apps/server build

WORKDIR /app