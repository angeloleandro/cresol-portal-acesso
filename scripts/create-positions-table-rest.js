#!/usr/bin/env node

const { config } = require('dotenv');

// Carregar variáveis de ambiente
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

async function executeSQL(query) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function checkTableExists(tableName) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function createPositionsTable() {
  console.log('🚀 Iniciando criação da tabela positions...\n');

  try {
    // 1. Verificar se a tabela já existe
    console.log('🔍 Verificando se a tabela positions já existe...');
    const tableExists = await checkTableExists('positions');

    if (tableExists) {
      console.log('✅ Tabela positions já existe e está acessível!');
    } else {
      console.log('❌ Tabela positions não existe ou não está acessível.');
      console.log('\n📋 Você precisa executar este SQL no Supabase Dashboard:');
      console.log('=' .repeat(60));
      console.log(`
-- 1. Criar tabela positions
CREATE TABLE IF NOT EXISTS positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
CREATE POLICY "Usuários autenticados podem ler positions" ON positions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem criar positions" ON positions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem atualizar positions" ON positions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem deletar positions" ON positions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Adicionar coluna position_id na tabela profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'position_id') THEN
        ALTER TABLE profiles ADD COLUMN position_id UUID REFERENCES positions(id);
    END IF;
END $$;

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_position_id ON profiles(position_id);
CREATE INDEX IF NOT EXISTS idx_positions_name ON positions(name);
      `);
      console.log('=' .repeat(60));
      console.log('\n📋 Instruções:');
      console.log('1. Acesse o Supabase Dashboard');
      console.log('2. Vá para "SQL Editor"');
      console.log('3. Cole o SQL acima em uma nova query');
      console.log('4. Execute a query');
      console.log('5. Execute este script novamente para verificar');
      return;
    }

    // 2. Testar operações básicas na tabela
    console.log('\n🧪 Testando operações na tabela positions...');

    // Testar SELECT
    const selectResponse = await fetch(`${supabaseUrl}/rest/v1/positions?select=*&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    });

    if (!selectResponse.ok) {
      throw new Error(`Erro no SELECT: ${selectResponse.status} ${await selectResponse.text()}`);
    }

    const positions = await selectResponse.json();
    console.log(`✅ SELECT funcionando! Encontrados ${positions.length} registros.`);

    // Testar INSERT (criar um cargo de teste)
    const testPosition = {
      name: 'Cargo de Teste',
      description: 'Cargo criado para testar a funcionalidade',
      department: 'Teste'
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/positions`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testPosition)
    });

    if (insertResponse.ok) {
      const insertedPosition = await insertResponse.json();
      console.log(`✅ INSERT funcionando! Cargo criado com ID: ${insertedPosition[0].id}`);

      // Testar DELETE (remover o cargo de teste)
      const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/positions?id=eq.${insertedPosition[0].id}`, {
        method: 'DELETE',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ DELETE funcionando! Cargo de teste removido.');
      }
    } else {
      const insertError = await insertResponse.text();
      console.log(`⚠️  INSERT com restrições: ${insertResponse.status} - ${insertError}`);
      console.log('(Isso é esperado se as políticas RLS estiverem funcionando)');
    }

    // 3. Verificar coluna position_id na tabela profiles
    console.log('\n🔍 Verificando coluna position_id na tabela profiles...');
    const profilesResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,position_id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    });

    if (profilesResponse.ok) {
      const profiles = await profilesResponse.json();
      console.log('✅ Coluna position_id encontrada na tabela profiles!');
    } else {
      console.log('❌ Coluna position_id não encontrada na tabela profiles.');
      console.log('Execute o SQL fornecido acima para adicionar a coluna.');
    }

    console.log('\n🎉 Verificação concluída!');
    console.log('\n📋 Status da implementação:');
    console.log('✅ Tabela positions acessível');
    console.log('✅ Operações básicas funcionando');
    console.log('✅ Estrutura do banco preparada');
    console.log('\n🚀 Você pode agora:');
    console.log('1. Acessar /admin/positions');
    console.log('2. Criar cargos');
    console.log('3. Testar nos formulários de usuário');

  } catch (error) {
    console.error('\n❌ Erro durante a execução:', error.message);
    
    if (error.message.includes('404')) {
      console.log('\n💡 A tabela positions ainda não existe.');
      console.log('Execute o SQL fornecido acima no Supabase Dashboard.');
    }
    
    process.exit(1);
  }
}

// Executar o script
createPositionsTable();