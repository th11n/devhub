# DevHub

DevHub is a modern, full-stack monorepo built with [Turborepo](https://turbo.build/) and [Bun](https://bun.sh/). The stack combines a Next.js web application, an Elysia API backend, a Sanity CMS, a custom Discord bot, and a background queue worker for processing heavy tasks.

## 🚀 Tech Stack

- **Monorepo / Tooling**: Turborepo, Bun, Biome, Husky, lint-staged
- **Web App (`apps/web`)**: Next.js 16, React 19, Tailwind CSS v4, shadcn/ui
- **API Server (`apps/server`)**: Elysia, TypeScript
- **CMS (`apps/cms`)**: Sanity Studio
- **Bot (`apps/bot`)**: Discord.js custom bot
- **Background Worker (`apps/queue-worker`)**: RabbitMQ consumer processing jobs with Puppeteer & Sharp
- **Database / ORM**: PostgreSQL, Drizzle ORM (`@devhub/db`)
- **Authentication**: Better-Auth (`@devhub/auth`)
- **Caching & Queues**: Redis (`@devhub/redis`), RabbitMQ (`@devhub/queue`)

## 📂 Project Structure

```text
devhub/
├── apps/
│   ├── bot/            # Discord bot application
│   ├── cms/            # Sanity Studio CMS
│   ├── queue-worker/   # Background job processor
│   ├── server/         # Backend API (Elysia)
│   └── web/            # Frontend application (Next.js)
│
├── packages/
│   ├── auth/           # Better-Auth configuration & logic
│   ├── config/         # Shared configuration (TypeScript, Biome, Tailwind)
│   ├── db/             # Database schema & Drizzle configuration
│   ├── env/            # Environment variable validation using Zod
│   ├── queue/          # RabbitMQ integration logic
│   ├── redis/          # Redis client and helpers
│   └── ui/             # Shared UI components (shadcn/ui)
```

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.3+ recommended)
- [Docker & Docker Compose](https://docs.docker.com/compose/) (for infrastructure)

### Installation

1. Clone the repository and install dependencies:

```bash
bun install
```

### Environment Configuration

Ensure you have your environment variables set up. Look for `.env.example` files in the respective applications and packages, or create your own `.env` files based on the project requirements.

### Infrastructure & Database Setup

The project includes a `docker-compose.yml` that provides PostgreSQL, Redis, and RabbitMQ. 

Start the infrastructure:

```bash
bun run dev:infra
```

*Note: Running `bun run dev:infra` starts the services defined in `docker-compose.yml`.*

Apply the database schema using Drizzle ORM:

```bash
bun run db:push
```

*(Optional) Seed or generate additional database logic:*
```bash
bun run db:generate
bun run db:migrate
```

### Running the Development Servers

Start all applications in development mode:

```bash
bun run dev
```

Alternatively, you can start individual applications:

```bash
bun run dev:web      # Start only the Next.js web application (Port: 3001)
bun run dev:server   # Start only the Elysia backend API (Port: 3000)
```

Other services run on default ports:
- CMS is available via `cd apps/cms && bun run dev` (Port: 3333)
- Services APIs: Redis (6379), RabbitMQ (5672/15672), PostgreSQL (5432)

## 🗄️ Database Management

We use Drizzle ORM for strong typed database queries. Some handy commands:

- `bun run db:studio` - Open Drizzle Studio UI to inspect and manage your database.
- `bun run db:push` - Sync your schema with the database directly.
- `bun run db:generate` - Generate migrations based on schema changes.
- `bun run db:migrate` - Apply pending migrations to the database.