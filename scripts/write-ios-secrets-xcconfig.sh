#!/usr/bin/env bash
# Writes apps/ios/Config/Secrets.xcconfig for CI (GitHub Actions).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/apps/ios/Config/Secrets.xcconfig"

CLERK_KEY="${CLERK_PUBLISHABLE_KEY:-pk_test_ci_build_only}"
FRONTEND_RAW="${CLERK_FRONTEND_API:-https://placeholder.clerk.accounts.dev}"
FRONTEND_HOST="$(echo "$FRONTEND_RAW" | sed -E 's#https?://##' | sed 's#/.*##')"

mkdir -p "$(dirname "$OUT")"
cat > "$OUT" <<EOF
CLERK_PUBLISHABLE_KEY = $CLERK_KEY
API_BASE_URL = http:/\$()/127.0.0.1:3000
CLERK_FRONTEND_API_HOST = $FRONTEND_HOST
EOF

echo "Wrote $OUT"
