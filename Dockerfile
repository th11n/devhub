FROM oven/bun:latest AS base

# Install chromium for puppeteer
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    libxss1 \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY . .

RUN bun install

WORKDIR /app/apps/web
RUN bun run build

WORKDIR /app/apps/server
RUN bun run build

WORKDIR /app