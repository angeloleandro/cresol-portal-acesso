-- Função para atualizar o papel do usuário
-- Esta função deve ser criada no Supabase SQL Editor
CREATE OR REPLACE FUNCTION update_user_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Executada com permissões do criador, ignorando RLS
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Verifica se o papel é válido
  IF new_role NOT IN ('user', 'sector_admin', 'admin') THEN
    RAISE EXCEPTION 'Papel inválido: %', new_role;
  END IF;
  
  -- Atualiza o papel do usuário
  UPDATE profiles
  SET role = new_role
  WHERE id = user_id;
  
  -- Verifica se pelo menos uma linha foi atualizada
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao atualizar papel: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Função para criar a função update_user_role se ela não existir
CREATE OR REPLACE FUNCTION create_update_role_function()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Executada com permissões do criador
AS $$
BEGIN
  -- Verifica se a função já existe
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'update_user_role'
  ) THEN
    RAISE NOTICE 'Função update_user_role já existe';
    RETURN TRUE;
  END IF;
  
  -- Cria a função se não existir
  EXECUTE $FUNC$
  CREATE OR REPLACE FUNCTION update_user_role(user_id UUID, new_role TEXT)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $BODY$
  DECLARE
    success BOOLEAN;
  BEGIN
    IF new_role NOT IN ('user', 'sector_admin', 'admin') THEN
      RAISE EXCEPTION 'Papel inválido: %', new_role;
    END IF;
    
    UPDATE profiles
    SET role = new_role
    WHERE id = user_id;
    
    GET DIAGNOSTICS success = ROW_COUNT;
    
    RETURN success > 0;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao atualizar papel: %', SQLERRM;
      RETURN FALSE;
  END;
  $BODY$;
  $FUNC$;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar função: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Função para atualizar diretamente com SQL
CREATE OR REPLACE FUNCTION direct_sql_update_role(p_user_id UUID, p_new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Executada com permissões do criador, ignorando RLS
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Verifica se o papel é válido
  IF p_new_role NOT IN ('user', 'sector_admin', 'admin') THEN
    RAISE EXCEPTION 'Papel inválido: %', p_new_role;
  END IF;
  
  -- Executa o SQL diretamente
  EXECUTE 'UPDATE profiles SET role = $1 WHERE id = $2'
  USING p_new_role, p_user_id;
  
  -- Verifica se pelo menos uma linha foi atualizada
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro no SQL direto: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- COMO USAR ESTAS FUNÇÕES:
-- 1. Copie este código
-- 2. Vá para o Supabase Dashboard > SQL Editor
-- 3. Cole o código e execute
-- 4. Teste a função com:
--    SELECT update_user_role('ID-DO-USUÁRIO', 'admin'); 

-- Adicionar campo avatar_url à tabela profiles se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Tabela para grupos de notificação
CREATE TABLE IF NOT EXISTS notification_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  subsector_id UUID REFERENCES subsectors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para membros dos grupos de notificação
CREATE TABLE IF NOT EXISTS notification_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES notification_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Tabela principal de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'message', -- 'message', 'event', 'news', 'system'
  priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  subsector_id UUID REFERENCES subsectors(id) ON DELETE CASCADE,
  related_event_id UUID REFERENCES sector_events(id) ON DELETE SET NULL,
  related_news_id UUID REFERENCES sector_news(id) ON DELETE SET NULL,
  is_global BOOLEAN DEFAULT FALSE, -- Para notificações que vão para todos os usuários
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para destinatários das notificações
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES notification_groups(id) ON DELETE SET NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, recipient_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_sector ON notifications(sector_id);
CREATE INDEX IF NOT EXISTS idx_notifications_subsector ON notifications(subsector_id);
CREATE INDEX IF NOT EXISTS idx_notifications_global ON notifications(is_global);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user ON notification_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_read ON notification_recipients(read_at);
CREATE INDEX IF NOT EXISTS idx_notification_group_members_user ON notification_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_group_members_group ON notification_group_members(group_id);

-- Enable RLS
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies para notification_groups (CORRIGIDAS - SEM RECURSÃO)

-- REMOVER POLÍTICAS ANTIGAS PRIMEIRO
DROP POLICY IF EXISTS "Users can view groups they have access to" ON notification_groups;
DROP POLICY IF EXISTS "Admins can create groups" ON notification_groups;
DROP POLICY IF EXISTS "Admins can update their groups" ON notification_groups;
DROP POLICY IF EXISTS "Admins can delete their groups" ON notification_groups;
DROP POLICY IF EXISTS "Users can view group memberships they have access to" ON notification_group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON notification_group_members;

-- NOVAS POLÍTICAS SIMPLIFICADAS SEM RECURSÃO
CREATE POLICY "notification_groups_select" ON notification_groups
  FOR SELECT USING (
    -- Admin global pode ver todos
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    -- Criador pode ver
    created_by = auth.uid() OR
    -- Membro do grupo pode ver
    auth.uid() IN (SELECT user_id FROM notification_group_members WHERE group_id = notification_groups.id)
  );

CREATE POLICY "notification_groups_insert" ON notification_groups
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'sector_admin', 'subsector_admin'))
  );

