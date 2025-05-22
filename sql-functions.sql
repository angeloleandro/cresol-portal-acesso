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