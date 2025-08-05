-- Migration: Add password_hash column to access_requests table
-- Description: Permite armazenar a senha inicial fornecida pelo usuário durante o cadastro
-- Date: 2025-08-04
-- Author: Final Refinement and Production Preparation Specialist

-- Verificar se a coluna já existe antes de adicioná-la
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'access_requests' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE access_requests 
        ADD COLUMN password_hash TEXT;
        
        COMMENT ON COLUMN access_requests.password_hash IS 
        'Armazena a senha inicial fornecida pelo usuário durante o cadastro (para ser usada na criação da conta após aprovação)';
        
        RAISE NOTICE 'Coluna password_hash adicionada com sucesso à tabela access_requests';
    ELSE
        RAISE NOTICE 'Coluna password_hash já existe na tabela access_requests';
    END IF;
END $$;

-- Verificar a estrutura atualizada da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'access_requests' 
ORDER BY ordinal_position;

-- Nota: Este campo não é obrigatório para manter compatibilidade com registros existentes
-- Registros existentes sem password_hash utilizarão senha temporária gerada automaticamente