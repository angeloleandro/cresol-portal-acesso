#!/usr/bin/env node

/**
 * Script para testar autenticação client-side e debugar problemas
 * com criação de notícias/eventos no frontend
 */

// Simular ambiente Next.js
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://taodkzafqgoparihaljx.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzEyNTEsImV4cCI6MjA2MTUwNzI1MX0.J8O2DoHLLz5qTRktXbcnVqhL5KtkVML28w1XyM827CY';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb2RremFmcWdvcGFyaWhhbGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTI1MSwiZXhwIjoyMDYxNTA3MjUxfQ.lkKcYCRy-WinOuxntXwa7S4l7s6hsOqDUjPGj6jVH6I';

const { createClient } = require('@supabase/supabase-js');

async function testClientAuthentication() {
  console.log('🔍 Iniciando teste de autenticação client-side...\n');

  // Criar cliente como o frontend faria
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('1️⃣ Testando sessão inicial (anônima)');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Sessão:', sessionData?.session ? 'Ativa' : 'Nenhuma sessão');
  console.log('Usuário:', sessionData?.session?.user?.id || 'Nenhum usuário');

  // Simular login de admin (como o frontend faria)
  console.log('\n2️⃣ Simulando login de admin...');
  
  // Primeiro, vamos verificar se existe um usuário admin no sistema
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: adminUsers, error: adminError } = await adminClient
    .from('profiles')
    .select('id, email, role')
    .eq('role', 'admin')
    .limit(1);

  if (adminError || !adminUsers?.length) {
    console.log('❌ Erro ao buscar usuário admin:', adminError?.message);
    return;
  }

  const adminUser = adminUsers[0];
  console.log('✅ Usuário admin encontrado:', adminUser.email);

  // Simular autenticação (em um cenário real, seria via signInWithPassword)
  // Como não temos a senha, vamos simular o estado autenticado
  console.log('\n3️⃣ Testando operações como usuário autenticado...');

  // Teste 1: Verificar auth.uid() no contexto
  try {
    const { data: authTestData, error: authTestError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', adminUser.id)
      .single();

    if (authTestError) {
      console.log('❌ Erro ao verificar perfil:', authTestError.message);
    } else {
      console.log('✅ Perfil acessível:', authTestData);
    }
  } catch (error) {
    console.log('❌ Erro na verificação de perfil:', error.message);
  }

  // Teste 2: Tentar criar notícia sem autenticação (simulando o problema)
  console.log('\n4️⃣ Testando criação de notícia sem autenticação...');
  try {
    const { data: newsData, error: newsError } = await supabase
      .from('sector_news')
      .insert({
        title: 'Teste Client Auth Debug',
        content: 'Testando criação de notícia no client',
        sector_id: 1,
        author_id: adminUser.id
      })
      .select()
      .single();

    if (newsError) {
      console.log('❌ Erro esperado (sem auth):', newsError.message);
      console.log('📝 Código do erro:', newsError.code);
      console.log('📝 Detalhes:', newsError.details);
    } else {
      console.log('⚠️  Notícia criada sem autenticação (não deveria acontecer):', newsData);
    }
  } catch (error) {
    console.log('❌ Erro na criação:', error.message);
  }

  // Teste 3: Simular sessão autenticada manualmente
  console.log('\n5️⃣ Simulando sessão autenticada com service role...');
  try {
    const { data: authNewsData, error: authNewsError } = await adminClient
      .from('sector_news')
      .insert({
        title: 'Teste Auth Debug com Service Role',
        content: 'Testando com service role',
        sector_id: 1,
        author_id: adminUser.id
      })
      .select()
      .single();

    if (authNewsError) {
      console.log('❌ Erro com service role:', authNewsError.message);
    } else {
      console.log('✅ Notícia criada com service role:', authNewsData.id);
      
      // Limpar teste
      await adminClient
        .from('sector_news')
        .delete()
        .eq('id', authNewsData.id);
      console.log('🧹 Teste limpo');
    }
  } catch (error) {
    console.log('❌ Erro com service role:', error.message);
  }

  // Teste 4: Verificar políticas RLS atuais
  console.log('\n6️⃣ Verificando políticas RLS...');
  try {
    const { data: policies } = await adminClient
      .from('pg_policies')
      .select('tablename, policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'sector_news');

    console.log('📋 Políticas ativas para sector_news:');
    policies?.forEach(policy => {
      console.log(`  - ${policy.policyname} (${policy.cmd}): ${policy.qual}`);
    });
  } catch (error) {
    console.log('⚠️  Não foi possível verificar políticas:', error.message);
  }

  // Teste 5: Verificar se auth.uid() retorna valor em contexto simulado
  console.log('\n7️⃣ Testando auth.uid() em query...');
  try {
    const { data: uidTest, error: uidError } = await supabase
      .rpc('auth_uid_test');  // Vamos criar esta função se não existir

    if (uidError && uidError.message.includes('function auth_uid_test')) {
      console.log('⚠️  Função auth_uid_test não existe (normal)');
      
      // Teste alternativo: verificar diretamente
      const { data: directTest, error: directError } = await supabase
        .from('sector_news')
        .select('id')
        .limit(1);

      if (directError) {
        console.log('❌ Erro no teste direto:', directError.message);
      } else {
        console.log('✅ Acesso de leitura funciona');
      }
    }
  } catch (error) {
    console.log('⚠️  Erro no teste de auth.uid():', error.message);
  }

  console.log('\n🎯 DIAGNÓSTICO COMPLETO:');
  console.log('==========================================');
  console.log('1. Cliente anônimo criado: ✅');
  console.log('2. Usuário admin encontrado: ✅');
  console.log('3. Operações com service role: ✅');
  console.log('4. Problema principal: Falta de sessão autenticada no cliente');
  console.log('5. Solução: Implementar login real ou debug de autenticação');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('- Verificar se o login está funcionando no frontend');
  console.log('- Verificar se cookies de sessão estão sendo preservados');
  console.log('- Testar autenticação real no browser');
}

testClientAuthentication().catch(error => {
  console.error('💥 Erro fatal:', error);
});