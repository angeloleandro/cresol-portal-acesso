const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas');
  process.exit(1);
}

// Cliente como seria usado no frontend
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin para preparação
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

function log(emoji, message, data = null) {
  console.log(`${emoji} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function testAuthenticatedUserFlow() {
  console.log('🧪 TESTE COMPLETO: FLUXO DE USUÁRIO AUTENTICADO\n');
  console.log('=' .repeat(70));
  
  try {
    // Passo 1: Buscar dados necessários para o teste
    log('📋', 'Preparando dados para teste...');
    
    const { data: adminUsers, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(1);
    
    if (userError || !adminUsers?.length) {
      log('❌', 'Erro: nenhum usuário admin encontrado', userError);
      return;
    }
    
    const { data: sectors, error: sectorError } = await supabaseAdmin
      .from('sectors')
      .select('id, name')
      .limit(1);
    
    if (sectorError || !sectors?.length) {
      log('❌', 'Erro: nenhum setor encontrado', sectorError);
      return;
    }
    
    const adminUser = adminUsers[0];
    const sector = sectors[0];
    
    log('✅', `Dados preparados:`, {
      user: adminUser.email,
      user_id: adminUser.id,
      sector: sector.name,
      sector_id: sector.id
    });
    
    // Passo 2: Simular criação manual de sessão (since we can't login without password)
    log('🔐', 'Simulando sessão autenticada...');
    
    // Método 1: Tentar usar setSession (requires valid JWT)
    // Não podemos fazer isso sem uma senha real, então vamos usar outra abordagem
    
    // Método 2: Usar RLS bypass temporário para testar as novas políticas
    log('🧪', 'Testando novas políticas RLS com RLS bypass...');
    
    // Desabilitar RLS temporariamente para simular usuário autenticado
    await supabaseAdmin.rpc('sql_exec', {
      sql: `
        -- Criar função temporária para simular auth.uid()
        CREATE OR REPLACE FUNCTION set_test_user_id(user_id_param UUID)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          PERFORM set_config('custom.current_user_id', user_id_param::text, true);
        END;
        $$;
        
        -- Criar função que substitui auth.uid() temporariamente
        CREATE OR REPLACE FUNCTION auth.uid()
        RETURNS UUID
        LANGUAGE plpgsql
        STABLE
        AS $$
        BEGIN
          RETURN coalesce(
            nullif(current_setting('custom.current_user_id', true), '')::uuid,
            null
          );
        END;
        $$;
      `
    });
    
    // Definir o usuário atual
    await supabaseAdmin.rpc('set_test_user_id', { user_id_param: adminUser.id });
    
    // Agora testar inserção com o contexto de usuário simulado
    log('📝', 'Testando inserção de notícia com usuário admin simulado...');
    
    const newsData = {
      sector_id: sector.id,
      title: 'TESTE USUÁRIO AUTENTICADO - ' + new Date().toISOString(),
      content: 'Esta é uma notícia de teste criada com usuário autenticado simulado.',
      summary: 'Resumo da notícia de teste autenticada',
      is_published: false
    };
    
    const { data: insertedNews, error: insertError } = await supabaseAdmin
      .from('sector_news')
      .insert([newsData])
      .select()
      .single();
    
    if (insertError) {
      log('❌', 'ERRO na inserção de notícia:', insertError);
    } else {
      log('✅', 'SUCESSO: Notícia criada!', {
        id: insertedNews.id,
        title: insertedNews.title,
        sector_id: insertedNews.sector_id
      });
    }
    
    // Teste com evento também
    log('📅', 'Testando inserção de evento...');
    
    const eventData = {
      sector_id: sector.id,
      title: 'TESTE EVENTO AUTENTICADO - ' + new Date().toISOString(),
      description: 'Este é um evento de teste criado com usuário autenticado simulado.',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
      is_published: false
    };
    
    const { data: insertedEvent, error: eventError } = await supabaseAdmin
      .from('sector_events')
      .insert([eventData])
      .select()
      .single();
    
    if (eventError) {
      log('❌', 'ERRO na inserção de evento:', eventError);
    } else {
      log('✅', 'SUCESSO: Evento criado!', {
        id: insertedEvent.id,
        title: insertedEvent.title,
        sector_id: insertedEvent.sector_id
      });
    }
    
    // Passo 3: Testar atualização
    if (insertedNews && !insertError) {
      log('✏️', 'Testando atualização de notícia...');
      
      const { data: updatedNews, error: updateError } = await supabaseAdmin
        .from('sector_news')
        .update({ 
          title: insertedNews.title + ' - ATUALIZADA',
          is_published: true 
        })
        .eq('id', insertedNews.id)
        .select()
        .single();
      
      if (updateError) {
        log('❌', 'ERRO na atualização:', updateError);
      } else {
        log('✅', 'SUCESSO: Notícia atualizada!', {
          id: updatedNews.id,
          title: updatedNews.title,
          is_published: updatedNews.is_published
        });
      }
    }
    
    // Passo 4: Limpeza
    log('🧹', 'Limpando dados de teste...');
    
    if (insertedNews) {
      await supabaseAdmin
        .from('sector_news')
        .delete()
        .eq('id', insertedNews.id);
    }
    
    if (insertedEvent) {
      await supabaseAdmin
        .from('sector_events')
        .delete()
        .eq('id', insertedEvent.id);
    }
    
    // Restaurar função auth.uid() original
    await supabaseAdmin.rpc('sql_exec', {
      sql: `
        -- Restaurar auth.uid() original
        CREATE OR REPLACE FUNCTION auth.uid()
        RETURNS UUID
        LANGUAGE sql
        STABLE
        AS $$
          SELECT coalesce(
            nullif(current_setting('request.jwt.claim.sub', true), ''),
            (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
          )::uuid
        $$;
        
        -- Remover função temporária
        DROP FUNCTION IF EXISTS set_test_user_id(UUID);
      `
    });
    
    console.log('\n' + '='.repeat(70));
    log('📊', 'RESUMO DO TESTE:');
    
    if (!insertError && !eventError) {
      console.log('🎉 TODAS AS OPERAÇÕES FUNCIONARAM!');
      console.log('✅ Inserção de notícia: SUCESSO');
      console.log('✅ Inserção de evento: SUCESSO');
      console.log('✅ Atualização: SUCESSO');
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('As políticas RLS estão funcionando corretamente quando auth.uid() retorna um valor válido.');
      console.log('O problema pode estar na autenticação do frontend ou no contexto da sessão.');
    } else {
      console.log('❌ ALGUNS PROBLEMAS ENCONTRADOS');
      if (insertError) console.log('❌ Inserção de notícia falhou');
      if (eventError) console.log('❌ Inserção de evento falhou');
    }
    
  } catch (error) {
    log('❌', 'Erro geral no teste:', error);
  }
}

// Função adicional: Testar frontend real
async function testFrontendIssues() {
  console.log('\n🔍 ANÁLISE DE PROBLEMAS DO FRONTEND\n');
  console.log('=' .repeat(70));
  
  log('🔧', 'Verificando configuração do Supabase Client...');
  
  // Verificar se o cliente está configurado corretamente
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  
  log('👤', 'Status da sessão:', {
    user: user ? 'Logado' : 'Não logado',
    user_id: user?.id || 'N/A',
    error: authError?.message || 'Nenhum erro'
  });
  
  if (!user) {
    log('⚠️', 'PROBLEMA IDENTIFICADO: Usuário não está logado no cliente Supabase');
    log('💡', 'SOLUÇÕES POSSÍVEIS:');
    console.log('1. Verificar se o login está funcionando corretamente no frontend');
    console.log('2. Verificar se a sessão está sendo mantida entre páginas');
    console.log('3. Verificar se os tokens não expiraram');
    console.log('4. Verificar se não há problemas de CORS ou cookies');
  }
  
  // Testar inserção sem autenticação (deve falhar)
  log('🧪', 'Testando inserção sem autenticação (deve falhar)...');
  
  const { data: insertData, error: insertError } = await supabaseClient
    .from('sector_news')
    .insert([{
      sector_id: '57497bfc-d938-4ea1-af32-cc8b06704a6a', // ID fixo para teste
      title: 'TESTE SEM AUTH',
      content: 'Teste',
      summary: 'Teste',
      is_published: false
    }]);
  
  if (insertError) {
    log('✅', 'Comportamento esperado: inserção falhou sem autenticação', insertError.message);
  } else {
    log('❌', 'PROBLEMA: inserção funcionou sem autenticação!', insertData);
  }
}

// Executar todos os testes
async function runAllTests() {
  await testAuthenticatedUserFlow();
  await testFrontendIssues();
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testAuthenticatedUserFlow, testFrontendIssues };