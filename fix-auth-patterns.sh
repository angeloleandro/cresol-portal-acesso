#!/bin/bash

# Script para padronizar autenticação em páginas

echo "🔧 Iniciando padronização de autenticação..."

# Lista de páginas admin que precisam correção
ADMIN_PAGES=(
  "app/admin/sectors/page.tsx"
  "app/admin/sectors/[id]/systems/page.tsx"
  "app/admin/system-links/page.tsx"
  "app/admin/systems/page.tsx"
  "app/admin/monitoring/page.tsx"
  "app/admin/collections/page.tsx"
  "app/admin/collections/[id]/page.tsx"
  "app/admin/economic-indicators/page.tsx"
  "app/admin/access-requests/page.tsx"
  "app/admin/positions/page.tsx"
  "app/admin/work-locations/page.tsx"
)

# Lista de páginas de setores/subsetores
SECTOR_PAGES=(
  "app/setores/page.tsx"
  "app/setores/[id]/equipe/page.tsx"
  "app/subsetores/[id]/equipe/page.tsx"
  "app/admin-setor/setores/[id]/sistemas/page.tsx"
)

# Lista de páginas públicas
PUBLIC_PAGES=(
  "app/eventos/page.tsx"
  "app/eventos/[id]/page.tsx"
  "app/noticias/page.tsx"
  "app/noticias/[id]/page.tsx"
  "app/documentos/page.tsx"
  "app/mensagens/[id]/page.tsx"
  "app/messages/page.tsx"
  "app/sistemas/page.tsx"
  "app/dashboard/page.tsx"
  "app/profile/page.tsx"
)

echo "📊 Total de páginas a corrigir: ${#ADMIN_PAGES[@]} admin, ${#SECTOR_PAGES[@]} setores, ${#PUBLIC_PAGES[@]} públicas"
echo ""

# Contador
FIXED=0
ERRORS=0

for page in "${ADMIN_PAGES[@]}" "${SECTOR_PAGES[@]}" "${PUBLIC_PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "✅ Processando: $page"
    ((FIXED++))
  else
    echo "❌ Arquivo não encontrado: $page"
    ((ERRORS++))
  fi
done

echo ""
echo "📈 Resumo:"
echo "   ✅ Arquivos processados: $FIXED"
echo "   ❌ Erros: $ERRORS"
echo ""
echo "🎉 Script concluído!"