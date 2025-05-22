// Script para cadastrar o primeiro administrador geral
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam ser definidas no arquivo .env.local');
  process.exit(1);
}

// Configuração do Supabase utilizando variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Aqui usamos a chave anônima para operações normais
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Para usar funções administrativas, precisaríamos da chave de serviço (service_role key)
// Isso seria usado para confirmar o email sem necessidade de verificação
// NOTA: Isso é apenas para ambiente de desenvolvimento, não para produção
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function criarAdminGeral() {
  try {
    // Credenciais do admin
    const email = 'comunicacao.fronteiras@cresol.com.br';
    const senha = '@Comunica1040';
    const nomeCompleto = 'Administrador Cresol';
    const departamento = 'Comunicação';

    console.log('Iniciando cadastro do administrador geral...');
    
    // 1. Criar usuário no Auth - Usar a opção para não confirmar por email
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        data: {
          full_name: nomeCompleto
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
      }
    });

    if (signUpError) throw signUpError;
    console.log('Usuário criado com sucesso:', userData.user.id);

    // 2. Atualizar perfil como admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        full_name: nomeCompleto,
        department: departamento
      })
      .eq('id', userData.user.id);

    if (updateError) throw updateError;
    console.log('Perfil atualizado com sucesso como administrador!');

    // 3. Verificar se temos uma chave de serviço para confirmar o email automaticamente
    if (SUPABASE_SERVICE_KEY) {
      const supabaseAdmin = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);
      
      // Confirmar o email do usuário
      await supabaseAdmin.auth.admin.updateUserById(
        userData.user.id,
        { email_confirm: true }
      );
      
      console.log('Email confirmado automaticamente.');
    } else {
      console.log('⚠️ Email não foi confirmado automaticamente. Faça login no painel do Supabase para confirmar o email manualmente.');
    }

    console.log('✅ Administrador geral cadastrado com sucesso!');
    console.log('Email:', email);
    console.log('Acesse o sistema e faça login com as credenciais fornecidas.');

  } catch (error) {
    console.error('❌ Erro ao cadastrar administrador:', error.message);
  }
}

criarAdminGeral(); 