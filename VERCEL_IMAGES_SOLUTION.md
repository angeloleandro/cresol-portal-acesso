# 🔧 Guia de Solução de Problemas de Imagem na Vercel

## 🚨 Problema Identificado
As imagens do Supabase Storage não aparecem na Vercel, mas funcionam localmente.

## 📋 Checklist de Diagnóstico

### 1. **Verificar Environment Variables na Vercel**
```bash
# Acesse: https://vercel.com/dashboard/[seu-projeto]/settings/environment-variables
NEXT_PUBLIC_SUPABASE_URL=https://taodkzafqgoparihaljx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[...]
```

### 2. **Testar Configuração**
```bash
# Acesse as páginas de teste:
https://[seu-app].vercel.app/debug/vercel-test
https://[seu-app].vercel.app/api/debug/test-supabase-storage
```

### 3. **Verificar next.config.js**
O arquivo já está configurado corretamente com:
- ✅ `remotePatterns` para `*.supabase.co`
- ✅ Cache TTL de 31 dias (recomendação Vercel)
- ✅ Formatos WebP automáticos

### 4. **Corrigir URLs no Banco de Dados**
```bash
# Via API:
curl -X POST https://[seu-app].vercel.app/api/debug/fix-vercel-images

# Ou acesse: /debug/vercel-test e clique em "Corrigir URLs"
```

## 🔧 Soluções Baseadas na Documentação da Vercel

### **Problema: Imagens não carregam na Vercel**

#### **Causa 1: Environment Variables não configuradas**
```bash
# Solução: Configure na Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://taodkzafqgoparihaljx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

#### **Causa 2: URLs não estão no formato HTTPS completo**
```bash
# ❌ Formato incorreto:
/storage/v1/object/public/images/foto.jpg
images/foto.jpg

# ✅ Formato correto:
https://taodkzafqgoparihaljx.supabase.co/storage/v1/object/public/images/foto.jpg
```

#### **Causa 3: Domínio não permitido em remotePatterns**
O `next.config.js` já está configurado corretamente, mas verifique se não foi alterado:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ]
  }
}
```

#### **Causa 4: Políticas RLS do Supabase Storage**
Execute no SQL Editor do Supabase:

```sql
-- Verificar se bucket é público
SELECT name, public FROM storage.buckets WHERE name = 'images';

-- Tornar bucket público se necessário
UPDATE storage.buckets SET public = true WHERE name = 'images';

-- Verificar políticas
SELECT * FROM storage.policies WHERE bucket_id = 'images';

-- Criar política pública se não existir
INSERT INTO storage.policies (
  id, bucket_id, name, operation, definition
) VALUES (
  gen_random_uuid(),
  'images', 
  'Public read access',
  'SELECT',
  'true'
) ON CONFLICT DO NOTHING;
```

## 🚀 Passos de Implementação

### **Passo 1: Deploy na Vercel**
```bash
git add .
git commit -m "fix: configuração de imagens para Vercel"
git push origin main
```

### **Passo 2: Verificar Environment Variables**
1. Acesse Vercel Dashboard
2. Vá em Settings > Environment Variables
3. Confirme que as variáveis estão configuradas para Production, Preview e Development

### **Passo 3: Testar na Vercel**
```bash
# Acesse a página de teste:
https://[seu-app].vercel.app/debug/vercel-test

# Verifique se:
# ✅ Environment: production
# ✅ Vercel: Sim
# ✅ Supabase URL: Configurada
# ✅ Anon Key: Configurada
```

### **Passo 4: Corrigir URLs se necessário**
```bash
# Via browser:
https://[seu-app].vercel.app/debug/vercel-test
# Clique em "Testar Conexão Supabase"

# Via API:
curl -X POST https://[seu-app].vercel.app/api/debug/fix-vercel-images
```

## 🐛 Troubleshooting Específico da Vercel

### **Erro: Invalid src prop**
```bash
# Causa: URL malformada ou domínio não permitido
# Solução: Verificar remotePatterns e format da URL
```

### **Erro: 400 Bad Request na otimização**
```bash
# Causa: URL não está em HTTPS ou domínio não permitido
# Solução: Garantir URLs completas com HTTPS
```

### **Erro: Images não carregam mas não há erro no console**
```bash
# Causa: Políticas RLS bloqueando acesso público
# Solução: Executar SQL para tornar bucket público
```

### **Performance: Imagens carregam lentamente**
```bash
# Causa: Cache TTL muito baixo
# Solução: Verificar minimumCacheTTL no next.config.js (já configurado)
```

## 📊 Monitoramento

### **Métricas da Vercel**
1. Acesse Vercel Dashboard > Analytics
2. Verifique "Function Invocations" para /_next/image
3. Monitore erros 4xx/5xx relacionados a imagens

### **Logs de Debug**
```bash
# Ver logs em tempo real:
vercel logs --follow

# Filtrar apenas erros de imagem:
vercel logs | grep "image\|Image"
```

## 🎯 Conclusão

Este guia resolve os problemas mais comuns de imagem na Vercel:

1. ✅ **Environment Variables** configuradas
2. ✅ **next.config.js** otimizado para Vercel
3. ✅ **URLs no formato correto** (HTTPS completo)
4. ✅ **Políticas RLS** permitem acesso público
5. ✅ **Ferramentas de debug** para monitoramento
6. ✅ **APIs de correção** automática de URLs

**Próximo passo**: Deploy e teste na URL da Vercel usando `/debug/vercel-test`
