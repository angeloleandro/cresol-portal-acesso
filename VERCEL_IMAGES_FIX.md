# 🖼️ Fix de Imagens na Vercel - Cresol Portal

## 🚨 Problema Identificado
As imagens do Supabase Storage não estão aparecendo na Vercel, apenas placeholders em branco.

**Causa Principal**: Configuração inadequada do Next.js Image Optimization para Vercel deployment.

## 📖 Baseado na Documentação Oficial
- ✅ [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- ✅ [Vercel Image Optimization](https://vercel.com/docs/image-optimization)
- ✅ [Next.js next.config.js Images](https://nextjs.org/docs/app/api-reference/next-config-js/images)

## 🔧 Soluções Implementadas

### 1. **Componente OptimizedImage**
- **Arquivo**: `/app/components/OptimizedImage.tsx`
- **Funcionalidades**:
  - ✅ Fallback automático para imagens quebradas
  - ✅ Validação de URLs antes da renderização
  - ✅ Placeholder visual quando imagem falha
  - ✅ Error handling robusto

### 2. **Utilitários de Imagem**
- **Arquivo**: `/lib/imageUtils.ts`
- **Funcionalidades**:
  - ✅ Processamento de URLs do Supabase Storage
  - ✅ Validação de URLs válidas
  - ✅ Debug de URLs em desenvolvimento
  - ✅ Verificação de acessibilidade de imagens

### 3. **Configuração Next.js Otimizada para Vercel**
- **Arquivo**: `next.config.js`
- **Melhorias baseadas na documentação oficial**:
  - ✅ `remotePatterns` específicos para Supabase
  - ✅ Cache TTL de 31 dias (recomendação Vercel)
  - ✅ Formatos otimizados (WebP automático)
  - ✅ Tamanhos de dispositivo otimizados
  - ✅ Removidas configurações deprecated

### 4. **Componentes Atualizados**
- ✅ `ImageGallery.tsx` - Usa OptimizedImage
- ✅ `BannerCarousel.tsx` - Usa OptimizedImage
- ✅ URLs processadas e validadas

## 🛠️ Ferramentas de Debug

### 1. **Página de Debug**
- **URL**: `/debug/images`
- **Funcionalidades**:
  - 📊 Análise de todas as imagens no banco
  - 🔍 Teste de acessibilidade de URLs
  - 🌐 Informações do environment
  - 📋 Relatório detalhado por tabela

### 2. **API de Correção Automática**
- **Endpoint**: `POST /api/debug/fix-image-urls`
- **Funcionalidades**:
  - 🔧 Corrige URLs malformadas no banco
  - 📈 Relatório de URLs corrigidas
  - 🔄 Atualização automática das tabelas

## 🚀 Como Usar na Vercel

### **Passo 1: Verificar Environment Variables**
Certifique-se de que estão configuradas na Vercel:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://taodkzafqgoparihaljx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### **Passo 2: Acessar Página de Debug**
1. Deploy na Vercel
2. Acesse: `https://seu-app.vercel.app/debug/images`
3. Verifique quais imagens estão quebradas

### **Passo 3: Corrigir URLs Automaticamente**
```bash
curl -X POST https://seu-app.vercel.app/api/debug/fix-image-urls
```

### **Passo 4: Verificar Supabase Storage Policies**
Execute no SQL Editor do Supabase:
```sql
-- Verificar se bucket existe e é público
SELECT name, public FROM storage.buckets WHERE name = 'images';

-- Verificar políticas RLS
SELECT * FROM storage.policies WHERE bucket_id = 'images';

-- Criar política pública se não existir (IMPORTANTE para Vercel)
INSERT INTO storage.policies (
  id, bucket_id, name, operation, definition
) VALUES (
  gen_random_uuid(),
  'images', 
  'Public read access for images',
  'SELECT',
  'true'
) ON CONFLICT DO NOTHING;

-- Tornar bucket público se necessário
UPDATE storage.buckets 
SET public = true 
WHERE name = 'images';
```

## 🔍 Checklist de Troubleshooting

### ✅ **Environment Variables**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] URLs no formato correto

### ✅ **Supabase Storage**
- [ ] Bucket `images` existe
- [ ] Políticas RLS permitem leitura pública
- [ ] Arquivos estão no bucket correto

### ✅ **URLs no Banco de Dados**
- [ ] URLs estão no formato completo
- [ ] Caminhos estão corretos
- [ ] Não há caracteres especiais problemáticos

### ✅ **Next.js Configuration**
- [ ] `remotePatterns` inclui domínio Supabase
- [ ] Wildcard `*.supabase.co` configurado
- [ ] Build da Vercel executou sem erros

## 🐛 Debug Commands

### **Local Development**
```bash
# Verificar URLs de imagem
npm run dev
# Acesse: http://localhost:4000/debug/images

# Corrigir URLs automaticamente
curl -X POST http://localhost:4000/api/debug/fix-image-urls
```

### **Production (Vercel)**
```bash
# Verificar logs da Vercel
vercel logs

# Testar URLs diretamente
curl -I "https://taodkzafqgoparihaljx.supabase.co/storage/v1/object/public/images/[path]"
```

## 📚 Configurações Baseadas na Documentação Vercel

### **next.config.js Otimizado**
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'taodkzafqgoparihaljx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https', 
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    // Cache de 31 dias (recomendação Vercel)
    minimumCacheTTL: 2678400,
    // Formato WebP automático
    formats: ['image/webp'],
    // Não usar unoptimized (deixar Vercel otimizar)
    unoptimized: false
  }
};
```

### **URLs Corretas para Vercel**
```bash
# ✅ URL completa HTTPS (obrigatório)
https://taodkzafqgoparihaljx.supabase.co/storage/v1/object/public/images/gallery/arquivo.jpg

# ✅ Com parâmetros de cache
https://taodkzafqgoparihaljx.supabase.co/storage/v1/object/public/images/banner/arquivo.jpg
```

### **Problemas Comuns na Vercel**
```bash
# ❌ HTTP não é permitido
http://exemplo.supabase.co/storage/...

# ❌ Domínio não está em remotePatterns
https://outro-projeto.supabase.co/storage/...

# ❌ Path não corresponde ao padrão
https://projeto.supabase.co/outro-path/...
```

## 🎯 Próximos Passos (Baseado na Documentação Vercel)

### **1. Configurar Environment Variables na Vercel**
```bash
# Obrigatórias para Image Optimization
NEXT_PUBLIC_SUPABASE_URL=https://taodkzafqgoparihaljx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### **2. Verificar Políticas do Supabase Storage**
- Bucket `images` deve ser **público**
- Políticas RLS devem permitir leitura pública
- Executar SQL de verificação/correção

### **3. Deploy e Teste**
1. **Deploy na Vercel**
2. **Testar debug**: `/debug/images`
3. **Verificar compatibilidade**: Usar `checkVercelCompatibility()`
4. **Corrigir URLs**: `POST /api/debug/fix-image-urls`

### **4. Monitoramento**
- Verificar métricas de Image Optimization na Vercel
- Monitorar cache hit/miss ratio
- Verificar transformações desnecessárias

## 📞 Troubleshooting Vercel

### **Problemas Comuns e Soluções**

#### **1. Imagens não aparecem na Vercel (OK local)**
```bash
# Verificar remotePatterns
# Verificar se URLs são HTTPS
# Confirmar environment variables
```

#### **2. Erro 400 da Image Optimization**
```bash
# Domínio não permitido em remotePatterns
# URL malformada
# Protocolo HTTP em produção
```

#### **3. Performance Issues**
```bash
# Usar quality adequada (75-85)
# Configurar sizes corretos
# Evitar unoptimized desnecessário
```

#### **4. Cache Issues** 
```bash
# Verificar minimumCacheTTL
# Invalidar cache via query string
# Redeploy se necessário
```

### **Debug na Vercel**
1. **Vercel Function Logs**: `vercel logs`
2. **Image Optimization Metrics**: Dashboard Vercel
3. **Network Tab**: Verificar requests de imagem
4. **Debug Page**: `/debug/images` com info da Vercel