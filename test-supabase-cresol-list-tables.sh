#!/usr/bin/env bash
set -euo pipefail

HOST="db.taodkzafqgoparihaljx.supabase.co"
DB="postgres"
USER="postgres"

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "ERRO: defina SUPABASE_DB_PASSWORD (senha do usuário postgres)" >&2
  exit 1
fi

echo "== Listando tabelas (schema público) =="
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$HOST" -U "$USER" -d "$DB" -c "\\dt public.*"
