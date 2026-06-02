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
