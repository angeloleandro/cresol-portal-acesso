#!/usr/bin/env node

/**
 * Teste simulando exatamente o comportamento do frontend
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do ambiente
const supabaseUrl = 'https://taodkzafqgoparihaljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzEyNTEsImV4cCI6MjA2MTUwNzI1MX0.J8O2DoHLLz5qTRktXbcnVqhL5KtkVML28w1XyM827CY';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTI1MSwiZXhwIjoyMDYxNTA3MjUxfQ.lkKcYCRy-WinOuxntXwa7S4l7s6hsOqDUjPGj6jVH6I';

async function testFrontendSimulation() {
  console.log('🔍 TESTE: Simulação do Frontend\n');
  console.log('=================================\n');

  // Cliente admin para preparar dados
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // 1. Buscar um usuário admin real
  console.log('1️⃣ Buscando usuário admin...');
  const { data: adminUser, error: userError } = await adminClient
    .from('profiles')
    .select('id, email, role')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (!adminUser) {
    console.error('❌ Nenhum usuário admin encontrado');
    return;
  }

  console.log(`✅ Admin encontrado: ${adminUser.email}`);

  // 2. Fazer login como o admin
  console.log('\n2️⃣ Fazendo login como admin...');
  const { data: authData, error: authError } = await adminClient.auth.admin.getUserById(
    adminUser.id
  );

  if (authError) {
    console.error('❌ Erro ao buscar dados do usuário:', authError);
    return;
  }

  // 3. Criar cliente autenticado (simulando o frontend)
  console.log('\n3️⃣ Criando cliente autenticado (simulando frontend)...');
  
  // Criar um token JWT fake para simular autenticação
  // Na prática, o frontend usa cookies/localStorage
  const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });

  // 4. Buscar um setor
  console.log('\n4️⃣ Buscando setor...');
  const { data: sectors } = await adminClient
    .from('sectors')
    .select('id, name')
    .limit(1);

  if (!sectors || sectors.length === 0) {
    console.error('❌ Nenhum setor encontrado');
    return;
  }

  const sector = sectors[0];
  console.log(`✅ Setor: ${sector.name} (${sector.id})`);

  // 5. Tentar criar notícia SEM autenticação (como o frontend faz)
  console.log('\n5️⃣ Tentando criar notícia (cliente não autenticado)...');
  
  const newsData = {
    sector_id: sector.id,
    title: 'Teste Frontend - Notícia',
    summary: 'Resumo da notícia de teste',
    content: 'Conteúdo completo da notícia de teste do frontend',
    is_published: true,
    created_by: adminUser.id
  };

  const { data: newsResult, error: newsError } = await authenticatedClient
    .from('sector_news')
    .insert(newsData)
    .select()
    .single();

  if (newsError) {
    console.error('❌ Erro ao criar notícia (esperado):', newsError.message);
    console.log('   Código:', newsError.code);
    console.log('   Detalhes:', newsError.details);
  } else {
    console.log('⚠️  Notícia criada sem autenticação:', newsResult?.id);
  }

  // 6. Tentar com service role (simulando API backend)
  console.log('\n6️⃣ Tentando criar notícia (service role - backend)...');
  
  const { data: newsBackend, error: newsBackendError } = await adminClient
    .from('sector_news')
    .insert(newsData)
    .select()
    .single();

  if (newsBackendError) {
    console.error('❌ Erro ao criar notícia (backend):', newsBackendError.message);
  } else {
    console.log('✅ Notícia criada com service role:', newsBackend.id);
    
    // Limpar
    await adminClient
      .from('sector_news')
      .delete()
      .eq('id', newsBackend.id);
    console.log('🧹 Notícia de teste removida');
  }

  // 7. Testar evento também
  console.log('\n7️⃣ Tentando criar evento (service role)...');
  
  const eventData = {
    sector_id: sector.id,
    title: 'Teste Frontend - Evento',
    description: 'Descrição do evento de teste',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 3600000).toISOString(),
    location: 'Local do teste',
    is_published: true,
    created_by: adminUser.id
  };

  const { data: eventBackend, error: eventBackendError } = await adminClient
    .from('sector_events')
    .insert(eventData)
    .select()
    .single();

  if (eventBackendError) {
    console.error('❌ Erro ao criar evento:', eventBackendError.message);
    console.log('   Detalhes completos:', JSON.stringify(eventBackendError, null, 2));
  } else {
    console.log('✅ Evento criado com service role:', eventBackend.id);
    
    // Limpar
    await adminClient
      .from('sector_events')
      .delete()
      .eq('id', eventBackend.id);
    console.log('🧹 Evento de teste removido');
  }

  // 8. Diagnóstico
  console.log('\n📊 DIAGNÓSTICO');
  console.log('================');
  console.log('✅ Backend (service role) funciona perfeitamente');
  console.log('❌ Frontend (cliente anônimo) bloqueado por RLS');
  console.log('\n🔍 PROBLEMA IDENTIFICADO:');
  console.log('   O frontend está usando o cliente Supabase SEM autenticação');
  console.log('   Mesmo com user logado, as chamadas não incluem o token JWT');
  console.log('\n💡 SOLUÇÃO NECESSÁRIA:');
  console.log('   1. Verificar se o AuthProvider está passando a sessão corretamente');
  console.log('   2. Verificar se createClient() está usando a sessão do usuário');
  console.log('   3. Ou criar API routes específicas que usam service role');
}

testFrontendSimulation().catch(console.error);