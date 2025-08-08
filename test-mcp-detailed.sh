#!/usr/bin/env bash
set -euo pipefail

echo "== Teste detalhado do servidor MCP Supabase =="
if [[ -z "${SUPABASE_ACCESS_TOKEN_CRESOL:-}" ]]; then
  echo "ERRO: defina SUPABASE_ACCESS_TOKEN_CRESOL" >&2
  exit 1
fi

PROJECT_REF="taodkzafqgoparihaljx"
echo "Iniciando servidor MCP (project=$PROJECT_REF) e listando ferramentas..."

FORMATTER="cat"
command -v jq >/dev/null && FORMATTER="jq ."

RUN_CMD=(npx -y @supabase/mcp-server-supabase@latest --project-ref=$PROJECT_REF --access-token=$SUPABASE_ACCESS_TOKEN_CRESOL)

INIT='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"clientInfo":{"name":"shell-tester","version":"0.1.0"},"capabilities":{}}}'
LIST='{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

{
  printf 'Content-Length: %s\r\n\r\n%s' "${#INIT}" "$INIT"
  printf 'Content-Length: %s\r\n\r\n%s' "${#LIST}" "$LIST"
  sleep 3
} | "${RUN_CMD[@]}" 2>/dev/null | awk 'BEGIN{RS=""} {print $0}' | while read -r block; do
  json=$(printf '%s' "$block" | sed -n '/^{/,$p') || true
  [[ -n "$json" ]] && echo "$json" | $FORMATTER || true
done

echo "Concluído. Use node test-mcp.js para um teste mais interativo."