CREATE POLICY "notification_groups_update" ON notification_groups
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    created_by = auth.uid()
  );

CREATE POLICY "notification_groups_delete" ON notification_groups
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    created_by = auth.uid()
  );

-- RLS Policies para notification_group_members (SIMPLIFICADAS)
CREATE POLICY "notification_group_members_select" ON notification_group_members
  FOR SELECT USING (
    -- Admin global pode ver todos
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    -- Próprio usuário pode ver suas associações
    user_id = auth.uid() OR
    -- Criador do grupo pode ver membros
    group_id IN (SELECT id FROM notification_groups WHERE created_by = auth.uid())
  );

CREATE POLICY "notification_group_members_insert" ON notification_group_members
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'sector_admin', 'subsector_admin'))
  );

CREATE POLICY "notification_group_members_update" ON notification_group_members
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    group_id IN (SELECT id FROM notification_groups WHERE created_by = auth.uid())
  );

CREATE POLICY "notification_group_members_delete" ON notification_group_members
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    group_id IN (SELECT id FROM notification_groups WHERE created_by = auth.uid())
  );

-- RLS Policies para notifications (SIMPLIFICADAS)

-- REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Users can view notifications sent to them" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update their notifications" ON notifications;

-- NOVAS POLÍTICAS SIMPLIFICADAS
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (
    -- Admin global pode ver todas
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    -- Criador pode ver suas notificações
    sent_by = auth.uid() OR
    -- Notificações globais todos podem ver
    is_global = true OR
    -- Destinatários específicos podem ver
    auth.uid() IN (SELECT recipient_id FROM notification_recipients WHERE notification_id = notifications.id)
  );

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'sector_admin', 'subsector_admin'))
  );

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR
    sent_by = auth.uid()
  );

-- RLS Policies para notification_recipients
CREATE POLICY "Users can view their own notification receipts" ON notification_recipients
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notification receipts" ON notification_recipients
  FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY "System can create notification receipts" ON notification_recipients
  FOR INSERT WITH CHECK (true);

