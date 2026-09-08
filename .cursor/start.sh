#!/usr/bin/env bash
# Per-boot startup for the Óptica CR Cloud Agent environment.
#
# Starts PostgreSQL and ensures the role/database documented in .env.example exist
# (postgresql://optica:optica@localhost:5432/optica by default). Idempotent: it
# detects an already-running cluster, tolerates restarts, and verifies readiness.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Defaults mirror .env.example.
DB_USER="optica"
DB_PASSWORD="optica"
DB_NAME="optica"
DB_PORT="5432"

# Prefer DATABASE_URL from .env, falling back to .env.example, when parseable.
ENV_FILE=""
if [ -f .env ]; then ENV_FILE=".env"; elif [ -f .env.example ]; then ENV_FILE=".env.example"; fi
if [ -n "$ENV_FILE" ]; then
  DB_URL_LINE="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | tail -n1 | cut -d= -f2- || true)"
  if [[ "$DB_URL_LINE" =~ postgres(ql)?://([^:]+):([^@]+)@[^:/]+:([0-9]+)/([^?]+) ]]; then
    DB_USER="${BASH_REMATCH[2]}"
    DB_PASSWORD="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
  fi
fi

echo "[start] Target database: user=$DB_USER db=$DB_NAME port=$DB_PORT"

PG_VERSION="$(ls /etc/postgresql 2>/dev/null | sort -V | tail -n1 || true)"
if [ -z "$PG_VERSION" ]; then
  echo "[start] ERROR: PostgreSQL is not installed. Run ./.cursor/install.sh first." >&2
  exit 1
fi

if sudo pg_ctlcluster "$PG_VERSION" main status >/dev/null 2>&1; then
  echo "[start] PostgreSQL cluster $PG_VERSION/main already running."
else
  echo "[start] Starting PostgreSQL cluster $PG_VERSION/main..."
  sudo pg_ctlcluster "$PG_VERSION" main start
fi

echo "[start] Waiting for PostgreSQL to accept connections..."
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q -p "$DB_PORT"; then break; fi
  sleep 1
done
sudo -u postgres pg_isready -p "$DB_PORT"

if [ "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")" = "1" ]; then
  sudo -u postgres psql -q -c "ALTER ROLE \"$DB_USER\" LOGIN PASSWORD '$DB_PASSWORD';"
else
  echo "[start] Creating role $DB_USER..."
  sudo -u postgres psql -q -c "CREATE ROLE \"$DB_USER\" LOGIN PASSWORD '$DB_PASSWORD' CREATEDB;"
fi

if [ "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")" != "1" ]; then
  echo "[start] Creating database $DB_NAME..."
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

echo "[start] Verifying TCP connectivity with the documented DATABASE_URL..."
PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -c "SELECT current_database() AS database, current_user AS role;"

echo "[start] PostgreSQL ready."
