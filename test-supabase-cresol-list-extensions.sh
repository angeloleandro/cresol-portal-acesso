#!/usr/bin/env bash
set -euo pipefail

HOST="db.taodkzafqgoparihaljx.supabase.co"
DB="postgres"
USER="postgres"

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "ERRO: defina SUPABASE_DB_PASSWORD" >&2
  exit 1
fi

echo "== Extensões instaladas =="
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$HOST" -U "$USER" -d "$DB" -c "SELECT name, default_version, installed_version FROM pg_available_extensions WHERE installed_version IS NOT NULL ORDER BY name;"
