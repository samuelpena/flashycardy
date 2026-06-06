# FlashyCardy iOS

Native SwiftUI app for FlashyCardy. Uses the same Clerk instance and REST API as [`apps/web`](../web) and [`apps/extension`](../extension).

## Requirements

- Xcode 16+
- iOS 17+ simulator or device
- [`apps/web`](../web) running locally for API calls (from PR-2 onward)
- Clerk Dashboard: **Native API** enabled, Associated Domains configured (see below)

## Setup

1. Open the project:

   ```bash
   pnpm dev:ios
   # or: open apps/ios/Flashycardy/Flashycardy.xcodeproj
   ```

2. Copy secrets (same Clerk publishable key as the monorepo root `.env`):

   ```bash
   cp apps/ios/Config/Secrets.xcconfig.example apps/ios/Config/Secrets.xcconfig
   ```

   Edit `apps/ios/Config/Secrets.xcconfig`:

   | Key | Source |
   |-----|--------|
   | `CLERK_PUBLISHABLE_KEY` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in root `.env` |
   | `API_BASE_URL` | `http://127.0.0.1:3000` for Simulator (use `http://$(ip):3000` on a physical device) |
   | `CLERK_FRONTEND_API_HOST` | Clerk Dashboard → API keys → Frontend API URL host (e.g. `happy-heron-12.clerk.accounts.dev`) |

3. **Clerk Dashboard** ([Native applications](https://dashboard.clerk.com/~/native-applications)):

   - Turn **Native API** on (same instance as web).
   - Note your **Frontend API** hostname for Associated Domains.

4. **Xcode → Signing & Capabilities**:

   - Associated Domains is set via `Flashycardy.entitlements` using `CLERK_FRONTEND_API_HOST` from xcconfig.
   - Ensure your team can sign the app with the Associated Domains capability.

5. Run the **Flashycardy** scheme on a simulator (use **Run** ⌘R, not only the SwiftUI canvas preview).

Config values from `Secrets.xcconfig` are injected into the app via `Info.plist` preprocessing (`INFOPLIST_PREPROCESS = YES`). If the app still crashes at launch, clean the build folder and confirm the built app’s `Info.plist` contains `ClerkPublishableKey`.

### Command-line build

```bash
cd apps/ios/Flashycardy
xcodebuild -scheme Flashycardy -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17' build
```

Use a simulator name from `xcodebuild -scheme Flashycardy -showdestinations`.

## Auth (PR-1)

- Signed out: landing with **Sign in** / **Sign up** → Clerk `AuthView` sheet.
- Signed in: placeholder dashboard + `UserButton` (profile, **Sign out**).
- OAuth uses URL scheme `local.Flashycardy://callback` (see `Info.plist`).

## Project layout

```
apps/ios/
├── Config/                 # xcconfig (Secrets.xcconfig is gitignored)
├── Flashycardy/
│   ├── Flashycardy.xcodeproj
│   ├── Flashycardy/
│   │   ├── App/            # Entry + routing
│   │   ├── Config/         # AppConfig
│   │   ├── Models/         # Codable API types
│   │   ├── Services/       # APIClient, Decks/Cards/StudySessions services
│   │   └── Features/       # Auth, Home, …
│   └── FlashycardyTests/   # XCTest (envelope + pagination)
└── README.md
```

## REST API client (PR-2)

Mirrors [`packages/api-client`](../../packages/api-client):

- `APIClient` — Bearer auth, `{ data }` / paginated envelopes, `ApiError`
- `DecksService`, `CardsService`, `StudySessionsService`
- `FlashycardyAPI` — factory combining all services
- `APIProvider` — SwiftUI environment (`@InjectAPI`) with Clerk `getToken()`

Signed-in views are wrapped in `APIProvider` from `RootView`.

## Dashboard (PR-3)

After sign-in, the app shows **Your Decks**:

- Paginated grid (9 decks per page), sort by last updated / A–Z / Z–A
- Pull to refresh
- Deck limit banner when you have 3+ decks (free tier)
- **New Deck** sheet: manual name/description, or **From document** (Pro); 403 opens `/pricing` in Safari
- Long-press a deck for **Edit** / **Delete**
- Tap a deck to open **deck detail** (cards, study navigation — see PR-4)

Requires `pnpm dev:web` running at `API_BASE_URL` for live data.

## Deck detail (PR-4)

Tap a deck on the dashboard to open **DeckDetailView**:

- Loads all cards (paginated API fetch) and per-card study ratings
- Sort cards by last updated / A–Z / Z→A; display pagination (9 cards per page)
- **Add Card**, **Edit**, and **Delete** for each card
- **Edit deck** / **Delete deck** from the action bar (delete pops back to dashboard)
- **Study** opens full study mode (see PR-5)
- Pull to refresh

AI card generation and document upload remain **PR-6**.

## Study + Analytics (PR-5)

### Study (`StudyView`)

From deck detail, tap **Study**:

- Flip cards (tap), prev/next navigation
- Rate with thumbs up / thumbs down after revealing the back
- Shuffle and restart mid-session
- Completion summary: correct/incorrect counts, score %, skipped notice
- Auto-saves via `POST /api/study-sessions` when the session completes

### Analytics (`AnalyticsView`)

Second tab in the signed-in shell:

- Lists all study sessions (paginated API fetch)
- Score badges: green ≥80%, neutral ≥50%, red below 50%
- Tap a row to open that deck’s detail
- Pull to refresh; empty state when no sessions yet

## Pro features, settings, and i18n (PR-6)

### Pro features

- **Create deck from document** (Pro): **New Deck** sheet → **From document** tab → pick PDF/DOCX/PPTX (≤10 MB) → `POST /api/decks/from-document`. On 403, opens `/pricing` in Safari.
- **Generate with AI** (Pro): deck detail action bar → `POST /api/decks/:uuid/generate-cards`. Disabled until the deck has a description. On 403, opens `/pricing` in Safari.

### Settings

Third tab **Settings** → language picker (English / Spanish). Saves to Clerk `unsafeMetadata.language` when signed in (same as web). UI strings reload immediately via `LocaleManager`.

### String catalog

UI copy lives in `Flashycardy/Resources/Localizable.xcstrings` (synced from `packages/i18n/messages/en.json` and `es.json`). When web i18n keys change, regenerate the catalog in the same PR.

### Unit tests

```bash
cd apps/ios/Flashycardy
xcodebuild -scheme Flashycardy -destination 'platform=iOS Simulator,name=iPhone 17' test
```

Or **Product → Test** (⌘U) in Xcode.

## Related docs

- REST API: [`apps/docs/content/reference/rest-api.mdx`](../docs/content/reference/rest-api.mdx)
- Chrome extension setup (similar Clerk + Bearer pattern): [`apps/extension/README.md`](../extension/README.md)
- iOS plan: [`.cursor/plans/ios_swiftui_app_c59e56a6.plan.md`](../../.cursor/plans/ios_swiftui_app_c59e56a6.plan.md)
