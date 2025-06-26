-- Script para corrigir problemas de RLS nas notificações
-- Este script deve ser executado no Supabase SQL Editor

-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view groups they have access to" ON notification_groups;
DROP POLICY IF EXISTS "Admins can create groups" ON notification_groups;
DROP POLICY IF EXISTS "Admins can update their groups" ON notification_groups;
DROP POLICY IF EXISTS "Admins can delete their groups" ON notification_groups;
DROP POLICY IF EXISTS "Users can view group memberships they have access to" ON notification_group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON notification_group_members;
DROP POLICY IF EXISTS "Users can view notifications sent to them" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update their notifications" ON notifications;

-- 2. CRIAR POLÍTICAS SIMPLIFICADAS PARA notification_groups
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

-- 3. CRIAR POLÍTICAS SIMPLIFICADAS PARA notification_group_members
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

-- 4. CRIAR POLÍTICAS SIMPLIFICADAS PARA notifications
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

-- 5. VERIFICAR SE RLS ESTÁ HABILITADO
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- 6. CONCEDER PERMISSÕES NECESSÁRIAS (se necessário)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_group_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_recipients TO authenticated; 