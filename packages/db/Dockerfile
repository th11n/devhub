FROM oven/bun:1.3.12-slim AS base

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

RUN bun install --frozen-lockfile

COPY packages/db/ ./packages/db/
COPY packages/env/ ./packages/env/

WORKDIR /app/packages/db

CMD ["bun", "run", "db:push"]
