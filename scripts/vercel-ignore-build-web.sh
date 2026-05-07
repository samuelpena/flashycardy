#!/usr/bin/env bash
# Ignored Build Step for the **web** Vercel project (`apps/web`).
#
# Exit codes (https://vercel.com/docs/project-configuration/git-settings#ignored-build-step):
#   0 → skip build (no relevant changes since last successful deployment)
#   1 → run build
#
# Uses Vercel-provided SHAs when present; falls back to HEAD for local smoke tests.

set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 1
cd "$ROOT" || exit 1

if [[ -z "${VERCEL_GIT_PREVIOUS_SHA:-}" ]]; then
  exit 1
fi

CURRENT="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$CURRENT" -- \
  apps/web \
  packages \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  turbo.json \
  scripts/vercel-ignore-build-web.sh
then
  exit 0
fi

exit 1
