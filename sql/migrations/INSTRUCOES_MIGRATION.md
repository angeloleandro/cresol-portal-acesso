# Instruções para Aplicar Migration de Membros do Time

## 📋 Problema Resolvido

Esta migration corrige o erro: **"Could not find a relationship between 'sector_team_members' and 'profiles'"**

## 🚀 Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Entre em: https://app.supabase.com
   - Selecione seu projeto Cresol Portal

2. **Navegue até o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute a Migration**
   - Copie todo o conteúdo do arquivo `001_fix_team_members_relationships.sql`
   - Cole no editor SQL
   - Clique em "Run" ou pressione `Ctrl+Enter`

4. **Verifique o Resultado**
   - Procure pelas mensagens de sucesso no console:
     - "Relacionamento sector_team_members -> profiles: OK"
     - "Relacionamento sector_team_members -> sectors: OK"
     - "Relacionamento subsector_team_members -> profiles: OK"
     - "Migration executada com sucesso!"

### Opção 2: Via Supabase CLI

```bash
# 1. Instale o Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Faça login
supabase login

# 3. Link com seu projeto
supabase link --project-ref [seu-project-ref]

# 4. Execute a migration
supabase db push < sql/migrations/001_fix_team_members_relationships.sql
```

## ✅ O que a Migration Faz

1. **Estabelece Foreign Keys Corretas**
   - Conecta `sector_team_members` com `profiles`
   - Conecta `subsector_team_members` com `profiles`
   - Conecta as tabelas com `sectors` e `subsectors`

2. **Cria Índices para Performance**
   - Otimiza buscas por `user_id`
   - Otimiza buscas por `sector_id` e `subsector_id`

3. **Implementa Sincronização Automática**
   - Quando adicionar membro ao subsetor → aparece automaticamente no setor pai
   - Quando remover membro do subsetor → remove automaticamente do setor pai

4. **Configura Segurança (RLS)**
   - Todos podem ver membros
   - Apenas admins podem adicionar/remover membros

## 🧪 Como Testar

### 1. Teste Básico - Adicionar Membro ao Setor

1. Acesse a página de um setor: `/setores/[id]/equipe`
2. Clique em "Adicionar Membro"
3. Selecione um usuário
4. Confirme que o membro aparece na lista

### 2. Teste de Sincronização - Subsetor → Setor

1. Acesse um subsetor: `/subsetores/[id]`
2. Adicione um membro à equipe
3. Volte ao setor pai: `/setores/[id]/equipe`
4. Verifique se o membro aparece na seção "Membros dos Sub-setores"

### 3. Teste de Remoção

1. Tente remover um membro direto do setor ✅ (deve funcionar)
2. Tente remover um membro que veio de subsetor ❌ (deve mostrar aviso)

## 🔍 Verificar se Funcionou

Execute esta query no SQL Editor do Supabase:

```sql
-- Testar se os relacionamentos funcionam
SELECT 
  stm.id,
  stm.user_id,
  stm.sector_id,
  stm.is_from_subsector,
  p.full_name,
  p.email,
  s.name as sector_name
FROM sector_team_members stm
JOIN profiles p ON p.id = stm.user_id
JOIN sectors s ON s.id = stm.sector_id
LIMIT 5;
```

Se retornar resultados sem erro, a migration foi aplicada com sucesso!

## ⚠️ Troubleshooting

### Erro: "relation already exists"
- Isso significa que as foreign keys já existem
- A migration já foi aplicada anteriormente
- Pode ignorar este erro

### Erro: "permission denied"
- Você precisa de permissões de admin no banco
- Contate o administrador do Supabase

### Erro: "relation 'profiles' does not exist"
- A tabela profiles não existe ou tem outro nome
- Verifique o nome correto da tabela no Supabase

## 📱 Após Aplicar a Migration

1. **Reinicie o servidor de desenvolvimento**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

2. **Limpe o cache do navegador**
   - Chrome/Edge: `Ctrl+Shift+R`
   - Firefox: `Ctrl+Shift+R`
   - Safari: `Cmd+Shift+R`

3. **Teste a funcionalidade**
   - Adicione alguns membros
   - Verifique se aparecem nas páginas públicas
   - Teste a sincronização subsetor → setor

## 💡 Dicas Importantes

- A migration é **idempotente**: pode executar múltiplas vezes sem problemas
- Os dados existentes são preservados
- A sincronização de membros existentes é feita automaticamente
- Após aplicar, os logs das APIs mostrarão mais detalhes para debug

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador (F12)
2. Verifique os logs do servidor Next.js
3. Verifique os logs no Supabase Dashboard → Logs → API

---

**Data de criação**: 2025-08-23  
**Versão**: 1.0.0  
**Autor**: Sistema automatizado