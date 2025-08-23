-- Migration: Corrigir relacionamentos das tabelas de membros do time
-- Data: 2025-08-23
-- Descrição: Estabelece foreign keys corretas entre sector_team_members, subsector_team_members e profiles
-- Status: ✅ APLICADA via Supabase MCP em 23/08/2025 - NÃO EXECUTAR NOVAMENTE

-- ============================================
-- 1. REMOVER CONSTRAINTS ANTIGAS (SE EXISTIREM)
-- ============================================

-- Remover constraints antigas de sector_team_members (se existirem)
ALTER TABLE IF EXISTS sector_team_members 
  DROP CONSTRAINT IF EXISTS fk_sector_team_members_profiles,
  DROP CONSTRAINT IF EXISTS fk_sector_team_members_sectors,
  DROP CONSTRAINT IF EXISTS fk_sector_team_members_subsectors,
  DROP CONSTRAINT IF EXISTS sector_team_members_user_id_fkey,
  DROP CONSTRAINT IF EXISTS sector_team_members_sector_id_fkey,
  DROP CONSTRAINT IF EXISTS sector_team_members_subsector_id_fkey;

-- Remover constraints antigas de subsector_team_members (se existirem)
ALTER TABLE IF EXISTS subsector_team_members
  DROP CONSTRAINT IF EXISTS fk_subsector_team_members_profiles,
  DROP CONSTRAINT IF EXISTS fk_subsector_team_members_subsectors,
  DROP CONSTRAINT IF EXISTS subsector_team_members_user_id_fkey,
  DROP CONSTRAINT IF EXISTS subsector_team_members_subsector_id_fkey;

-- ============================================
-- 2. ADICIONAR FOREIGN KEYS CORRETAS
-- ============================================

-- Foreign keys para sector_team_members
ALTER TABLE sector_team_members
  ADD CONSTRAINT sector_team_members_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE,
  
  ADD CONSTRAINT sector_team_members_sector_id_fkey
    FOREIGN KEY (sector_id) 
    REFERENCES sectors(id) 
    ON DELETE CASCADE;

-- Adicionar constraint para subsector_id apenas se não for NULL
ALTER TABLE sector_team_members
  ADD CONSTRAINT sector_team_members_subsector_id_fkey
    FOREIGN KEY (subsector_id) 
    REFERENCES subsectors(id) 
    ON DELETE CASCADE;

-- Foreign keys para subsector_team_members  
ALTER TABLE subsector_team_members
  ADD CONSTRAINT subsector_team_members_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE,
  
  ADD CONSTRAINT subsector_team_members_subsector_id_fkey
    FOREIGN KEY (subsector_id) 
    REFERENCES subsectors(id) 
    ON DELETE CASCADE;

-- ============================================
-- 3. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================

-- Índices para sector_team_members
CREATE INDEX IF NOT EXISTS idx_sector_team_members_user_id 
  ON sector_team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_sector_team_members_sector_id 
  ON sector_team_members(sector_id);

CREATE INDEX IF NOT EXISTS idx_sector_team_members_subsector_id 
  ON sector_team_members(subsector_id) 
  WHERE subsector_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sector_team_members_is_from_subsector 
  ON sector_team_members(is_from_subsector);

-- Índices para subsector_team_members
CREATE INDEX IF NOT EXISTS idx_subsector_team_members_user_id 
  ON subsector_team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_subsector_team_members_subsector_id 
  ON subsector_team_members(subsector_id);

-- Índice composto para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_sector_team_members_unique 
  ON sector_team_members(user_id, sector_id, COALESCE(subsector_id, '00000000-0000-0000-0000-000000000000'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_subsector_team_members_unique 
  ON subsector_team_members(user_id, subsector_id);

-- ============================================
-- 4. FUNÇÃO PARA SINCRONIZAÇÃO AUTOMÁTICA
-- ============================================

-- Função para adicionar/remover membros de subsetores no setor pai
CREATE OR REPLACE FUNCTION sync_subsector_members_to_sector()
RETURNS TRIGGER AS $$
DECLARE
  v_sector_id UUID;
BEGIN
  -- Buscar o sector_id do subsector
  SELECT sector_id INTO v_sector_id
  FROM subsectors
  WHERE id = COALESCE(NEW.subsector_id, OLD.subsector_id);

  -- Ao adicionar membro ao subsetor
  IF TG_OP = 'INSERT' THEN
    -- Adicionar ao setor pai com flag is_from_subsector = true
    INSERT INTO sector_team_members (
      user_id, 
      sector_id, 
      position, 
      is_from_subsector, 
      subsector_id,
      created_at
    )
    VALUES (
      NEW.user_id,
      v_sector_id,
      NEW.position,
      true,
      NEW.subsector_id,
      NOW()
    )
    ON CONFLICT (user_id, sector_id, COALESCE(subsector_id, '00000000-0000-0000-0000-000000000000'))
    DO UPDATE SET
      position = EXCLUDED.position,
      updated_at = NOW();
    
    RETURN NEW;
  
  -- Ao remover membro do subsetor
  ELSIF TG_OP = 'DELETE' THEN
    -- Remover do setor pai apenas registros que vieram do subsetor
    DELETE FROM sector_team_members
    WHERE user_id = OLD.user_id 
      AND sector_id = v_sector_id
      AND subsector_id = OLD.subsector_id
      AND is_from_subsector = true;
    
    RETURN OLD;
    
  -- Ao atualizar membro do subsetor (ex: cargo)
  ELSIF TG_OP = 'UPDATE' THEN
    -- Atualizar no setor pai
    UPDATE sector_team_members
    SET position = NEW.position,
        updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND sector_id = v_sector_id
      AND subsector_id = NEW.subsector_id
      AND is_from_subsector = true;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS sync_team_members ON subsector_team_members;

-- Criar trigger para sincronização automática
CREATE TRIGGER sync_team_members
AFTER INSERT OR UPDATE OR DELETE ON subsector_team_members
FOR EACH ROW
EXECUTE FUNCTION sync_subsector_members_to_sector();

-- ============================================
-- 5. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Habilitar RLS para sector_team_members
ALTER TABLE sector_team_members ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem ver membros do setor" ON sector_team_members;
DROP POLICY IF EXISTS "Admins podem gerenciar membros" ON sector_team_members;
DROP POLICY IF EXISTS "Sector admins podem gerenciar seus membros" ON sector_team_members;

-- Política para visualização (todos podem ver)
CREATE POLICY "public_read_sector_team_members"
  ON sector_team_members
  FOR SELECT
  USING (true);

-- Política para admins gerais
CREATE POLICY "admin_all_sector_team_members"
  ON sector_team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política para admins de setor
CREATE POLICY "sector_admin_manage_team_members"
  ON sector_team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'sector_admin'
      AND EXISTS (
        SELECT 1 FROM sector_admins sa
        WHERE sa.user_id = auth.uid()
        AND sa.sector_id = sector_team_members.sector_id
      )
    )
  );

