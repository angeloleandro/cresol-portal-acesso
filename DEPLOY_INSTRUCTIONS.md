# Instruções para Deploy na Vercel

## Variáveis de Ambiente Necessárias

Para que o deploy funcione corretamente na Vercel, você precisa configurar as seguintes variáveis de ambiente no painel da Vercel:

### Obrigatórias para Build e Runtime:
```
NEXT_PUBLIC_SUPABASE_URL=https://taodkzafqgoparihaljx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzEyNTEsImV4cCI6MjA2MTUwNzI1MX0.J8O2DoHLLz5qTRktXbcnVqhL5KtkVML28w1XyM827CY
```

### Opcional (para funções serverless):
```
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

## Como Configurar na Vercel

1. Acesse o dashboard da Vercel
2. Vá para o projeto cresol-portal-acesso
3. Clique em "Settings"
4. Na aba "Environment Variables", adicione cada variável:
   - **Name**: NEXT_PUBLIC_SUPABASE_URL
   - **Value**: https://taodkzafqgoparihaljx.supabase.co
   - **Environments**: Production, Preview, Development

   - **Name**: NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **Value**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzEyNTEsImV4cCI6MjA2MTUwNzI1MX0.J8O2DoHLLz5qTRktXbcnVqhL5KtkVML28w1XyM827CY
   - **Environments**: Production, Preview, Development

5. Clique em "Save" para cada variável
6. Faça um novo deploy ou redeploy para aplicar as mudanças

## Correções Implementadas

Foi implementada uma correção no cliente Supabase para permitir builds sem as variáveis de ambiente definidas:

- **lib/supabase.ts**: Modificado para usar valores fallback durante o build
- **Páginas client-side**: Adicionadas verificações `typeof window !== 'undefined'` nos useEffect
- **Função getSupabaseClient()**: Verifica configuração apenas no lado do cliente

## Verificação do Deploy

Após configurar as variáveis de ambiente e fazer o deploy:

1. Verifique se todas as páginas carregam sem erro
2. Teste funcionalidades de login/logout
3. Verifique se os dados do Supabase são carregados corretamente
4. Teste uploads de imagem e outras funcionalidades

## Troubleshooting

### Se ainda houver erros relacionados ao Supabase:
- Verifique se todas as variáveis foram salvas corretamente na Vercel
- Certifique-se de que selecionou todos os environments (Production, Preview, Development)
- Faça um redeploy completo após adicionar as variáveis

### Se houver erros de CORS:
- Verifique as configurações do Supabase
- Adicione o domínio da Vercel nas configurações de CORS do Supabase

### Logs úteis:
```bash
# Ver logs de build
vercel logs [deployment-url]

# Ver logs de runtime
vercel logs [deployment-url] --follow
``` 