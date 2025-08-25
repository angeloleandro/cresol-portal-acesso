-- Migration: Adicionar controle de visibilidade de admins nas equipes
-- Data: 2025-08-25
-- Descrição: Cria tabelas para associar admins com setores/subsetores e controlar sua visibilidade nas equipes

-- ============================================
-- 1. CRIAR TABELA SECTOR_ADMINS
-- ============================================

-- Tabela para controlar associações de admins com setores
CREATE TABLE IF NOT EXISTS sector_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  show_as_team_member BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sector_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sector_admins_user_id ON sector_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_sector_admins_sector_id ON sector_admins(sector_id);
CREATE INDEX IF NOT EXISTS idx_sector_admins_show_as_team_member ON sector_admins(show_as_team_member);

-- ============================================
-- 2. CRIAR TABELA SUBSECTOR_ADMINS
-- ============================================

-- Tabela para controlar associações de admins com subsetores
CREATE TABLE IF NOT EXISTS subsector_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subsector_id UUID NOT NULL REFERENCES subsectors(id) ON DELETE CASCADE,
  show_as_team_member BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subsector_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subsector_admins_user_id ON subsector_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_subsector_admins_subsector_id ON subsector_admins(subsector_id);
CREATE INDEX IF NOT EXISTS idx_subsector_admins_show_as_team_member ON subsector_admins(show_as_team_member);

-- ============================================
-- 3. RLS POLICIES PARA SECTOR_ADMINS
-- ============================================

-- Habilitar RLS
ALTER TABLE sector_admins ENABLE ROW LEVEL SECURITY;

-- Política para visualização (todos podem ver associações)
CREATE POLICY "public_read_sector_admins"
  ON sector_admins
  FOR SELECT
  USING (true);

-- Política para admins gerais (podem gerenciar todas associações)
CREATE POLICY "admin_manage_sector_admins"
  ON sector_admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política para sector_admins (podem gerenciar sua própria visibilidade)
CREATE POLICY "sector_admin_self_manage"
  ON sector_admins
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'sector_admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- ============================================
-- 4. RLS POLICIES PARA SUBSECTOR_ADMINS
-- ============================================

-- Habilitar RLS
ALTER TABLE subsector_admins ENABLE ROW LEVEL SECURITY;

-- Política para visualização (todos podem ver associações)
CREATE POLICY "public_read_subsector_admins"
  ON subsector_admins
  FOR SELECT
  USING (true);

-- Política para admins gerais (podem gerenciar todas associações)
CREATE POLICY "admin_manage_subsector_admins"
  ON subsector_admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política para sector_admins (podem gerenciar admins de seus subsetores)
CREATE POLICY "sector_admin_manage_subsector_admins"
  ON subsector_admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN subsectors s ON s.id = subsector_admins.subsector_id
      JOIN sector_admins sa ON sa.sector_id = s.sector_id
      WHERE p.id = auth.uid()
      AND p.role = 'sector_admin'
      AND sa.user_id = auth.uid()
    )
  );

-- Política para subsector_admins (podem gerenciar sua própria visibilidade)
CREATE POLICY "subsector_admin_self_manage"
  ON subsector_admins
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'subsector_admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- ============================================
-- 5. FUNÇÃO PARA AUTO-ADICIONAR ADMINS
-- ============================================

-- Função para adicionar automaticamente admins quando role muda
CREATE OR REPLACE FUNCTION auto_add_admin_associations()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o role mudou para sector_admin, adicionar associação padrão
  IF NEW.role = 'sector_admin' AND (OLD.role IS NULL OR OLD.role != 'sector_admin') THEN
    -- Aqui você pode adicionar lógica para associar com setores específicos
    -- Por enquanto, apenas registra o evento
    RAISE NOTICE 'Usuário % mudou para sector_admin', NEW.id;
  END IF;
  
  -- Se o role mudou para subsector_admin, adicionar associação padrão
  IF NEW.role = 'subsector_admin' AND (OLD.role IS NULL OR OLD.role != 'subsector_admin') THEN
    -- Aqui você pode adicionar lógica para associar com subsetores específicos
    -- Por enquanto, apenas registra o evento
    RAISE NOTICE 'Usuário % mudou para subsector_admin', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-adicionar admins
CREATE TRIGGER auto_add_admin_on_role_change
AFTER INSERT OR UPDATE OF role ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_add_admin_associations();

-- ============================================
-- 6. FUNÇÃO PARA SINCRONIZAR ADMINS DE SUBSETORES COM SETORES
-- ============================================

