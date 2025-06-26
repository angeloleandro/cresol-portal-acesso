# Sistema de Notificações - Cresol Portal

## 📋 Visão Geral

O sistema de notificações foi desenvolvido para permitir que admins de setores e subsetores se comuniquem efetivamente com os colaboradores através de mensagens direcionadas e notificações automáticas.

## 🚀 Funcionalidades

### ✅ Para Usuários
- **Centro de Notificações**: Widget na home page exibindo notificações recentes
- **Ícone na Navbar**: Acesso rápido às notificações com contador de não lidas
- **Notificações em Tempo Real**: Updates automáticos via WebSocket
- **Marcação de Leitura**: Sistema para marcar notificações como lidas/clicadas
- **Categorização**: Diferentes tipos de notificação (mensagem, evento, notícia, sistema)
- **Priorização**: Notificações urgentes, altas, normais e baixas

### ✅ Para Administradores
- **Painel de Gerenciamento**: Interface completa em `/admin/notifications`
- **Envio de Mensagens**: Notificações personalizadas com diferentes tipos e prioridades
- **Grupos de Usuários**: Criação e gerenciamento de grupos para envio direcionado
- **Notificações Globais**: Mensagens para todos os usuários
- **Notificações Automáticas**: Sistema dispara notificações quando eventos/notícias são criados/atualizados
- **Controle de Expiração**: Definir data de expiração para notificações

## 🏗️ Estrutura do Banco de Dados

### Tabelas Criadas

```sql
-- Grupos de notificação
notification_groups
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- created_by (UUID, FK para profiles)
- sector_id (UUID, FK para sectors)
- subsector_id (UUID, FK para subsectors)
- created_at, updated_at

-- Membros dos grupos
notification_group_members
- id (UUID, PK)
- group_id (UUID, FK para notification_groups)
- user_id (UUID, FK para profiles)
- added_by (UUID, FK para profiles)
- created_at

-- Notificações principais
notifications
- id (UUID, PK)
- title (VARCHAR)
- message (TEXT)
- type (VARCHAR) - 'message', 'event', 'news', 'system'
- priority (VARCHAR) - 'low', 'normal', 'high', 'urgent'
- sent_by (UUID, FK para profiles)
- sector_id, subsector_id (UUID, FK)
- related_event_id, related_news_id (UUID)
- is_global (BOOLEAN)
- created_at, expires_at

-- Destinatários das notificações
notification_recipients
- id (UUID, PK)
- notification_id (UUID, FK para notifications)
- recipient_id (UUID, FK para profiles)
- group_id (UUID, FK para notification_groups)
- read_at, clicked_at (TIMESTAMP)
- created_at
```

### Funções SQL Criadas

- `get_user_notifications()` - Busca notificações do usuário
- `mark_notification_read()` - Marca notificação como lida
- `mark_notification_clicked()` - Marca notificação como clicada
- `get_unread_notifications_count()` - Conta notificações não lidas
- `send_notification_to_groups()` - Envia notificação para grupos
- `send_notification_to_users()` - Envia notificação para usuários específicos

### Triggers Automáticos

- `notify_event_update()` - Dispara quando eventos são criados/atualizados
- `notify_news_update()` - Dispara quando notícias são criadas/atualizadas

## 🛠️ Instalação e Configuração

### 1. Executar o Setup no Supabase

```bash
# Executar script de configuração (requer variáveis de ambiente configuradas)
node setup-notifications.js
```

### 2. Configuração Manual (Alternativa)

Se o script automático não funcionar, execute manualmente no Supabase Dashboard:

1. Acesse o **SQL Editor** no Supabase Dashboard
2. Cole e execute o conteúdo do arquivo `sql-functions.sql`
3. Verifique se todas as tabelas foram criadas corretamente

### 3. Configurar Permissões (RLS)

As políticas de Row Level Security (RLS) já estão incluídas no SQL e garantem:
- Usuários só veem suas próprias notificações
- Admins podem gerenciar grupos e notificações de seus setores
- Super admins têm acesso completo

## 📱 Como Usar

### Para Usuários

1. **Visualizar Notificações**:
   - Acesse a home page para ver notificações recentes na sidebar
   - Clique no ícone de sino na navbar para ver dropdown com notificações
   - Badge vermelho indica quantidade de notificações não lidas

2. **Interagir com Notificações**:
   - Clique numa notificação para marcá-la como lida
   - Notificações de eventos/notícias redirecionam para as páginas correspondentes