-- Função para buscar notificações do usuário
CREATE OR REPLACE FUNCTION get_user_notifications(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  message TEXT,
  type VARCHAR,
  priority VARCHAR,
  sent_by UUID,
  sender_name VARCHAR,
  sector_name VARCHAR,
  subsector_name VARCHAR,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.priority,
    n.sent_by,
    COALESCE(p.full_name, p.email) as sender_name,
    s.name as sector_name,
    sub.name as subsector_name,
    nr.read_at,
    nr.clicked_at,
    n.created_at,
    n.expires_at
  FROM notifications n
  LEFT JOIN notification_recipients nr ON n.id = nr.notification_id AND nr.recipient_id = user_uuid
  LEFT JOIN profiles p ON n.sent_by = p.id
  LEFT JOIN sectors s ON n.sector_id = s.id
  LEFT JOIN subsectors sub ON n.subsector_id = sub.id
  WHERE 
    (n.is_global = true OR nr.recipient_id = user_uuid)
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY 
    n.priority = 'urgent' DESC,
    n.priority = 'high' DESC,
    n.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(
  notification_uuid UUID,
  user_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_recipients
  SET read_at = NOW()
  WHERE notification_id = notification_uuid 
    AND recipient_id = user_uuid 
    AND read_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Função para marcar notificação como clicada
CREATE OR REPLACE FUNCTION mark_notification_clicked(
  notification_uuid UUID,
  user_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_recipients
  SET clicked_at = NOW(),
      read_at = COALESCE(read_at, NOW())
  WHERE notification_id = notification_uuid 
    AND recipient_id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Função para contar notificações não lidas
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count_result
  FROM notifications n
  LEFT JOIN notification_recipients nr ON n.id = nr.notification_id AND nr.recipient_id = user_uuid
  WHERE 
    (n.is_global = true OR nr.recipient_id = user_uuid)
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
    AND (nr.read_at IS NULL OR (n.is_global = true AND nr.recipient_id IS NULL));
  
  RETURN COALESCE(count_result, 0);
END;
$$;

-- Função para criar notificação automática quando evento é criado/atualizado
CREATE OR REPLACE FUNCTION notify_event_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  notification_title VARCHAR;
  notification_message TEXT;
BEGIN
  -- Criar título e mensagem baseado na operação
  IF TG_OP = 'INSERT' THEN
    notification_title := 'Novo Evento: ' || NEW.title;
    notification_message := 'Um novo evento foi criado: ' || NEW.title || 
                           CASE WHEN NEW.start_date IS NOT NULL 
                           THEN ' - Data: ' || to_char(NEW.start_date, 'DD/MM/YYYY HH24:MI')
                           ELSE '' END;
  ELSIF TG_OP = 'UPDATE' THEN
    notification_title := 'Evento Atualizado: ' || NEW.title;
    notification_message := 'O evento ' || NEW.title || ' foi atualizado.';
  END IF;

  -- Criar notificação apenas se o evento está publicado
  IF NEW.is_published = true THEN
    INSERT INTO notifications (
      title, 
      message, 
      type, 
      priority, 
      sent_by, 
      sector_id, 
      subsector_id, 
      related_event_id, 
      is_global
    ) VALUES (
      notification_title,
      notification_message,
      'event',
      'normal',
      COALESCE(NEW.created_by, NEW.updated_by),
      NEW.sector_id,
      NEW.subsector_id,
      NEW.id,
      true -- Eventos vão para todos os usuários
    ) RETURNING id INTO notification_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Função para criar notificação automática quando notícia é criada/atualizada
CREATE OR REPLACE FUNCTION notify_news_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  notification_title VARCHAR;
  notification_message TEXT;
BEGIN
  -- Criar título e mensagem baseado na operação
  IF TG_OP = 'INSERT' THEN
    notification_title := 'Nova Notícia: ' || NEW.title;
    notification_message := 'Uma nova notícia foi publicada: ' || NEW.title;
  ELSIF TG_OP = 'UPDATE' THEN
    notification_title := 'Notícia Atualizada: ' || NEW.title;
    notification_message := 'A notícia ' || NEW.title || ' foi atualizada.';
  END IF;

  -- Criar notificação apenas se a notícia está publicada
  IF NEW.is_published = true THEN
    INSERT INTO notifications (
      title, 
      message, 
      type, 
      priority, 
      sent_by, 
      sector_id, 
      subsector_id, 
      related_news_id, 
      is_global
    ) VALUES (
      notification_title,
      notification_message,
      'news',
      'normal',
      COALESCE(NEW.created_by, NEW.updated_by),
      NEW.sector_id,
      NEW.subsector_id,
      NEW.id,
      true -- Notícias vão para todos os usuários
    ) RETURNING id INTO notification_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Triggers para notificações automáticas
DROP TRIGGER IF EXISTS trigger_notify_event_insert ON sector_events;
CREATE TRIGGER trigger_notify_event_insert
  AFTER INSERT ON sector_events
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_update();

DROP TRIGGER IF EXISTS trigger_notify_event_update ON sector_events;
CREATE TRIGGER trigger_notify_event_update
  AFTER UPDATE ON sector_events
  FOR EACH ROW
  WHEN (OLD.is_published IS DISTINCT FROM NEW.is_published OR OLD.title IS DISTINCT FROM NEW.title)
  EXECUTE FUNCTION notify_event_update();

DROP TRIGGER IF EXISTS trigger_notify_news_insert ON sector_news;
CREATE TRIGGER trigger_notify_news_insert
  AFTER INSERT ON sector_news
  FOR EACH ROW
  EXECUTE FUNCTION notify_news_update();

DROP TRIGGER IF EXISTS trigger_notify_news_update ON sector_news;
CREATE TRIGGER trigger_notify_news_update
  AFTER UPDATE ON sector_news
  FOR EACH ROW
  WHEN (OLD.is_published IS DISTINCT FROM NEW.is_published OR OLD.title IS DISTINCT FROM NEW.title)
  EXECUTE FUNCTION notify_news_update();

-- Função para enviar notificação para grupos específicos
CREATE OR REPLACE FUNCTION send_notification_to_groups(
  notification_uuid UUID,
  group_ids UUID[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_count INTEGER := 0;
  group_id UUID;
BEGIN
  -- Para cada grupo, inserir todos os membros como destinatários
  FOREACH group_id IN ARRAY group_ids
  LOOP
    INSERT INTO notification_recipients (notification_id, recipient_id, group_id)
    SELECT notification_uuid, ngm.user_id, group_id
    FROM notification_group_members ngm
    WHERE ngm.group_id = group_id
    ON CONFLICT (notification_id, recipient_id) DO NOTHING;
    
    GET DIAGNOSTICS inserted_count = inserted_count + ROW_COUNT;
  END LOOP;
  
  RETURN inserted_count;
END;
$$;

-- Função para enviar notificação para usuários específicos
CREATE OR REPLACE FUNCTION send_notification_to_users(
  notification_uuid UUID,
  user_ids UUID[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_count INTEGER := 0;
  user_id UUID;
BEGIN
  -- Para cada usuário, inserir como destinatário
  FOREACH user_id IN ARRAY user_ids
  LOOP
    INSERT INTO notification_recipients (notification_id, recipient_id)
    VALUES (notification_uuid, user_id)
    ON CONFLICT (notification_id, recipient_id) DO NOTHING;
    
    GET DIAGNOSTICS inserted_count = inserted_count + ROW_COUNT;
  END LOOP;
  
  RETURN inserted_count;
END;
$$; 