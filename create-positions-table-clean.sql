-- Criar tabela positions (cargos) seguindo a mesma estrutura de work_locations
CREATE TABLE IF NOT EXISTS positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar RLS (Row Level Security) para a tabela positions
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados leiam as positions
CREATE POLICY "Usuários autenticados podem ler positions" ON positions
  FOR SELECT TO authenticated
  USING (true);

-- Política para permitir que apenas admins criem positions
CREATE POLICY "Apenas admins podem criar positions" ON positions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política para permitir que apenas admins atualizem positions
CREATE POLICY "Apenas admins podem atualizar positions" ON positions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política para permitir que apenas admins deletem positions
CREATE POLICY "Apenas admins podem deletar positions" ON positions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Adicionar coluna position_id na tabela profiles para referenciar a tabela positions
-- Mas primeiro verificar se a coluna já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'position_id') THEN
        ALTER TABLE profiles ADD COLUMN position_id UUID REFERENCES positions(id);
    END IF;
END $$;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_position_id ON profiles(position_id);
CREATE INDEX IF NOT EXISTS idx_positions_name ON positions(name);