#!/usr/bin/env bash
# Vercel build: aplica migrations Drizzle em Production, depois faz o Next build.
#
# Como funciona:
# 1. No deploy, a Vercel injeta as env vars do ambiente correspondente
#    (Production / Preview) — inclusive DATABASE_URL.
# 2. Em Production, rodamos `db:migrate` contra o Neon de prod (só SQL
#    pendente em src/db/migrations/). Idempotente: migrations já aplicadas
#    são ignoradas.
# 3. Em Preview, pulamos o migrate para não aplicar SQL experimental de
#    branches de feature no banco compartilhado de dev/prod.
# 4. Em seguida: next build (obrigatório — o buildCommand substitui o default).
#
# Pré-requisito: em Vercel → Project → Settings → Environment Variables,
# DATABASE_URL de Production = connection string do Neon de produção.
set -euo pipefail

echo "[vercel-build] VERCEL_ENV=${VERCEL_ENV:-unset}"

if [ "${VERCEL_ENV:-}" = "production" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "[vercel-build] ERROR: DATABASE_URL is not set for Production."
    echo "  Add it in Vercel → Project → Settings → Environment Variables"
    echo "  (Environment: Production) with your Neon prod connection string."
    exit 1
  fi
  echo "[vercel-build] Applying pending Drizzle migrations..."
  # drizzle-kit may hide the real Postgres error behind a spinner; force plain logs.
  if ! npm run db:migrate; then
    echo "[vercel-build] ERROR: db:migrate failed. Check SQL in src/db/migrations/"
    echo "  Common cause: ALTER TYPE ... ADD VALUE + use of the new label in the same migration/transaction."
    exit 1
  fi
  echo "[vercel-build] Migrations OK."
else
  echo "[vercel-build] Skipping db:migrate (only runs when VERCEL_ENV=production)."
fi

echo "[vercel-build] Starting next build..."
npx next build
