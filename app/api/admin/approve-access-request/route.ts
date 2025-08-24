import { NextResponse } from 'next/server';


import { CreateAdminSupabaseClient } from '@/lib/auth';
import { GenerateTemporaryPassword } from '@/lib/constants';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';


interface AccessRequestData {
  email: string;
  full_name: string;
  position: string;
  work_location_id: string;
  status: string;
  password_hash?: string;
}

// Helper function to fetch access request data with fallback for password_hash field
async function fetchAccessRequestData(
  supabaseClient: SupabaseClient<any, "public", any>, 
  accessRequestId: string
): Promise<{ data: AccessRequestData | null; error: any }> {
  // Try to fetch with password_hash first
  const resultWithPassword = await supabaseClient
    .from('access_requests')
    .select('email, full_name, position, work_location_id, status, password_hash')
    .eq('id', accessRequestId)
    .single();
  
  // If successful, return the result
  if (!resultWithPassword.error) {
    return { data: resultWithPassword.data as AccessRequestData, error: null };
  }
  
  // If failed due to password_hash field not existing, try fallback
  if (resultWithPassword.error && (
    resultWithPassword.error.message?.includes('password_hash') || 
    resultWithPassword.error.message?.includes('schema cache') ||
    resultWithPassword.error.code === '42703'
  )) {
    const fallbackResult = await supabaseClient
      .from('access_requests')
      .select('email, full_name, position, work_location_id, status')
      .eq('id', accessRequestId)
      .single();
    
    return { 
      data: fallbackResult.data as AccessRequestData, 
      error: fallbackResult.error 
    };
  }
  
  // Return original error if it wasn't related to password_hash field
  return { data: null, error: resultWithPassword.error };
}

// Helper function to update user password with retry mechanism
async function updateUserPassword(
  supabaseClient: SupabaseClient,
  userId: string,
  password: string,
  context: string = 'UNKNOWN',
  retryCount: number = 0
): Promise<{ success: boolean; error?: any }> {
  const maxRetries = 2;
  
  // Para novos usuários, aguardar propagação antes do primeiro retry
  if (context === 'NEW_USER_CREATED' && retryCount > 0) {
    const waitTime = retryCount * 1000; // 1s, 2s
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  const { data: updateResult, error } = await supabaseClient.auth.admin.updateUserById(
    userId,
    { password }
  );
  
  if (error) {
    console.error(`Password update failed (attempt ${retryCount + 1}):`, error.message);
    
    // Retry logic para casos específicos
    if (retryCount < maxRetries && (
      context === 'NEW_USER_CREATED' || 
      error.message?.includes('not found') ||
      error.message?.includes('invalid')
    )) {
      return updateUserPassword(supabaseClient, userId, password, context, retryCount + 1);
    }
    
    return { success: false, error };
  }
  
  // Verificação pós-update para confirmar se senha foi realmente definida
  try {
    await supabaseClient.auth.admin.getUserById(userId);
  } catch (verifyErr) {

  }
  return { success: true };
}

/**
 * POST function
 * @todo Add proper documentation
 */
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
    supabaseAdminClient = CreateAdminSupabaseClient();
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

        return NextResponse.json({ 
          error: 'Token de administrador inválido ou expirado.' 
        }, { status: 401 });
      }
      
      currentAdminId = user.id;
    } else if (adminUserId) {
      // Método legado usando adminUserId  
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

    // 1. Obter dados da access_requests incluindo senha armazenada (se existir)
    const { data: requestData, error: requestError } = await fetchAccessRequestData(
      supabaseAdminClient, 
      accessRequestId
    );

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
        
        const userPassword = requestData?.password_hash || GenerateTemporaryPassword();
        
        // Aprovando usuário existente
        
        const { success, error: passwordError } = await updateUserPassword(
          supabaseAdminClient,
          authUserId!, // TypeScript assertion - we know it's not null here
          userPassword,
          'EXISTING_PROFILE'
        );
        
        if (!success) {
          return NextResponse.json({ 
            error: `Perfil existe mas falha ao atualizar senha: ${passwordError?.message || 'Erro desconhecido'}` 
          }, { status: 500 });
        }
        
      } else {
        // Não existe perfil, tentar criar um novo usuário Auth
        // Usar a senha inicial fornecida pelo usuário (se disponível) ou gerar senha aleatória
        const userPassword = requestData?.password_hash || GenerateTemporaryPassword();
        
        // Criando novo usuário
        
        try {
          // CORREÇÃO CRÍTICA: usar createUser com senha diretamente em vez de updateUserById posterior
          const { data: newAuthUserResponse, error: createAuthUserError } = await supabaseAdminClient.auth.admin.createUser({
            email: userEmail,
            password: userPassword,  // DEFINIR SENHA DIRETAMENTE NA CRIAÇÃO
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
              
              if (authUserId) {
                const userPasswordForExisting = requestData?.password_hash || GenerateTemporaryPassword();
                // Usuário já existe, atualizando senha
                
                const { success, error: passwordError } = await updateUserPassword(
                  supabaseAdminClient,
                  authUserId!, // TypeScript assertion - we know it's not null here
                  userPasswordForExisting,
                  'USER_ALREADY_EXISTS'
                );
                
                if (!success) {
                  return NextResponse.json({ 
                    error: `Usuário existe mas falha ao atualizar senha: ${passwordError?.message || 'Erro desconhecido'}` 
                  }, { status: 500 });
                }
                
              }
            } else {
              // FALLBACK HÍBRIDO: Se createUser com senha falhar por outro motivo, 
              // tentar abordagem híbrida (createUser sem senha + updateUserById)
              // Fallback: criar usuário sem senha e depois atualizar
              const userPassword = requestData?.password_hash || GenerateTemporaryPassword();
              
              const { data: fallbackAuthResponse, error: fallbackCreateError } = await supabaseAdminClient.auth.admin.createUser({
                email: userEmail,
                email_confirm: true,
                user_metadata: { full_name: userFullName }
                // SEM password - será definido via updateUserById
              });
              
              if (fallbackCreateError) {
                return NextResponse.json({ 
                  error: `Falha tanto na criação direta quanto no fallback: ${fallbackCreateError.message}` 
                }, { status: 500 });
              }
              
              if (fallbackAuthResponse?.user) {
                authUserId = fallbackAuthResponse.user.id;
                // Usuário criado sem senha
                
                // Agora definir senha via updateUserById com retry
                const { success, error: passwordError } = await updateUserPassword(
                  supabaseAdminClient,
                  authUserId,
                  userPassword,
                  'NEW_USER_CREATED'
                );
                
                if (!success) {
                  return NextResponse.json({ 
                    error: `FALLBACK - Usuário criado mas falha ao definir senha: ${passwordError?.message || 'Erro desconhecido'}` 
                  }, { status: 500 });
                }
                
                // Senha definida com sucesso
              } else {
                return NextResponse.json({ error: 'FALLBACK - Falha ao criar usuário sem senha' }, { status: 500 });
              }
            }
          } else if (newAuthUserResponse?.user) {
            authUserId = newAuthUserResponse.user.id;
            
            // Usuário criado com sucesso e senha definida
            
            // SENHA JÁ FOI DEFINIDA NA CRIAÇÃO - não precisa de updateUserById
            // Verificação opcional para confirmar que usuário foi criado corretamente
            try {
              await supabaseAdminClient.auth.admin.getUserById(authUserId);
            } catch (verifyErr) {

            }
            
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
        id: authUserId!,
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