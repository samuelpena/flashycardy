# FlashyCardy Chrome Extension

MV3 side-panel extension built with [WXT](https://wxt.dev/), React 19, Tailwind 4, and `@clerk/chrome-extension`.

## Setup

1. Copy environment template:

   ```bash
   cp apps/extension/.env.development.example apps/extension/.env.development
   ```

2. Fill `VITE_*` values from the Clerk Dashboard (**Chrome Extension** quick copy) and your local web origin:

   | Variable | Example |
   |----------|---------|
   | `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` (same instance as `apps/web`) |
   | `VITE_CLERK_FRONTEND_API` | `https://<instance>.clerk.accounts.dev` |
   | `VITE_SYNC_HOST` | `http://localhost:3000` |
   | `VITE_API_BASE_URL` | `http://localhost:3000` |

3. Register the unpacked extension ID in Clerk `allowed_origins` (see [chrome_extension_parity_ACTIONABLE.plan.md](../../.cursor/plans/chrome_extension_parity_ACTIONABLE.plan.md)).

## Develop

From the repo root:

```bash
pnpm dev:extension
```

Load unpacked extension from `apps/extension/.output/chrome-mv3-dev` in `chrome://extensions`.

## Build

```bash
pnpm build:extension
```

Production output: `apps/extension/.output/chrome-mv3`.

## Routes (HashRouter)

| Path | Purpose |
|------|---------|
| `/` | Auth gate |
| `/dashboard` | Stub (PR-6) |
| `/decks/:deckUuid` | Stub |
| `/decks/:deckUuid/study` | Stub |
| `/analytics` | Stub |
| `/settings` | Stub + sign out |

Auth completes at `auth-callback.html`, then redirects to the side panel.