-- Função para sincronizar admins de subsetores com setores pais
CREATE OR REPLACE FUNCTION sync_subsector_admin_to_sector()
RETURNS TRIGGER AS $$
DECLARE
  v_sector_id UUID;
BEGIN
  -- Buscar o sector_id do subsector
  SELECT sector_id INTO v_sector_id
  FROM subsectors
  WHERE id = COALESCE(NEW.subsector_id, OLD.subsector_id);

  -- Ao adicionar admin ao subsetor
  IF TG_OP = 'INSERT' THEN
    -- Adicionar ao setor pai se não existir
    INSERT INTO sector_admins (
      user_id, 
      sector_id, 
      show_as_team_member,
      created_at
    )
    VALUES (
      NEW.user_id,
      v_sector_id,
      NEW.show_as_team_member,
      NOW()
    )
    ON CONFLICT (user_id, sector_id)
    DO UPDATE SET
      updated_at = NOW();
    
    RETURN NEW;
  
  -- Ao remover admin do subsetor
  ELSIF TG_OP = 'DELETE' THEN
    -- Verificar se o admin tem outros subsetores no mesmo setor
    IF NOT EXISTS (
      SELECT 1 FROM subsector_admins sa
      JOIN subsectors s ON s.id = sa.subsector_id
      WHERE sa.user_id = OLD.user_id 
      AND s.sector_id = v_sector_id
      AND sa.subsector_id != OLD.subsector_id
    ) THEN
      -- Se não tem outros subsetores, remover do setor pai
      DELETE FROM sector_admins
      WHERE user_id = OLD.user_id 
        AND sector_id = v_sector_id;
    END IF;
    
    RETURN OLD;
    
  -- Ao atualizar admin do subsetor (ex: visibilidade)
  ELSIF TG_OP = 'UPDATE' THEN
    -- Atualizar no setor pai se existir
    UPDATE sector_admins
    SET show_as_team_member = NEW.show_as_team_member,
        updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND sector_id = v_sector_id;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronização automática de admins
CREATE TRIGGER sync_admin_associations
AFTER INSERT OR UPDATE OR DELETE ON subsector_admins
FOR EACH ROW
EXECUTE FUNCTION sync_subsector_admin_to_sector();

-- ============================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE sector_admins IS 'Associações de administradores com setores e controle de visibilidade nas equipes';
COMMENT ON TABLE subsector_admins IS 'Associações de administradores com subsetores e controle de visibilidade nas equipes';
COMMENT ON COLUMN sector_admins.show_as_team_member IS 'Define se o admin deve aparecer como membro da equipe do setor';
COMMENT ON COLUMN subsector_admins.show_as_team_member IS 'Define se o admin deve aparecer como membro da equipe do subsetor';

-- ============================================
-- 8. POPULAR TABELAS COM DADOS EXISTENTES
-- ============================================

-- Adicionar admins de setor existentes (baseado no role sector_admin)
-- Note: Esta é uma sugestão. Ajuste conforme necessário para sua lógica de negócio
INSERT INTO sector_admins (user_id, sector_id, show_as_team_member)
SELECT DISTINCT 
  p.id as user_id,
  s.id as sector_id,
  true as show_as_team_member
FROM profiles p
CROSS JOIN sectors s
WHERE p.role = 'sector_admin'
  AND NOT EXISTS (
    SELECT 1 FROM sector_admins sa
    WHERE sa.user_id = p.id AND sa.sector_id = s.id
  )
ON CONFLICT (user_id, sector_id) DO NOTHING;

-- Adicionar admins de subsetor existentes (baseado no role subsector_admin)
-- Note: Esta é uma sugestão. Ajuste conforme necessário para sua lógica de negócio
INSERT INTO subsector_admins (user_id, subsector_id, show_as_team_member)
SELECT DISTINCT 
  p.id as user_id,
  ss.id as subsector_id,
  true as show_as_team_member
FROM profiles p
CROSS JOIN subsectors ss
WHERE p.role = 'subsector_admin'
  AND NOT EXISTS (
    SELECT 1 FROM subsector_admins ssa
    WHERE ssa.user_id = p.id AND ssa.subsector_id = ss.id
  )
ON CONFLICT (user_id, subsector_id) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 002_add_admin_team_visibility executada com sucesso!';
  RAISE NOTICE 'Tabelas criadas: sector_admins, subsector_admins';
  RAISE NOTICE 'RLS policies aplicadas';
  RAISE NOTICE 'Triggers de sincronização ativados';
END $$;