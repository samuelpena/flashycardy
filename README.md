# Flashycardy

A full-stack flashcard application for creating, managing, and studying flashcards. Organize cards into decks, study them with an interactive flip-card interface, and optionally generate cards automatically using AI.

## Features

- **Deck Management** — Create, edit, and delete flashcard decks with names and descriptions
- **Card Management** — Add, edit, and delete individual flashcards (front/back format)
- **Study Mode** — Interactive study interface with card flipping, navigation, shuffle, and keyboard shortcuts (Space/Enter to flip, Arrow keys to navigate)
- **AI Card Generation (Pro)** — Automatically generate 20 flashcards from a deck description using OpenAI's GPT-4.1 Nano via the Vercel AI SDK
- **Sorting** — Sort cards alphabetically (A-Z, Z-A) or by last updated date
- **Authentication** — User accounts powered by Clerk with modal-based sign-in/sign-up
- **Pricing Tiers** — Free plan (3 decks) and Pro plan (unlimited decks + AI generation), managed through Clerk Billing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Shadcn/UI, Tailwind CSS 4 |
| Database | PostgreSQL on Neon Serverless |
| ORM | Drizzle ORM |
| Auth | Clerk |
| AI | Vercel AI SDK + OpenAI (GPT-4.1 Nano) |

## Architecture

This repository is a **pnpm + Turborepo monorepo**. Each deployable surface lives under `apps/`; shared code lives under `packages/`.

```
flashycardy/
├── apps/
│   ├── web/          # @flashycardy/web — Next.js 16 app (primary product, Vercel)
│   ├── docs/         # @flashycardy/docs — Nextra 4 documentation site (separate Vercel project)
│   └── extension/    # @flashycardy/extension — Chrome MV3 side panel (WXT)
├── packages/         # @flashycardy/ui, i18n, api-client, features
├── package.json      # Workspace root (Turborepo entrypoints)
├── turbo.json        # Pipeline definitions
└── pnpm-workspace.yaml
```

### `apps/web` — Flashycardy app

```
apps/web/src/
├── actions/          # Server Actions for mutations (cards, decks)
├── app/              # Next.js App Router pages and layouts
│   ├── dashboard/    # User dashboard (deck list)
│   ├── decks/[deckUuid]/     # Deck detail and card management
│   │   └── study/            # Study mode interface
│   └── pricing/              # Pricing page (Clerk PricingTable)
├── components/       # React components
│   └── ui/           # Shadcn/UI primitives
├── db/
│   ├── schema/       # Drizzle schema by domain (decks, cards, study-sessions)
│   ├── index.ts      # Drizzle client (Neon serverless connection)
│   └── queries/      # Typed query helpers (decks.ts, cards.ts)
└── lib/              # Utility functions
```

### `apps/docs` — Documentation site

