# Políticas RLS Completas para Tabelas de Setores

## Data: 18/08/2025 - 15:40 (Horário de Brasília)

## ✅ Status da Padronização

Todas as três tabelas de setor agora possuem exatamente as mesmas políticas RLS, garantindo consistência e hierarquia adequada de permissões:

- **sector_news** ✅
- **sector_events** ✅  
- **sector_messages** ✅

## 📊 Políticas Implementadas (7 por tabela)

### 1. **Admin Global** - `Admin global can manage all sector [news/events/messages]`
- **Operação**: ALL (SELECT, INSERT, UPDATE, DELETE)
- **Condição**: `profile.role = 'admin'`
- **Acesso**: Total a todos os registros de todos os setores

### 2. **Admin de Setor** - `Sector admin can manage their sector [news/events/messages]`
- **Operação**: ALL (SELECT, INSERT, UPDATE, DELETE)
- **Condição**: Admin registrado em `sector_admins` para o setor específico
- **Acesso**: Total aos registros do seu setor

### 3. **Visualização Pública** - `Anyone can view published sector [news/events/messages]`
- **Operação**: SELECT
- **Condição**: `is_published = true`
- **Acesso**: Apenas registros publicados

### 4. **Criação por Usuários** - `Authenticated users can create sector [news/events/messages]`
- **Operação**: INSERT
- **Condição**: `auth.uid() = created_by`
- **Acesso**: Criar seus próprios registros

### 5. **Atualização Própria** - `Users can update their own sector [news/events/messages]`
- **Operação**: UPDATE
- **Condição**: `auth.uid() = created_by`
- **Acesso**: Atualizar apenas seus registros

### 6. **Exclusão Própria** - `Users can delete their own sector [news/events/messages]`
- **Operação**: DELETE
- **Condição**: `auth.uid() = created_by`
- **Acesso**: Excluir apenas seus registros

### 7. **Visualização de Rascunhos Próprios** - `Users can view their own draft sector [news/events/messages]`
- **Operação**: SELECT
- **Condição**: `auth.uid() = created_by AND is_published = false`
- **Acesso**: Ver apenas seus próprios rascunhos

## 🎯 Hierarquia de Permissões

```
┌────────────────────────────────────────────┐
│         ADMIN GLOBAL (role='admin')        │
│      ✅ Acesso total a TODOS os setores    │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│      ADMIN DE SETOR (sector_admins)        │
│    ✅ Acesso total ao seu setor específico │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│      USUÁRIO AUTENTICADO (auth.uid())      │
│     ✅ CRUD apenas em seus registros       │
│      ✅ Ver conteúdo publicado geral       │
└────────────────────────────────────────────┘
```

## 🔄 Comparação com Tabelas de Subsetor

### Tabelas de Setor (7 políticas cada):
- Admin Global ✅
- Admin de Setor (do próprio setor) ✅
- Visualização pública ✅
- CRUD próprio (4 políticas) ✅

### Tabelas de Subsetor (8 políticas cada):
- Admin Global ✅
- Admin de Setor (de todos os subsetores do setor) ✅
- Admin de Subsetor (do próprio subsetor) ✅
- Visualização pública ✅
- CRUD próprio (4 políticas) ✅

**Diferença**: Tabelas de subsetor têm uma política adicional para admin de subsetor, criando um nível extra na hierarquia.

## 🔍 Comandos de Verificação

### Verificar políticas por tabela:
```sql
SELECT 
    tablename,
    COUNT(*) as total_policies,
    STRING_AGG(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies
WHERE tablename IN ('sector_news', 'sector_events', 'sector_messages')
GROUP BY tablename
ORDER BY tablename;
```

### Comparar com subsetor:
```sql
SELECT 
    CASE 
        WHEN tablename LIKE 'sector_%' THEN 'Setor'
        WHEN tablename LIKE 'subsector_%' THEN 'Subsetor'
    END as nivel,
    COUNT(DISTINCT tablename) as tabelas,
    COUNT(*) / COUNT(DISTINCT tablename) as politicas_por_tabela
FROM pg_policies
WHERE tablename IN (
    'sector_news', 'sector_events', 'sector_messages',
    'subsector_news', 'subsector_events', 'subsector_messages'
)
GROUP BY 
    CASE 
        WHEN tablename LIKE 'sector_%' THEN 'Setor'
        WHEN tablename LIKE 'subsector_%' THEN 'Subsetor'
    END;
```

## ✅ Resumo das Alterações

### Antes:
- `sector_messages`: Usava políticas com nomenclatura antiga e lógica complexa
- `sector_news` e `sector_events`: Usavam função `can_manage_sector_content`
- Inconsistência entre as três tabelas

### Depois:
- ✅ Todas as 3 tabelas usam exatamente o mesmo padrão de 7 políticas
- ✅ Nomenclatura padronizada e descritiva
- ✅ Hierarquia clara: Admin Global → Admin Setor → Usuário
- ✅ Cada nível de permissão tem sua própria política separada
- ✅ Consistência total com o padrão usado em subsetores

## 📈 Benefícios

1. **Manutenibilidade**: Mesmo padrão em todas as tabelas facilita manutenção
2. **Clareza**: Fácil entender as permissões em cada nível
3. **Segurança**: Separação clara de responsabilidades
4. **Consistência**: Padrão único para setores e subsetores
5. **Simplicidade**: Políticas diretas sem funções complexas

## ✅ Conclusão

As políticas RLS para as três tabelas de setor (`sector_news`, `sector_events`, `sector_messages`) foram completamente padronizadas e agora garantem que:

- **Admin Global**: Tem acesso total a todos os setores
- **Admin de Setor**: Tem acesso total ao seu setor específico
- **Usuários**: Podem gerenciar apenas seu próprio conteúdo
- **Público**: Pode ver apenas conteúdo publicado

O sistema agora está totalmente consistente entre setores e subsetores, com hierarquia clara e permissões bem definidas.

---

**Implementação Concluída**: 18/08/2025 - 15:40 (Horário de Brasília)
**Total de Políticas**: 
- Setores: 21 (7 por tabela × 3 tabelas)
- Subsetores: 24 (8 por tabela × 3 tabelas)
- **Total Geral**: 45 políticas RLS padronizadas