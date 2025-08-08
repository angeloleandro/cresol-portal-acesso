#!/usr/bin/env bash
set -euo pipefail

HOST="db.taodkzafqgoparihaljx.supabase.co"
DB="postgres"
USER="postgres"

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "ERRO: defina SUPABASE_DB_PASSWORD" >&2
  exit 1
fi

SQL=${1:-"select 1 as ok;"}
echo "== Executando SQL =="
echo "$SQL"
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$HOST" -U "$USER" -d "$DB" -c "$SQL"
