#!/usr/bin/env node

/**
 * Script de teste para diagnosticar e testar a correção do problema de autenticação
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do ambiente
const supabaseUrl = 'https://taodkzafqgoparihaljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzEyNTEsImV4cCI6MjA2MTUwNzI1MX0.J8O2DoHLLz5qTRktXbcnVqhL5KtkVML28w1XyM827CY';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTI1MSwiZXhwIjoyMDYxNTA3MjUxfQ.lkKcYCRy-WinOuxntXwa7S4l7s6hsOqDUjPGj6jVH6I';

// Email e senha do usuário admin para teste
const ADMIN_EMAIL = 'atendimento@cresolagenda.com.br';
const ADMIN_PASSWORD = 'Cresol@Agenda2024!';

async function testAuthenticationFlow() {
  console.log('🔍 TESTE COMPLETO DE AUTENTICAÇÃO E CRIAÇÃO\n');
  console.log('==========================================\n');

  // 1. Criar cliente autenticado (simulando o frontend real)
  console.log('1️⃣ Criando cliente Supabase (como o frontend faz)...');
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  // 2. Fazer login como admin
  console.log('\n2️⃣ Fazendo login como admin...');
  const { data: authData, error: loginError } = await supabaseClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  if (loginError) {
    console.error('❌ Erro no login:', loginError.message);
    return;
  }

  console.log('✅ Login bem-sucedido!');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);
  console.log('   Session:', authData.session ? 'Ativa' : 'Inativa');

  // 3. Verificar se o usuário é admin
  console.log('\n3️⃣ Verificando role do usuário...');
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Erro ao buscar perfil:', profileError.message);
    return;
  }

  console.log(`✅ Role do usuário: ${profile.role}`);

  // 4. Buscar um setor
  console.log('\n4️⃣ Buscando setor para teste...');
  const { data: sectors, error: sectorError } = await supabaseClient
    .from('sectors')
    .select('id, name')
    .limit(1);

  if (sectorError || !sectors || sectors.length === 0) {
    console.error('❌ Erro ao buscar setor:', sectorError?.message);
    return;
  }

  const sector = sectors[0];
  console.log(`✅ Setor encontrado: ${sector.name} (ID: ${sector.id})`);

  // 5. Testar criação de notícia DIRETAMENTE (sem API route)
  console.log('\n5️⃣ Tentando criar notícia DIRETAMENTE (sem API route)...');
  
  const newsData = {
    sector_id: sector.id,
    title: 'Teste Autenticado - Notícia',
    summary: 'Resumo da notícia de teste',
    content: 'Conteúdo completo da notícia de teste',
    is_published: true,
    created_by: authData.user.id
  };

  console.log('📝 Dados da notícia:', newsData);

  const { data: newsResult, error: newsError } = await supabaseClient
    .from('sector_news')
    .insert(newsData)
    .select()
    .single();

  if (newsError) {
    console.error('❌ Erro ao criar notícia diretamente:', newsError.message);
    console.log('   Código:', newsError.code);
    console.log('   Detalhes:', newsError.details);
    console.log('   Hint:', newsError.hint);
  } else {
    console.log('✅ Notícia criada com sucesso!', newsResult.id);
    
    // Limpar
    await supabaseClient
      .from('sector_news')
      .delete()
      .eq('id', newsResult.id);
    console.log('🧹 Notícia de teste removida');
  }

  // 6. Testar criação via API route
  console.log('\n6️⃣ Testando criação via API route...');
  
  const apiUrl = 'http://localhost:4000/api/admin/sector-content';
  const requestBody = {
    type: 'sector_news',
    data: newsData
  };

  console.log('📤 Enviando requisição para:', apiUrl);
  console.log('📦 Body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Passar o token de autenticação
        'Authorization': `Bearer ${authData.session?.access_token}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro na API route:', responseData.error);
      console.log('   Status:', response.status);
      console.log('   Detalhes:', responseData);
    } else {
      console.log('✅ Notícia criada via API route!', responseData.data?.id);
      
      // Limpar usando service role
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      await adminClient
        .from('sector_news')
        .delete()
        .eq('id', responseData.data.id);
      console.log('🧹 Notícia de teste removida');
    }
  } catch (error) {
    console.error('❌ Erro ao chamar API route:', error.message);
  }

  // 7. Testar evento também
  console.log('\n7️⃣ Testando criação de evento...');
  
  const eventData = {
    sector_id: sector.id,
    title: 'Teste Autenticado - Evento',
    description: 'Descrição do evento de teste',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 3600000).toISOString(),
    location: 'Local do teste',
    is_published: true,
    created_by: authData.user.id
  };

  const { data: eventResult, error: eventError } = await supabaseClient
    .from('sector_events')
    .insert(eventData)
    .select()
    .single();

  if (eventError) {
    console.error('❌ Erro ao criar evento:', eventError.message);
    console.log('   Detalhes:', eventError);
  } else {
    console.log('✅ Evento criado com sucesso!', eventResult.id);
    
    // Limpar
    await supabaseClient
      .from('sector_events')
      .delete()
      .eq('id', eventResult.id);
    console.log('🧹 Evento de teste removido');
  }

  // 8. Fazer logout
  console.log('\n8️⃣ Fazendo logout...');
  await supabaseClient.auth.signOut();
  console.log('✅ Logout realizado');

  // 9. Diagnóstico final
  console.log('\n📊 DIAGNÓSTICO FINAL');
  console.log('====================');
  
  if (!newsError && !eventError) {
    console.log('✅ SUCESSO! Criação funcionando com autenticação adequada');
    console.log('\n💡 CONCLUSÃO:');
    console.log('   O problema era que o cliente Supabase no frontend');
    console.log('   não estava usando a sessão do usuário autenticado.');
  } else {
    console.log('❌ PROBLEMA PERSISTE');
    console.log('\n🔍 POSSÍVEIS CAUSAS:');
    console.log('   1. RLS policies estão bloqueando mesmo com autenticação');
    console.log('   2. Cliente Supabase não está mantendo a sessão');
    console.log('   3. Problema com cookies/localStorage');
    console.log('\n💡 SOLUÇÃO RECOMENDADA:');
    console.log('   Usar API route com service role para operações de escrita');
  }
}

// Executar teste
testAuthenticationFlow().catch(console.error);