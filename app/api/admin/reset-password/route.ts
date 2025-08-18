import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const requestCookies = cookies();
  
  try {
    const { userId, newPassword, adminToken } = await request.json();

    // Log para depuração

    if (!userId || !newPassword) {
      return NextResponse.json({ 
        error: 'Dados insuficientes para redefinir a senha.' 
      }, { status: 400 });
    }

    // Inicializar o cliente Supabase Admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error('Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
      throw new Error('Configuração do servidor incompleta.');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, { 
      auth: { persistSession: false } 
    });

    // Verificar autenticação e permissões do admin
    let adminUserId;
    let isAdmin = false;

    if (adminToken) {
      // Verificar o token fornecido
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(adminToken);
      
      if (authError || !user) {
        console.error('Erro ao verificar token admin:', authError);
        return NextResponse.json({ 
          error: 'Token de administrador inválido ou expirado.' 
        }, { status: 401 });
      }
      
      adminUserId = user.id;
      
      // Verificar se o usuário é um administrador
      const { data: adminProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', adminUserId)
        .single();
      
      if (profileError) {
        console.error('Erro ao verificar perfil do admin:', profileError);
        return NextResponse.json({ 
          error: 'Não foi possível verificar permissões de administrador.' 
        }, { status: 500 });
      }
      
      isAdmin = adminProfile?.role === 'admin';
          } else {
        // Método legado usando cookies - como fallback
      
      try {
        // Tentar extrair manualmente o token do cookie
        const authCookie = requestCookies.get('sb-supabase-auth');
        if (!authCookie) {
          return NextResponse.json({ 
            error: 'Não autenticado. Sessão inválida.' 
          }, { status: 401 });
        }
        
        // Tentar obter sessão usando o token do cookie
        const cookieValue = decodeURIComponent(authCookie.value);
        const parsedValue = JSON.parse(cookieValue);
        const accessToken = parsedValue?.access_token;
        
        if (!accessToken) {
          return NextResponse.json({ 
            error: 'Não autenticado. Token não encontrado.' 
          }, { status: 401 });
        }
        
        // Verificar o token extraído do cookie
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
        
        if (authError || !user) {
          return NextResponse.json({ 
            error: 'Não autenticado. Token inválido.' 
          }, { status: 401 });
        }
        
        adminUserId = user.id;
        
        // Verificar se o usuário é um administrador
        const { data: adminProfile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', adminUserId)
          .single();
        
        if (profileError) {
          return NextResponse.json({ 
            error: 'Não foi possível verificar permissões.' 
          }, { status: 500 });
        }
        
        isAdmin = adminProfile?.role === 'admin';
      } catch (err) {
        console.error('Erro ao processar cookie:', err);
        return NextResponse.json({ 
          error: 'Erro de autenticação. Faça login novamente.' 
        }, { status: 401 });
      }
    }
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Permissão negada. Apenas administradores podem redefinir senhas.' 
      }, { status: 403 });
    }

    // Verificar se o usuário a ter a senha redefinida existe
    const { data: userToUpdate, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();
    
    if (userError || !userToUpdate) {
      console.error('Usuário não encontrado:', userError);
      return NextResponse.json({ 
        error: 'Usuário não encontrado.' 
      }, { status: 404 });
    }

    // Resetando senha do usuário
    
    // Redefinir a senha do usuário
    const { data: resetResult, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (resetError) {
      console.error('Failed to reset password:', resetError.message);
      return NextResponse.json({ 
        error: `Falha ao redefinir senha: ${resetError.message}` 
      }, { status: 500 });
    }

    // Verificação pós-update para confirmar se senha foi realmente definida
    try {
      await supabaseAdmin.auth.admin.getUserById(userId);
    } catch (verifyErr) {
      console.error('Post-update verification failed:', verifyErr);
    }
    return NextResponse.json({
      success: true,
      message: `Senha do usuário ${userToUpdate.full_name} redefinida com sucesso.`,
      userId
    });

  } catch (error: any) {
    console.error('Erro geral na API de redefinição de senha:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
} 