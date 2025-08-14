#!/usr/bin/env node

/**
 * Script corrigido para testar criação de notícias/eventos com campos corretos
 */

// Configurar ambiente
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://taodkzafqgoparihaljx.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzEyNTEsImV4cCI6MjA2MTUwNzI1MX0.J8O2DoHLLz5qTRktXbcnVqhL5KtkVML28w1XyM827CY';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTI1MSwiZXhwIjoyMDYxNTA3MjUxfQ.lkKcYCRy-WinOuxntXwa7S4l7s6hsOqDUjPGj6jVH6I';

const { createClient } = require('@supabase/supabase-js');

async function testNewsEventsCreation() {
  console.log('🧪 TESTE CORRIGIDO: Criação de Notícias/Eventos');
  console.log('=================================================\n');

  // Clientes
  const clientSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Buscar dados para teste
  console.log('1️⃣ Preparando dados para teste...');
  
  const { data: adminUser, error: userError } = await adminSupabase
    .from('profiles')
    .select('id, email, role')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (userError) {
    console.log('❌ Erro ao buscar usuário admin:', userError.message);
    return;
  }

  const { data: sector } = await adminSupabase
    .from('sectors')
    .select('id, name')
    .limit(1)
    .single();

  const { data: subsector } = await adminSupabase
    .from('subsectors')
    .select('id, name, sector_id')
    .limit(1)
    .single();

  if (!adminUser || !sector || !subsector) {
    console.log('❌ Faltam dados básicos:', { adminUser: !!adminUser, sector: !!sector, subsector: !!subsector });
    return;
  }

  console.log('✅ Dados preparados:');
  console.log(`   Admin: ${adminUser.email}`);
  console.log(`   Setor: ${sector.name}`);
  console.log(`   Subsetor: ${subsector.name}`);

  // Teste 1: Cliente anônimo (simular frontend sem autenticação)
  console.log('\n2️⃣ TESTE: Cliente anônimo (frontend sem auth)');
  console.log('--------------------------------------------------');

  try {
    const { data: newsClient, error: newsClientError } = await clientSupabase
      .from('sector_news')
      .insert({
        title: 'Teste Client Anônimo',
        summary: 'Resumo teste',
        content: 'Conteúdo teste',
        sector_id: sector.id,
        created_by: adminUser.id,
        is_published: false
      })
      .select()
      .single();

    if (newsClientError) {
      console.log('❌ Erro esperado (anônimo):', newsClientError.message);
      console.log('📝 Código:', newsClientError.code);
      console.log('📝 Details:', newsClientError.details);
    } else {
      console.log('⚠️  PROBLEMA: Criação funcionou sem autenticação!', newsClient.id);
    }
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }

  // Teste 2: Service role (simular backend autenticado)
  console.log('\n3️⃣ TESTE: Service role (backend autenticado)');
  console.log('------------------------------------------------');

  const testData = {
    news: {
      title: 'Teste Service Role News',
      summary: 'Resumo da notícia teste',
      content: 'Conteúdo completo da notícia teste',
      sector_id: sector.id,
      created_by: adminUser.id,
      is_published: false
    },
    event: {
      title: 'Teste Service Role Event',
      description: 'Descrição do evento teste',
      location: 'Local teste',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      sector_id: sector.id,
      created_by: adminUser.id,
      is_published: false
    },
    subsectorNews: {
      title: 'Teste Subsector News',
      summary: 'Resumo notícia subsetor',
      content: 'Conteúdo notícia subsetor',
      subsector_id: subsector.id,
      created_by: adminUser.id,
      is_published: false
    },
    subsectorEvent: {
      title: 'Teste Subsector Event',
      description: 'Descrição evento subsetor',
      location: 'Local subsetor',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      subsector_id: subsector.id,
      created_by: adminUser.id,
      is_published: false
    }
  };

  const results = {};

  // Testar todas as operações
  for (const [type, data] of Object.entries(testData)) {
    let table;
    
    if (type === 'subsectorNews') {
      table = 'subsector_news';
    } else if (type === 'subsectorEvent') {
      table = 'subsector_events';
    } else if (type === 'news') {
      table = 'sector_news';
    } else if (type === 'event') {
      table = 'sector_events';
    }

    try {
      console.log(`\n   Testando ${type} na tabela ${table}...`);
      
      const { data: result, error } = await adminSupabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        console.log(`   ❌ Erro ${type}:`, error.message);
        console.log(`   📋 Erro detalhado:`, error);
        results[type] = { success: false, error: error.message };
      } else {
        console.log(`   ✅ ${type} criado:`, result.id);
        results[type] = { success: true, id: result.id };
      }
    } catch (error) {
      console.log(`   💥 Erro fatal ${type}:`, error.message);
      results[type] = { success: false, error: error.message };
    }
  }

  // Teste 3: Verificar dados criados
  console.log('\n4️⃣ VERIFICAÇÃO: Dados criados');
  console.log('--------------------------------');

  for (const [type, result] of Object.entries(results)) {
    if (result.success) {
      let table;
      
      if (type === 'subsectorNews') {
        table = 'subsector_news';
      } else if (type === 'subsectorEvent') {
        table = 'subsector_events';
      } else if (type === 'news') {
        table = 'sector_news';
      } else if (type === 'event') {
        table = 'sector_events';
      }

      const { data: verify } = await adminSupabase
        .from(table)
        .select('id, title, created_by, updated_at')
        .eq('id', result.id)
        .single();

      if (verify) {
        console.log(`✅ ${type}: ${verify.title} (${verify.updated_at})`);
      }
    }
  }

  // Limpeza
  console.log('\n5️⃣ LIMPEZA: Removendo dados de teste');
  console.log('-------------------------------------');

  for (const [type, result] of Object.entries(results)) {
    if (result.success) {
      let table;
      
      if (type === 'subsectorNews') {
        table = 'subsector_news';
      } else if (type === 'subsectorEvent') {
        table = 'subsector_events';
      } else if (type === 'news') {
        table = 'sector_news';
      } else if (type === 'event') {
        table = 'sector_events';
      }

      await adminSupabase
        .from(table)
        .delete()
        .eq('id', result.id);
      
      console.log(`🧹 ${type} removido`);
    }
  }

  // Relatório final
  console.log('\n🎯 RELATÓRIO FINAL');
  console.log('==================');
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Sucessos: ${successCount}/${totalTests}`);
  console.log(`❌ Falhas: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n💡 CONCLUSÃO: Políticas RLS funcionam com service role');
    console.log('🔍 PROBLEMA REAL: Autenticação no frontend (cookies/sessão)');
    console.log('📋 PRÓXIMO PASSO: Verificar login e sessão no browser');
  } else {
    console.log('\n⚠️  CONCLUSÃO: Ainda há problemas nas políticas RLS');
    console.log('🔧 Verificar políticas e estrutura das tabelas');
  }

  console.log('\n📌 RECOMENDAÇÕES:');
  console.log('1. Verificar se login está criando sessão no browser');
  console.log('2. Verificar se cookies estão sendo preservados');
  console.log('3. Testar com usuário real no frontend');
  console.log('4. Verificar middleware de autenticação');
}

testNewsEventsCreation().catch(error => {
  console.error('💥 Erro fatal no teste:', error);
});