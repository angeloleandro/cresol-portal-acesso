import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { directUpdateUserRole } from './direct-update';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { userId, newRole, adminId, adminToken } = requestBody;

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Dados insuficientes.' }, { status: 400 });
    }

    // Validar o papel (role) enviado
    if (newRole !== 'user' && newRole !== 'sector_admin' && newRole !== 'admin') {
      return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 });
    }

    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Verificar a autenticação do administrador
    let currentAdminId;

    if (adminToken) {
      // Verificar o token fornecido
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(adminToken);
      
      if (authError || !user) {
        console.error('Erro ao verificar token admin:', authError);
        return NextResponse.json({ 
          error: 'Token de administrador inválido ou expirado.' 
        }, { status: 401 });
      }
      
      currentAdminId = user.id;
    } else if (adminId) {
      // Método legado usando adminId
      console.warn('Método legado: usando adminId sem token');
      currentAdminId = adminId;
    } else {
      return NextResponse.json({ error: 'Credenciais de administrador não fornecidas.' }, { status: 401 });
    }
    
    // Verificar se o usuário que faz a solicitação é um administrador
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', currentAdminId)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: 'Falha ao verificar permissões de administrador.' }, { status: 403 });
    }

    if (adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem alterar papéis de usuários.' }, { status: 403 });
    }

    // Impedir que o administrador altere seu próprio papel
    if (userId === currentAdminId) {
      return NextResponse.json({ error: 'Um administrador não pode alterar seu próprio papel.' }, { status: 403 });
    }

    // Verificar se o usuário a ser atualizado existe
    const { data: userToUpdate, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();

    if (userError || !userToUpdate) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    
    // Verificar se o papel é o mesmo
    if (userToUpdate.role === newRole) {
      return NextResponse.json({
        success: true,
        message: `Papel já está definido como ${newRole}.`,
        noChange: true
      });
    }

    // PRIMEIRO MÉTODO: Atualizar o papel do usuário usando o cliente admin normal
    let updateSuccess = false;
    
    try {
      const updateResult = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (!updateResult.error) {
        // Verificar se a atualização foi bem-sucedida
        const { data: verificationData, error: verificationError } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (!verificationError && verificationData.role === newRole) {
          updateSuccess = true;
        }
      }
    } catch (method1Error) {
      // Ignore and try next method
    }

    // SEGUNDO MÉTODO: Usar a função direta com SQL RPC
    if (!updateSuccess) {
      try {
        // Verificar se temos a função RPC criada
        try {
          // Tentativa de criar a função se não existir
          await supabaseAdmin.rpc('create_update_role_function');
        } catch (fnError) {
          // Pode já existir, ignorar erro
        }
        
        // Usar a função direta
        const directResult = await directUpdateUserRole(userId, newRole);
        
        if (directResult.success) {
          updateSuccess = true;
        }
      } catch (method2Error) {
        // Ignore and try next method
      }
    }
    
    // TERCEIRO MÉTODO: Último recurso - SQL direto
    if (!updateSuccess) {
      try {
        // Usar SQL direto como último recurso
        const sqlResult = await supabaseAdmin.rpc('direct_sql_update_role', {
          p_user_id: userId,
          p_new_role: newRole
        });
        
        if (!sqlResult.error) {
          // Verificar uma última vez
          const { data: finalCheck } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          
          if (finalCheck && finalCheck.role === newRole) {
            updateSuccess = true;
          }
        }
      } catch (method3Error) {
        // Last method failed, continue to final check
      }
    }

    // Verificação final e resposta
    if (updateSuccess) {
      // Retornar sucesso
      return NextResponse.json({
        success: true,
        message: `Papel de ${userToUpdate.full_name} alterado para ${newRole}.`
      });
    }
    
    return NextResponse.json({
      error: 'Não foi possível atualizar o papel do usuário após múltiplas tentativas.',
      details: {
        userId,
        currentRole: userToUpdate.role,
        requestedRole: newRole
      }
    }, { status: 500 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 