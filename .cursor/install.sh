#!/usr/bin/env bash
# Idempotent Cloud Agent install for the Óptica CR project.
#
# Phase 0 is docs-only (no package.json / Prisma / src yet). This script provisions
# the documented stack — Node.js LTS (already in the base image) + PostgreSQL — and
# automatically starts installing JS dependencies once the app scaffold lands in
# Phase 1. It must remain idempotent: it can run repeatedly and against cached state.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "[install] Node:  $(node --version)"
echo "[install] pnpm:  $(pnpm --version 2>/dev/null || echo 'n/a')"

echo "[install] Ensuring PostgreSQL is installed..."
if ! command -v psql >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    postgresql postgresql-contrib
fi
echo "[install] PostgreSQL: $(psql --version)"

# Future-proof: install JS dependencies automatically when the app scaffold exists.
if [ -f package.json ]; then
  if [ -f pnpm-lock.yaml ]; then
    echo "[install] Installing dependencies with pnpm (frozen lockfile)..."
    corepack enable >/dev/null 2>&1 || true
    pnpm install --frozen-lockfile
  elif [ -f package-lock.json ]; then
    echo "[install] Installing dependencies with npm ci..."
    npm ci
  else
    echo "[install] package.json found without a lockfile; running npm install..."
    npm install
  fi

  if [ -f prisma/schema.prisma ]; then
    echo "[install] Generating Prisma client..."
    npx prisma generate
  fi
else
  echo "[install] No package.json yet (Phase 0 docs-only). Skipping JS dependency install."
fi

echo "[install] Done."