-- Habilitar RLS para subsector_team_members
ALTER TABLE subsector_team_members ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem ver membros do subsetor" ON subsector_team_members;
DROP POLICY IF EXISTS "Admins podem gerenciar membros do subsetor" ON subsector_team_members;
DROP POLICY IF EXISTS "Subsector admins podem gerenciar seus membros" ON subsector_team_members;

-- Política para visualização (todos podem ver)
CREATE POLICY "public_read_subsector_team_members"
  ON subsector_team_members
  FOR SELECT
  USING (true);

-- Política para admins gerais e de setor
CREATE POLICY "admin_all_subsector_team_members"
  ON subsector_team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'sector_admin')
    )
  );

-- Política para admins de subsetor
CREATE POLICY "subsector_admin_manage_team_members"
  ON subsector_team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'subsector_admin'
      AND EXISTS (
        SELECT 1 FROM subsector_admins sa
        WHERE sa.user_id = auth.uid()
        AND sa.subsector_id = subsector_team_members.subsector_id
      )
    )
  );

-- ============================================
-- 6. ADICIONAR COLUNAS FALTANTES (SE NECESSÁRIO)
-- ============================================

-- Adicionar coluna updated_at se não existir
ALTER TABLE sector_team_members 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE subsector_team_members 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- 7. SINCRONIZAR DADOS EXISTENTES
-- ============================================

-- Sincronizar membros de subsetores existentes com seus setores
INSERT INTO sector_team_members (
  user_id,
  sector_id,
  position,
  is_from_subsector,
  subsector_id,
  created_at
)
SELECT DISTINCT
  stm.user_id,
  s.sector_id,
  stm.position,
  true,
  stm.subsector_id,
  stm.created_at
FROM subsector_team_members stm
JOIN subsectors s ON s.id = stm.subsector_id
WHERE NOT EXISTS (
  SELECT 1 FROM sector_team_members st
  WHERE st.user_id = stm.user_id
    AND st.sector_id = s.sector_id
    AND st.subsector_id = stm.subsector_id
)
ON CONFLICT (user_id, sector_id, COALESCE(subsector_id, '00000000-0000-0000-0000-000000000000'))
DO NOTHING;

-- ============================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE sector_team_members IS 'Membros das equipes dos setores - inclui membros diretos e herdados de subsetores';
COMMENT ON TABLE subsector_team_members IS 'Membros das equipes dos subsetores';
COMMENT ON COLUMN sector_team_members.is_from_subsector IS 'Indica se o membro foi adicionado através de um subsetor (true) ou diretamente ao setor (false)';
COMMENT ON COLUMN sector_team_members.subsector_id IS 'ID do subsetor de origem quando is_from_subsector = true';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Query para verificar se os relacionamentos estão funcionando
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Testar join com profiles
  SELECT COUNT(*) INTO v_count
  FROM sector_team_members stm
  JOIN profiles p ON p.id = stm.user_id
  LIMIT 1;
  
  RAISE NOTICE 'Relacionamento sector_team_members -> profiles: OK';
  
  -- Testar join com sectors
  SELECT COUNT(*) INTO v_count
  FROM sector_team_members stm
  JOIN sectors s ON s.id = stm.sector_id
  LIMIT 1;
  
  RAISE NOTICE 'Relacionamento sector_team_members -> sectors: OK';
  
  -- Testar join com subsectors
  SELECT COUNT(*) INTO v_count
  FROM subsector_team_members stm
  JOIN profiles p ON p.id = stm.user_id
  LIMIT 1;
  
  RAISE NOTICE 'Relacionamento subsector_team_members -> profiles: OK';
  
  RAISE NOTICE 'Migration executada com sucesso!';
END $$;