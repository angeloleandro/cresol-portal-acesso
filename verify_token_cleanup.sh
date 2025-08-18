#\!/bin/bash

echo "🔍 VERIFICANDO TOKENS SUPABASE NO REPOSITÓRIO"
echo "=============================================="
echo

# Buscar por tokens JWT (começam com eyJ)
echo "📋 Buscando tokens JWT..."
JWT_FOUND=$(find . -name "*.md" -o -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.env*" 2>/dev/null | grep -v node_modules | grep -v .git | grep -v .next | xargs grep -l "eyJ" 2>/dev/null | grep -v .env.example | grep -v .env.local.example)

if [ -n "$JWT_FOUND" ]; then
  echo "❌ Tokens JWT encontrados nos arquivos:"
  echo "$JWT_FOUND"
  echo
else
  echo "✅ Nenhum token JWT encontrado"
  echo
fi

# Buscar por access tokens (começam com sbp_)
echo "📋 Buscando access tokens..."
SBP_FOUND=$(find . -name "*.md" -o -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.env*" 2>/dev/null | grep -v node_modules | grep -v .git | grep -v .next | xargs grep -l "sbp_" 2>/dev/null | grep -v .env.example | grep -v .env.local.example)

if [ -n "$SBP_FOUND" ]; then
  echo "❌ Access tokens encontrados nos arquivos:"
  echo "$SBP_FOUND" 
  echo
else
  echo "✅ Nenhum access token encontrado"
  echo
fi

# Verificar se .env está no .gitignore
echo "📋 Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
  echo "✅ .env está no .gitignore"
else
  echo "❌ .env NÃO está no .gitignore"
fi

if grep -q "^\.env\.local$" .gitignore; then
  echo "✅ .env.local está no .gitignore"
else
  echo "❌ .env.local NÃO está no .gitignore"
fi

echo
echo "🎯 RESUMO:"
if [ -z "$JWT_FOUND" ] && [ -z "$SBP_FOUND" ]; then
  echo "✅ Repositório limpo - nenhum token hardcoded encontrado"
else
  echo "❌ Tokens ainda presentes no repositório - AÇÃO NECESSÁRIA"
fi
