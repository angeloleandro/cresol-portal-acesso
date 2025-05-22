import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// É crucial que a key de serviço esteja disponível como variável de ambiente
// e NUNCA seja exposta no lado do cliente.
// Ex: SUPABASE_SERVICE_ROLE_KEY no seu .env.local
// const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: NextRequest) {
  const { accessRequestId, adminUserId, adminToken, editedUserData, targetStatus } = await request.json();

  if (!accessRequestId || !editedUserData || !editedUserData.email || !editedUserData.full_name || !targetStatus) {
    return NextResponse.json({ error: 'Dados insuficientes (targetStatus faltando?).' }, { status: 400 });
  }

  if (targetStatus !== 'approved' && targetStatus !== 'rejected') {
    return NextResponse.json({ error: 'targetStatus inválido.' }, { status: 400 });
  }

  let supabaseAdminClient: SupabaseClient;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Configuração do servidor incompleta.');
    }
    supabaseAdminClient = createClient(supabaseUrl, serviceKey, { 
      auth: { persistSession: false } 
    });
  } catch (e) {
    return NextResponse.json({ error: 'Erro na configuração do servidor.' }, { status: 500 });
  }

  try {
    // Verificar autenticação do administrador
    let currentAdminId;

    if (adminToken) {
      // Verificar o token fornecido
      const { data: { user }, error: authError } = await supabaseAdminClient.auth.getUser(adminToken);
      
      if (authError || !user) {
        console.error('Erro ao verificar token admin:', authError);
        return NextResponse.json({ 
          error: 'Token de administrador inválido ou expirado.' 
        }, { status: 401 });
      }
      
      currentAdminId = user.id;
    } else if (adminUserId) {
      // Método legado usando adminUserId
      console.warn('Método legado: usando adminUserId sem token');
      currentAdminId = adminUserId;
    } else {
      return NextResponse.json({ error: 'Credenciais de administrador não fornecidas.' }, { status: 401 });
    }
    
    // Verificar se o usuário que faz a solicitação é um administrador
    const { data: adminProfile, error: adminError } = await supabaseAdminClient
      .from('profiles')
      .select('role')
      .eq('id', currentAdminId)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: 'Falha ao verificar permissões de administrador.' }, { status: 403 });
    }

    if (adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem processar solicitações de acesso.' }, { status: 403 });
    }

    // 1. Obter dados da access_requests
    const { data: requestData, error: requestError } = await supabaseAdminClient
      .from('access_requests')
      .select('email, full_name, position, work_location_id, status')
      .eq('id', accessRequestId)
      .single();

    if (requestError) {
      return NextResponse.json({ error: 'Erro ao buscar solicitação de acesso.' }, { status: 500 });
    }
    if (!requestData) {
      return NextResponse.json({ error: `Solicitação de acesso não encontrada (ID: ${accessRequestId}).` }, { status: 404 });
    }

    const userEmail = editedUserData.email.trim();
    const userFullName = editedUserData.full_name.trim();

    if (targetStatus === 'approved') {
      // Verificar primeiro se o usuário já existe no Auth ou no perfil
      let authUserId: string | null = null;
      
      // Primeiro verificar se já existe um perfil com este email
      const { data: existingProfile, error: profileLookupError } = await supabaseAdminClient
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();
      
      if (profileLookupError) {
        // Continue silenciosamente
      } else if (existingProfile) {
        // Já existe um perfil, usar este ID
        authUserId = existingProfile.id;
      } else {
        // Não existe perfil, tentar criar um novo usuário Auth
        const tempPassword = Math.random().toString(36).slice(-10);
        try {
          const { data: newAuthUserResponse, error: createAuthUserError } = await supabaseAdminClient.auth.admin.createUser({
            email: userEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: userFullName }
          });

          if (createAuthUserError) {
            // Se o erro for que o usuário já existe, tentar buscar o ID pelo auth
            if (createAuthUserError.message.toLowerCase().includes('user already registered')) {
              // Buscar usuário pelo email diretamente na tabela auth.users
              const { data: authUsers, error: authLookupError } = await supabaseAdminClient
                .from('auth.users')
                .select('id')
                .eq('email', userEmail)
                .maybeSingle();
              
              if (authLookupError) {
                // Alternativa: usar SQL para buscar o usuário diretamente
                const { data: sqlUsers, error: sqlError } = await supabaseAdminClient.rpc(
                  'get_user_by_email',
                  { user_email: userEmail }
                );
                
                if (sqlError || !sqlUsers) {
                  return NextResponse.json({ 
                    error: `Erro ao buscar usuário existente: ${sqlError?.message || 'Usuário não encontrado'}` 
                  }, { status: 500 });
                }
                
                authUserId = sqlUsers.id;
              } else if (authUsers) {
                authUserId = authUsers.id;
              } else {
                return NextResponse.json({ error: 'Usuário já existe, mas não foi possível recuperar seus dados' }, { status: 500 });
              }
            } else {
              // Outro erro durante a criação do usuário
              return NextResponse.json({ error: `Falha ao criar usuário no sistema de autenticação: ${createAuthUserError.message}` }, { status: 500 });
            }
          } else if (newAuthUserResponse?.user) {
            authUserId = newAuthUserResponse.user.id;
          } else {
            return NextResponse.json({ error: 'Falha ao criar usuário: resposta inválida do sistema de autenticação.' }, { status: 500 });
          }
        } catch (authError: unknown) {
          const errorMessage = authError instanceof Error ? authError.message : 'Erro desconhecido no sistema de autenticação';
          return NextResponse.json({ error: `Erro no sistema de autenticação: ${errorMessage}` }, { status: 500 });
        }
      }

      if (!authUserId) {
        return NextResponse.json({ error: 'Não foi possível obter ou criar o ID de autenticação do usuário.' }, { status: 500 });
      }
      
      // Determinar position e work_location_id, tratando strings vazias para work_location_id
      const finalPosition = editedUserData.position !== undefined ? editedUserData.position : requestData.position;
      let finalWorkLocationId = editedUserData.work_location_id !== undefined ? editedUserData.work_location_id : requestData.work_location_id;

      if (finalWorkLocationId === '') {
        finalWorkLocationId = null; // Converter string vazia para null para a coluna UUID
      }

      const profileDataToUpsert = {
        id: authUserId,
        email: userEmail,
        full_name: userFullName,
        position: finalPosition,
        work_location_id: finalWorkLocationId, // Usar o valor tratado
        role: 'user',
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabaseAdminClient
        .from('profiles')
        .upsert(profileDataToUpsert, { onConflict: 'id' }); // Conflito no ID para atualizar se já existir

      if (profileError) {
        // Se o erro for de FK violation (23503), pode indicar que o authUserId não existe em auth.users, o que seria estranho aqui.
        return NextResponse.json({ error: `Falha ao atualizar ou criar perfil do usuário: ${profileError.message}` }, { status: 500 });
      }
    }

    // 4. Atualizar a solicitação de acesso
    const { error: updateRequestError } = await supabaseAdminClient
      .from('access_requests')
      .update({
        status: targetStatus,
        processed_by: currentAdminId,
        updated_at: new Date().toISOString(),
        // Atualizar campos na access_request com os dados confirmados/editados
        full_name: userFullName,
        email: userEmail, // Manter o email consistente aqui também
        position: editedUserData.position, // Atualiza na access_requests também
        // Tratar string vazia para work_location_id também na atualização de access_requests
        work_location_id: editedUserData.work_location_id === '' ? null : editedUserData.work_location_id,
      })
      .eq('id', accessRequestId);

    if (updateRequestError) {
      return NextResponse.json({ error: `Falha ao finalizar atualização da solicitação de acesso: ${updateRequestError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: `Solicitação definida como ${targetStatus} com sucesso!` });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor ao processar a aprovação.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 