A lightweight, standalone Next.js app powered by [Nextra 4](https://nextra.site/) and `nextra-theme-docs`. It does **not** import from `apps/web`, has no database/auth/AI dependencies, and ships its own theme (no Tailwind, no shadcn). Content lives as MDX files.

```
apps/docs/
├── app/
│   ├── layout.tsx              # Nextra <Layout> with server-side getPageMap()
│   └── [[...mdxPath]]/page.tsx # Nextra catch-all route
├── content/                    # MDX pages (sidebar order via _meta.ts)
│   ├── _meta.ts
│   ├── index.mdx
│   ├── getting-started.mdx
│   └── architecture.mdx
├── mdx-components.tsx
├── next.config.mjs             # withNextra(...)
└── package.json
```

Dev port for docs is **3001**, so you can run web (3000) and docs (3001) side by side.

**Data flow (`apps/web`):**
- **Data fetching** happens in Server Components via query helpers in `apps/web/src/db/queries/`
- **Mutations** go through Server Actions in `apps/web/src/actions/` which delegate to query helpers
- **AI card generation** is a Server Action that calls OpenAI through the Vercel AI SDK, validates output with Zod, and bulk-inserts cards into the database
- **Auth** is enforced on every server-side operation via Clerk's `auth()` — all queries are scoped to the authenticated user

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) account with Billing enabled
- An [OpenAI](https://platform.openai.com) API key

### 1. Install dependencies

From the repository root (pnpm workspace):

```bash
pnpm install
```

### 2. Set up environment variables

Keep `.env`, `.env.development`, and `.env.production` in the **repository root**. Scripts under `apps/web` load them via paths like `../../.env`.

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-proj-...
```

### 3. Run database migrations

```bash
pnpm --filter @flashycardy/web db:generate:dev
pnpm --filter @flashycardy/web db:migrate:dev:programmatic
```

### 4. Start the development server

```bash
pnpm dev          # apps/web on http://localhost:3000
pnpm dev:docs     # apps/docs on http://localhost:3001
pnpm dev:all      # both, in parallel
```

## Vercel (monorepo)

Each app deploys as its **own Vercel project**, both pointing at the same Git repo.

### `apps/web` (primary)

- **Root Directory** → `apps/web`
- **Include files outside the root directory in the Build Step** → ON
- **Production Build Command** → `pnpm vercel-build` (migrates Drizzle, then `next build`)
- Environment variables (`DATABASE_URL`, Clerk, OpenAI) live on this project.

### `apps/docs` (documentation)

- **Root Directory** → `apps/docs`
- **Include files outside the root directory in the Build Step** → ON
- **Framework Preset** → Next.js (auto-detected)
- **Build Command** → default (`next build`); no migrations, no `vercel-build`
- **Environment variables** → none required
- **Domain** → ships on the auto-generated `*.vercel.app` URL; a custom `docs.<domain>` subdomain can be attached later.

### Ignored Build Step (cross-app)

Both apps ship a [`vercel.json`](apps/web/vercel.json) with [`ignoreCommand`](https://vercel.com/docs/project-configuration/git-settings#ignored-build-step) (see [`apps/docs/vercel.json`](apps/docs/vercel.json) for docs) that runs a repo script:

| Project | Script |
|---------|--------|
| Web | [`scripts/vercel-ignore-build-web.sh`](scripts/vercel-ignore-build-web.sh) |
| Docs | [`scripts/vercel-ignore-build-docs.sh`](scripts/vercel-ignore-build-docs.sh) |

Each script diffs `VERCEL_GIT_PREVIOUS_SHA` → `VERCEL_GIT_COMMIT_SHA` (set by Vercel) against a path allow-list for that app: its `apps/<app>` tree, `packages/`, root workspace files (`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`), and its own ignore script. **Exit 0 skips the build; exit 1 runs it.** If `VERCEL_GIT_PREVIOUS_SHA` is missing (first deployment on a branch/project), the script exits **1** so the build always runs.

If you previously set an **Ignored Build Step** in the Vercel dashboard for either project, remove it or align it with these scripts so two commands do not fight each other.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start `apps/web` via Turborepo (port 3000) |
| `pnpm dev:docs` | Start `apps/docs` via Turborepo (port 3001) |
| `pnpm dev:all` | Start both apps in parallel |
| `pnpm build` | Production build for `apps/web` |
| `pnpm build:docs` | Production build for `apps/docs` |
| `pnpm build:all` | Build all apps |
| `pnpm lint` | Run ESLint for `apps/web` |
| `pnpm lint:docs` | Run ESLint for `apps/docs` |
| `pnpm lint:all` | Run ESLint across all apps |
| `pnpm test:unit` | Run Vitest unit tests for `apps/web` |
| `pnpm test:e2e` | Run Playwright E2E tests for `apps/web` |
| `pnpm dev:extension` | Start WXT extension dev server |
| `pnpm build:extension` | Production build for `apps/extension` |
| `pnpm package:extension` | Zip extension to `dist/extension.zip` |
| `pnpm test:extension:unit` | Vitest for `apps/extension` |
| `pnpm test:extension:e2e` | Playwright extension smoke tests |
| `pnpm --filter @flashycardy/web start` | Start the web production server |
| `pnpm --filter @flashycardy/web db:generate:dev` | Generate dev Drizzle migrations |
| `pnpm --filter @flashycardy/web db:migrate:dev:programmatic` | Apply dev migrations programmatically |
