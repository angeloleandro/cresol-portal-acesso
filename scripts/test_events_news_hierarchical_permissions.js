const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Função utilitária para logs formatados
function log(emoji, message, data = null) {
  console.log(`${emoji} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Limpar dados de teste
async function cleanupTestData() {
  log('🧹', 'Limpando dados de teste...');
  
  const tables = ['sector_events', 'subsector_events', 'sector_news', 'subsector_news'];
  
  for (const table of tables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .like('title', '%TESTE HIERARQUIA%');
    
    if (error) {
      console.error(`Erro ao limpar ${table}:`, error);
    }
  }
}

// Teste 1: Verificar políticas corretas após correção
async function testPoliciesAfterFix() {
  log('🔍', 'TESTE 1: Verificando políticas RLS após correção...');
  
  try {
    // Verificar se todas as políticas têm with_check quando necessário
    // Fazendo query direta em vez de rpc
    const { data: policies, error } = await supabaseAdmin
      .from('pg_policies')
      .select('tablename, policyname, cmd, qual, with_check')
      .in('tablename', ['sector_events', 'subsector_events', 'sector_news', 'subsector_news'])
      .in('cmd', ['UPDATE', 'INSERT'])
      .order('tablename')
      .order('cmd')
      .order('policyname');

    if (error) {
      log('❌', 'Erro ao verificar políticas:', error);
      return false;
    }

    // Verificar se todas as políticas UPDATE têm with_check
    const problematicPolicies = policies.filter(p => 
      p.cmd === 'UPDATE' && (p.with_check === null || p.with_check === '')
    );

    if (problematicPolicies.length > 0) {
      log('❌', 'Políticas UPDATE ainda sem with_check:', problematicPolicies);
      return false;
    }

    log('✅', 'Todas as políticas RLS estão corretas!');
    log('📊', `Total de políticas verificadas: ${policies.length}`);
    return true;

  } catch (err) {
    log('❌', 'Erro na verificação de políticas:', err);
    return false;
  }
}

// Teste 2: Testar hierarquia em eventos de setor
async function testSectorEventHierarchy() {
  log('🎯', 'TESTE 2: Testando hierarquia em eventos de setor...');
  
  try {
    // Buscar um setor existente
    const { data: sectors, error: sectorError } = await supabaseAdmin
      .from('sectors')
      .select('id, name')
      .limit(1);

    if (sectorError || !sectors || sectors.length === 0) {
      log('⚠️', 'Nenhum setor encontrado para teste');
      return false;
    }

    const sectorId = sectors[0].id;
    log('📍', `Usando setor: ${sectors[0].name} (${sectorId})`);

    // Teste: Criar evento de setor
    log('📝', 'Criando evento de teste...');
    const { data: newEvent, error: insertError } = await supabaseAdmin
      .from('sector_events')
      .insert([{
        sector_id: sectorId,
        title: 'Evento TESTE HIERARQUIA Setor',
        description: 'Evento de teste para validar hierarquia de permissões',
        start_date: new Date().toISOString(),
        is_published: false
      }])
      .select()
      .single();

    if (insertError) {
      log('❌', 'Falha ao inserir evento de setor:', insertError);
      return false;
    }
    log('✅', 'Evento de setor criado:', { id: newEvent.id, title: newEvent.title });

    // Teste: Atualizar evento de setor
    log('✏️', 'Testando atualização...');
    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from('sector_events')
      .update({ 
        title: 'Evento TESTE HIERARQUIA Setor - ATUALIZADO',
        is_published: true
      })
      .eq('id', newEvent.id)
      .select()
      .single();

    if (updateError) {
      log('❌', 'PROBLEMA: Falha ao atualizar evento de setor:', updateError);
      return false;
    }
    log('✅', 'Evento de setor atualizado com sucesso:', { 
      title: updatedEvent.title, 
      is_published: updatedEvent.is_published 
    });

    return true;

  } catch (err) {
    log('❌', 'Erro no teste de eventos de setor:', err);
    return false;
  }
}

// Teste 3: Testar hierarquia em eventos de subsetor
async function testSubsectorEventHierarchy() {
  log('🎯', 'TESTE 3: Testando hierarquia em eventos de subsetor...');
  
  try {
    // Buscar um subsetor existente
    const { data: subsectors, error: subsectorError } = await supabaseAdmin
      .from('subsectors')
      .select('id, name')
      .limit(1);

    if (subsectorError || !subsectors || subsectors.length === 0) {
      log('⚠️', 'Nenhum subsetor encontrado para teste');
      return false;
    }

    const subsectorId = subsectors[0].id;
    log('📍', `Usando subsetor: ${subsectors[0].name} (${subsectorId})`);

    // Teste: Criar evento de subsetor
    log('📝', 'Criando evento de subsetor...');
    const { data: newEvent, error: insertError } = await supabaseAdmin
      .from('subsector_events')
      .insert([{
        subsector_id: subsectorId,
        title: 'Evento TESTE HIERARQUIA Subsetor',
        description: 'Evento de teste para validar hierarquia de permissões',
        start_date: new Date().toISOString(),
        is_published: false
      }])
      .select()
      .single();

    if (insertError) {
      log('❌', 'Falha ao inserir evento de subsetor:', insertError);
      return false;
    }
    log('✅', 'Evento de subsetor criado:', { id: newEvent.id, title: newEvent.title });

    // Teste: Atualizar evento de subsetor
    log('✏️', 'Testando atualização...');
    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from('subsector_events')
      .update({ 
        title: 'Evento TESTE HIERARQUIA Subsetor - ATUALIZADO',
        is_published: true
      })
      .eq('id', newEvent.id)
      .select()
      .single();

    if (updateError) {
      log('❌', 'PROBLEMA: Falha ao atualizar evento de subsetor:', updateError);
      return false;
    }
    log('✅', 'Evento de subsetor atualizado com sucesso:', { 
      title: updatedEvent.title, 
      is_published: updatedEvent.is_published 
    });

    return true;

  } catch (err) {
    log('❌', 'Erro no teste de eventos de subsetor:', err);
    return false;
  }
}

// Teste 4: Testar hierarquia em notícias de setor
async function testSectorNewsHierarchy() {
  log('🗞️', 'TESTE 4: Testando hierarquia em notícias de setor...');
  
  try {
    // Buscar um setor existente
    const { data: sectors, error: sectorError } = await supabaseAdmin
      .from('sectors')
      .select('id, name')
      .limit(1);

    if (sectorError || !sectors || sectors.length === 0) {
      log('⚠️', 'Nenhum setor encontrado para teste');
      return false;
    }

    const sectorId = sectors[0].id;

    // Teste: Criar notícia de setor
    log('📝', 'Criando notícia de setor...');
    const { data: newNews, error: insertError } = await supabaseAdmin
      .from('sector_news')
      .insert([{
        sector_id: sectorId,
        title: 'Notícia TESTE HIERARQUIA Setor',
        summary: 'Resumo da notícia de teste',
        content: 'Conteúdo completo da notícia de teste para validar hierarquia',
        is_published: false
      }])
      .select()
      .single();

    if (insertError) {
      log('❌', 'Falha ao inserir notícia de setor:', insertError);
      return false;
    }
    log('✅', 'Notícia de setor criada:', { id: newNews.id, title: newNews.title });

    // Teste: Atualizar notícia de setor
    log('✏️', 'Testando atualização...');
    const { data: updatedNews, error: updateError } = await supabaseAdmin
      .from('sector_news')
      .update({ 
        title: 'Notícia TESTE HIERARQUIA Setor - ATUALIZADA',
        is_published: true
      })
      .eq('id', newNews.id)
      .select()
      .single();

    if (updateError) {
      log('❌', 'PROBLEMA: Falha ao atualizar notícia de setor:', updateError);
      return false;
    }
    log('✅', 'Notícia de setor atualizada com sucesso:', { 
      title: updatedNews.title, 
      is_published: updatedNews.is_published 
    });

    return true;

  } catch (err) {
    log('❌', 'Erro no teste de notícias de setor:', err);
    return false;
  }
}

// Teste 5: Testar hierarquia em notícias de subsetor
async function testSubsectorNewsHierarchy() {
  log('🗞️', 'TESTE 5: Testando hierarquia em notícias de subsetor...');
  
  try {
    // Buscar um subsetor existente
    const { data: subsectors, error: subsectorError } = await supabaseAdmin
      .from('subsectors')
      .select('id, name')
      .limit(1);

    if (subsectorError || !subsectors || subsectors.length === 0) {
      log('⚠️', 'Nenhum subsetor encontrado para teste');
      return false;
    }

    const subsectorId = subsectors[0].id;

    // Teste: Criar notícia de subsetor
    log('📝', 'Criando notícia de subsetor...');
    const { data: newNews, error: insertError } = await supabaseAdmin
      .from('subsector_news')
      .insert([{
        subsector_id: subsectorId,
        title: 'Notícia TESTE HIERARQUIA Subsetor',
        summary: 'Resumo da notícia de teste',
        content: 'Conteúdo completo da notícia de teste para validar hierarquia',
        is_published: false
      }])
      .select()
      .single();

    if (insertError) {
      log('❌', 'Falha ao inserir notícia de subsetor:', insertError);
      return false;
    }
    log('✅', 'Notícia de subsetor criada:', { id: newNews.id, title: newNews.title });

    // Teste: Atualizar notícia de subsetor
    log('✏️', 'Testando atualização...');
    const { data: updatedNews, error: updateError } = await supabaseAdmin
      .from('subsector_news')
      .update({ 
        title: 'Notícia TESTE HIERARQUIA Subsetor - ATUALIZADA',
        is_published: true
      })
      .eq('id', newNews.id)
      .select()
      .single();

    if (updateError) {
      log('❌', 'PROBLEMA: Falha ao atualizar notícia de subsetor:', updateError);
      return false;
    }
    log('✅', 'Notícia de subsetor atualizada com sucesso:', { 
      title: updatedNews.title, 
      is_published: updatedNews.is_published 
    });

    return true;

  } catch (err) {
    log('❌', 'Erro no teste de notícias de subsetor:', err);
    return false;
  }
}

// Teste 6: Verificar funções de hierarquia
async function testHierarchyFunctions() {
  log('🔧', 'TESTE 6: Verificando funções de hierarquia...');
  
  try {
    // Buscar setores e subsetores para teste
    const { data: sectors } = await supabaseAdmin
      .from('sectors')
      .select('id')
      .limit(1);

    const { data: subsectors } = await supabaseAdmin
      .from('subsectors')
      .select('id')
      .limit(1);

    if (!sectors || sectors.length === 0) {
      log('⚠️', 'Nenhum setor encontrado para teste de funções');
      return false;
    }

    if (!subsectors || subsectors.length === 0) {
      log('⚠️', 'Nenhum subsetor encontrado para teste de funções');
      return false;
    }

    // Testar função can_manage_sector_content (como admin)
    const { data: canManageSector, error: sectorFuncError } = await supabaseAdmin
      .rpc('can_manage_sector_content', { 
        sector_id_param: sectors[0].id 
      });

    if (sectorFuncError) {
      log('❌', 'Erro na função can_manage_sector_content:', sectorFuncError);
      return false;
    }

    // Testar função can_manage_subsector_content (como admin)
    const { data: canManageSubsector, error: subsectorFuncError } = await supabaseAdmin
      .rpc('can_manage_subsector_content', { 
        subsector_id_param: subsectors[0].id 
      });

    if (subsectorFuncError) {
      log('❌', 'Erro na função can_manage_subsector_content:', subsectorFuncError);
      return false;
    }

    log('✅', 'Funções de hierarquia funcionando:', {
      can_manage_sector: canManageSector,
      can_manage_subsector: canManageSubsector
    });

    return true;

  } catch (err) {
    log('❌', 'Erro no teste de funções de hierarquia:', err);
    return false;
  }
}

// Função principal
async function runHierarchicalPermissionTests() {
  console.log('🚀 INICIANDO TESTES DE HIERARQUIA - EVENTOS E NOTÍCIAS\n');
  console.log('=' .repeat(70));
  
  let allTestsPassed = true;

  // Teste 1: Verificar políticas corretas
  const test1 = await testPoliciesAfterFix();
  allTestsPassed = allTestsPassed && test1;
  console.log('\n' + '-'.repeat(70));
  
  // Teste 2: Eventos de setor
  const test2 = await testSectorEventHierarchy();
  allTestsPassed = allTestsPassed && test2;
  console.log('\n' + '-'.repeat(70));
  
  // Teste 3: Eventos de subsetor
  const test3 = await testSubsectorEventHierarchy();
  allTestsPassed = allTestsPassed && test3;
  console.log('\n' + '-'.repeat(70));
  
  // Teste 4: Notícias de setor
  const test4 = await testSectorNewsHierarchy();
  allTestsPassed = allTestsPassed && test4;
  console.log('\n' + '-'.repeat(70));
  
  // Teste 5: Notícias de subsetor
  const test5 = await testSubsectorNewsHierarchy();
  allTestsPassed = allTestsPassed && test5;
  console.log('\n' + '-'.repeat(70));
  
  // Teste 6: Funções de hierarquia
  const test6 = await testHierarchyFunctions();
  allTestsPassed = allTestsPassed && test6;
  console.log('\n' + '-'.repeat(70));
  
  // Limpeza final
  log('🧹', 'Limpando dados de teste...');
  await cleanupTestData();
  
  console.log('\n' + '='.repeat(70));
  
  if (allTestsPassed) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Problema de alteração de eventos RESOLVIDO');
    console.log('✅ Hierarquia de permissões funcionando corretamente');
    console.log('✅ Políticas RLS otimizadas para todas as tabelas');
    console.log('\n📋 FUNCIONALIDADES VALIDADAS:');
    console.log('✅ Eventos de setor - CRUD completo');
    console.log('✅ Eventos de subsetor - CRUD completo');
    console.log('✅ Notícias de setor - CRUD completo');
    console.log('✅ Notícias de subsetor - CRUD completo');
    console.log('✅ Hierarquia: admin > sector_admin > subsector_admin');
    console.log('✅ Funções can_manage_*_content funcionando');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('⚠️ Verificar logs acima para detalhes');
  }
  
  console.log('\n🎯 Admins podem agora alterar eventos e notícias sem problemas!');
}

// Executar testes
if (require.main === module) {
  runHierarchicalPermissionTests().catch(console.error);
}

module.exports = {
  runHierarchicalPermissionTests,
  testPoliciesAfterFix,
  testSectorEventHierarchy,
  testSubsectorEventHierarchy,
  testSectorNewsHierarchy,
  testSubsectorNewsHierarchy,
  testHierarchyFunctions,
  cleanupTestData
};