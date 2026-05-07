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
│   ├── schema.ts     # Drizzle schema (decks, cards tables)
│   ├── index.ts      # Drizzle client (Neon serverless connection)
│   └── queries/      # Typed query helpers (decks.ts, cards.ts)
└── lib/              # Utility functions
```

**Data flow:**
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
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel (monorepo)

Set the Vercel project **Root Directory** to `apps/web`, turn on **Include files outside the root directory in the Build Step**, and keep the production **Build Command** using `vercel-build` from `apps/web` (migrations + `next build`). Environment variables remain on the Vercel project unchanged.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start `apps/web` via Turborepo |
| `pnpm build` | Production build for `apps/web` |
| `pnpm --filter @flashycardy/web start` | Start production server |
| `pnpm lint` | Run ESLint for `apps/web` |
| `pnpm --filter @flashycardy/web db:generate:dev` | Generate dev Drizzle migrations |
| `pnpm --filter @flashycardy/web db:migrate:dev:programmatic` | Apply dev migrations programmatically |
