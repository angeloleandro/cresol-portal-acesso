# 🔐 ROTAÇÃO DE TOKENS CRÍTICA - MANUAL DE EXECUÇÃO

## ⚠️ **ATENÇÃO: TOKENS EXPOSTOS DETECTADOS**

Os seguintes tokens estão **expostos publicamente** no arquivo `.env.local` e **DEVEM** ser rotacionados imediatamente antes do deploy:

### 🚨 **TOKENS QUE PRECISAM SER ROTACIONADOS:**

#### 1. **GitHub Tokens**
- **Token Atual Exposto**: `ghp_[REDACTED_FOR_SECURITY]`
- **Ação**: Revogar + Criar novo token
- **Como fazer**:
  1. Acesse: https://github.com/settings/tokens
  2. **REVOGUE** o token atual `ghp_[REDACTED]`
  3. **CRIE** um novo Personal Access Token
  4. **SUBSTITUA** no `.env.local` em ambas as linhas:
     - `GITHUB_TOKEN=novo_token_aqui`
     - `GITHUB_PERSONAL_ACCESS_TOKEN=novo_token_aqui`

#### 2. **Figma API Key**
- **Token Atual Exposto**: `figd_[REDACTED_FOR_SECURITY]`
- **Ação**: Revogar + Criar nova API key
- **Como fazer**:
  1. Acesse: https://www.figma.com/developers/api#authentication
  2. **REVOGUE** a API key atual
  3. **CRIE** uma nova API key
  4. **SUBSTITUA** no `.env.local`:
     - `FIGMA_API_KEY=nova_key_aqui`

#### 3. **Supabase Access Tokens**
- **Token Atual Exposto**: `sbp_[REDACTED_FOR_SECURITY]`
- **Ação**: Revogar + Criar novos tokens
- **Como fazer**:
  1. Acesse: https://supabase.com/dashboard/project/taodkzafqgoparihaljx/settings/api
  2. **REVOGUE** o access token atual
  3. **CRIE** novos access tokens
  4. **SUBSTITUA** no `.env.local`:
     - `SUPABASE_ACCESS_TOKEN=novo_token_aqui`
     - `SUPABASE_ACCESS_TOKEN_CRESOL=novo_token_aqui`

### ✅ **TOKENS SEGUROS (NÃO PRECISAM ROTACIONAR):**

#### Supabase Keys Públicas (Por Design)
- `NEXT_PUBLIC_SUPABASE_URL` - URL pública, segura para exposição
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima, projetada para ser pública

#### Configurações de Desenvolvimento
- `CONTEXT7_API_KEY=your-context7-api-key-here` - Placeholder
- `MCP_FILESYSTEM_ALLOWED_DIRS` - Path local de desenvolvimento

## 🛡️ **PASSOS PARA ROTAÇÃO SEGURA:**

### **1. BACKUP DE SEGURANÇA**
```bash
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
```

### **2. ROTACIONAR TOKENS EM SEQUÊNCIA**

#### **GitHub (Fazer PRIMEIRO)**
1. **Revogar**: https://github.com/settings/tokens → Find token → Delete
2. **Criar novo**: https://github.com/settings/tokens → Generate new token
3. **Substituir** ambas as linhas no .env.local

#### **Figma (Fazer SEGUNDO)**
1. **Revogar**: Figma → Account → Personal access tokens → Revoke
2. **Criar novo**: Generate new token
3. **Substituir** no .env.local

#### **Supabase (Fazer TERCEIRO)**
1. **Revogar**: Dashboard → Project → Settings → API → Revoke tokens
2. **Criar novos**: Generate new access tokens
3. **Substituir** ambos no .env.local

### **3. VALIDAR APÓS ROTAÇÃO**
```bash
# Testar se o app ainda funciona
npm run dev

# Verificar se não há tokens expostos
grep -E "(ghp_|figd_|sbp_)" .env.local
```

## 🚫 **IMPORTANTE: NUNCA COMMITAR TOKENS**

### **Verificar se .env.local está no .gitignore:**
```bash
grep -q "\.env\.local" .gitignore && echo "✅ Protegido" || echo "❌ ADICIONAR ao .gitignore"
```

### **Limpar histórico Git se necessário:**
```bash
# SE tokens foram commitados acidentalmente:
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
```

## 📋 **CHECKLIST DE ROTAÇÃO**

- [ ] ✅ Backup do .env.local criado
- [ ] 🔄 GitHub token rotacionado e testado
- [ ] 🔄 Figma API key rotacionada e testada  
- [ ] 🔄 Supabase tokens rotacionados e testados
- [ ] 🧪 Aplicação funcionando após mudanças (`npm run dev`)
- [ ] 🚫 .env.local confirmado no .gitignore
- [ ] 🧹 Histórico Git limpo (se necessário)

## 🔒 **APÓS ROTAÇÃO COMPLETA**

### **1. Destruir o arquivo de backup:**
```bash
rm .env.local.backup.*
```

### **2. Verificar segurança:**
```bash
# Não deve retornar nenhum token real
grep -E "(ghp_REDACTED|figd_REDACTED|sbp_REDACTED)" .env.local
```

### **3. Deploy seguro:**
```bash
# Apenas após rotação completa
npm run build
```

---

## ❗ **URGÊNCIA: EXECUTE IMEDIATAMENTE**

**Estes tokens estão comprometidos e devem ser rotacionados ANTES de qualquer deploy em produção.**

**Tempo estimado total: 15-20 minutos**

**❌ NÃO fazer deploy sem rotacionar os tokens!**