### Para Administradores

1. **Acessar Painel**:
   - Vá para `/admin/notifications`
   - Disponível para usuários com role: `admin`, `sector_admin`, `subsector_admin`

2. **Enviar Notificação**:
   - Preencha título e mensagem
   - Escolha tipo (mensagem, evento, notícia, sistema)
   - Defina prioridade
   - Selecione destinatários:
     - ✅ Global: para todos os usuários
     - ✅ Grupos específicos
     - ✅ Usuários específicos

3. **Gerenciar Grupos**:
   - Crie grupos temáticos (ex: "Gerentes", "Vendas", "TI")
   - Adicione usuários aos grupos
   - Associe grupos a setores/subsetores

## 🔄 Fluxo de Notificações Automáticas

### Eventos e Notícias
Quando um admin cria ou atualiza um evento/notícia:
1. Trigger automático detecta a mudança
2. Cria notificação global automaticamente
3. Todos os usuários recebem a notificação
4. Título e conteúdo são gerados automaticamente

### Mensagens Direcionadas
Quando um admin envia uma mensagem:
1. Admin seleciona grupos/usuários específicos
2. Sistema cria registros na tabela `notification_recipients`
3. Usuários recebem notificação em tempo real
4. Sistema controla status de leitura individualmente

## 🎨 Componentes Criados

### `NotificationCenter.tsx`
- **Props**: `userId`, `compact` (boolean)
- **Modo Compacto**: Dropdown na navbar
- **Modo Completo**: Widget na sidebar da home
- **Features**: Real-time updates, marcação de leitura, navegação

### APIs Criadas

- **`/api/notifications/send`** (POST)
  - Envio de notificações
  - Validação de permissões
  - Suporte a grupos e usuários específicos

- **`/api/notifications/groups`** (GET/POST)
  - Listar e criar grupos
  - Gerenciamento de membros

## 🎯 Casos de Uso

### 1. Comunicação de Setor
```
Cenário: Admin do RH quer comunicar mudança de política
1. Cria grupo "Funcionários RH"
2. Adiciona todos do setor RH ao grupo
3. Envia notificação para o grupo
4. Todos recebem imediatamente
```

### 2. Evento Corporativo
```
Cenário: Admin cria evento no sistema
1. Admin publica evento no painel
2. Trigger automático cria notificação
3. Todos os usuários são notificados
4. Clique na notificação leva para página de eventos
```

### 3. Urgência
```
Cenário: Problema crítico no sistema
1. Admin define prioridade "urgente"
2. Notificação aparece destacada em vermelho
3. Fica no topo da lista independente da data
```

## 🔐 Segurança e Permissões

### Níveis de Acesso
- **Admin Global**: Pode enviar para qualquer usuário/grupo
- **Admin de Setor**: Limitado ao seu setor
- **Admin de Subsetor**: Limitado ao seu subsetor
- **Usuário Regular**: Apenas visualização

### Validações
- ✅ Autenticação obrigatória
- ✅ Verificação de role antes de enviar
- ✅ RLS protege dados sensíveis
- ✅ Logs de quem enviou cada notificação

## 📈 Monitoramento

### Métricas Disponíveis
- Contagem de notificações não lidas por usuário
- Histórico de envios (em desenvolvimento)
- Taxa de leitura de notificações
- Efetividade por tipo de notificação

## 🚀 Próximas Melhorias

### V2.0 Planejado
- [ ] Histórico completo de notificações
- [ ] Templates de mensagem
- [ ] Agendamento de envios
- [ ] Relatórios de engajamento
- [ ] Notificações push (PWA)
- [ ] Integração com email
- [ ] Anexos em notificações

## 🐛 Troubleshooting

### Problemas Comuns

**Notificações não aparecem**
- Verificar se usuário está autenticado
- Confirmar se RLS está configurado corretamente
- Checar console para erros de JavaScript

**Erro ao enviar notificação**
- Verificar permissões do usuário
- Confirmar se grupos/usuários existem
- Checar logs da API

**Contagem incorreta**
- Verificar função `get_unread_notifications_count`
- Confirmar se triggers estão funcionando

### Logs Úteis
```javascript
// No browser console
console.log('User notifications:', notifications);
console.log('Unread count:', unreadCount);
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este README
2. Verifique o console do browser
3. Analise logs do Supabase
4. Contate o desenvolvedor responsável

---

**Desenvolvido para Cresol Fronteiras - 2025** 