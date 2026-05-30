#!/usr/bin/env bash
# Package the WXT production build as dist/extension.zip (Chrome Web Store / CI artifact).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/extension/.output/chrome-mv3"
OUT="$ROOT/dist/extension.zip"

if [[ ! -d "$SRC" ]]; then
  echo "Extension build not found at $SRC — run pnpm build:extension first" >&2
  exit 1
fi

mkdir -p "$ROOT/dist"
rm -f "$OUT"
(cd "$SRC" && zip -qr "$OUT" .)
echo "Wrote $OUT"
