// deno-lint-ignore-file
// Isso é apenas para o ambiente de desenvolvimento local
// No ambiente Deno da Supabase, o import original será usado
import { createClient } from '@supabase/supabase-js';

// Define a interface para o corpo da requisição
interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
  adminToken: string;
}

// Função principal que será executada pelo Supabase Edge Functions
Deno.serve(async (req: Request) => {
  // Configurar CORS para segurança
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    });
  }

  // Verificar se a requisição é do tipo POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Método não permitido. Apenas POST é aceito.',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  try {
    // Obter os dados do corpo da requisição
    const { userId, newPassword, adminToken }: ResetPasswordRequest = await req.json();

    // Validar os dados de entrada
    if (!userId || !newPassword || !adminToken) {
      return new Response(
        JSON.stringify({
          error: 'Dados incompletos. userId, newPassword e adminToken são obrigatórios.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Obter variáveis de ambiente para Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
    }

    // Criar um cliente admin do Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verificar o token do administrador
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(adminToken);
    
    if (authError || !adminUser) {
      return new Response(
        JSON.stringify({
          error: 'Token de administrador inválido ou expirado.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Verificar se o usuário que faz a solicitação é um administrador
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single();

    if (profileError || !adminProfile) {
      return new Response(
        JSON.stringify({
          error: 'Falha ao verificar permissões de administrador.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    if (adminProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Permissão negada. Apenas administradores podem redefinir senhas.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Redefinir a senha do usuário
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (resetError) {
      return new Response(
        JSON.stringify({
          error: `Falha ao redefinir senha: ${resetError.message}`,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha redefinida com sucesso.',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    // Capturar erros não tratados
    console.error('Erro ao processar requisição:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 