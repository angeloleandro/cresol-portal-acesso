#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
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

// Criar cliente Supabase com permissões de admin
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function createPositionsTable() {
  console.log('🚀 Iniciando criação da tabela positions...\n');

  try {
    // 1. Verificar se a tabela já existe
    console.log('🔍 Verificando se a tabela positions já existe...');
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'positions');

    if (tables && tables.length > 0) {
      console.log('⚠️  Tabela positions já existe! Pulando criação...\n');
    } else {
      // 2. Criar a tabela positions
      console.log('📋 Criando tabela positions...');
      const createTableQuery = `
        CREATE TABLE positions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          department VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: createTableQuery 
      });
      
      if (createError) {
        throw new Error(`Erro ao criar tabela: ${createError.message}`);
      }
      console.log('✅ Tabela positions criada com sucesso!');
    }

    // 3. Habilitar RLS
    console.log('🔒 Habilitando Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE positions ENABLE ROW LEVEL SECURITY;' 
    });
    
    if (rlsError && !rlsError.message.includes('already enabled')) {
      throw new Error(`Erro ao habilitar RLS: ${rlsError.message}`);
    }
    console.log('✅ RLS habilitado!');

    // 4. Criar políticas RLS
    console.log('📜 Criando políticas RLS...');
    
    const policies = [
      {
        name: 'Usuários autenticados podem ler positions',
        sql: `
          CREATE POLICY "Usuários autenticados podem ler positions" ON positions
          FOR SELECT TO authenticated
          USING (true);
        `
      },
      {
        name: 'Apenas admins podem criar positions',
        sql: `
          CREATE POLICY "Apenas admins podem criar positions" ON positions
          FOR INSERT TO authenticated
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
        `
      },
      {
        name: 'Apenas admins podem atualizar positions',
        sql: `
          CREATE POLICY "Apenas admins podem atualizar positions" ON positions
          FOR UPDATE TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
        `
      },
      {
        name: 'Apenas admins podem deletar positions',
        sql: `
          CREATE POLICY "Apenas admins podem deletar positions" ON positions
          FOR DELETE TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
        `
      }
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { 
        sql: policy.sql 
      });
      
      if (policyError && !policyError.message.includes('already exists')) {
        console.log(`⚠️  Política "${policy.name}" pode já existir ou houve erro: ${policyError.message}`);
      } else {
        console.log(`✅ Política "${policy.name}" criada!`);
      }
    }

    // 5. Verificar se coluna position_id já existe na tabela profiles
    console.log('🔍 Verificando coluna position_id na tabela profiles...');
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('column_name', 'position_id');

    if (!columns || columns.length === 0) {
      console.log('📋 Adicionando coluna position_id à tabela profiles...');
      const { error: columnError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE profiles ADD COLUMN position_id UUID REFERENCES positions(id);' 
      });
      
      if (columnError) {
        throw new Error(`Erro ao adicionar coluna: ${columnError.message}`);
      }
      console.log('✅ Coluna position_id adicionada!');
    } else {
      console.log('⚠️  Coluna position_id já existe na tabela profiles!');
    }

    // 6. Criar índices
    console.log('📊 Criando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_profiles_position_id ON profiles(position_id);',
      'CREATE INDEX IF NOT EXISTS idx_positions_name ON positions(name);'
    ];

    for (const index of indices) {
      const { error: indexError } = await supabase.rpc('exec_sql', { 
        sql: index 
      });
      
      if (indexError && !indexError.message.includes('already exists')) {
        console.log(`⚠️  Erro ao criar índice: ${indexError.message}`);
      }
    }
    console.log('✅ Índices criados!');

    // 7. Testar a tabela
    console.log('\n🧪 Testando a tabela positions...');
    const { data: testData, error: testError } = await supabase
      .from('positions')
      .select('*')
      .limit(1);

    if (testError) {
      throw new Error(`Erro ao testar tabela: ${testError.message}`);
    }

    console.log('✅ Tabela positions está funcionando corretamente!');
    console.log(`📊 Número de registros: ${testData?.length || 0}`);

    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse /admin/positions para gerenciar cargos');
    console.log('2. Crie alguns cargos de teste');
    console.log('3. Teste a seleção de cargos nos formulários de usuário');

  } catch (error) {
    console.error('\n❌ Erro durante a execução:', error.message);
    process.exit(1);
  }
}

// Executar o script
createPositionsTable();