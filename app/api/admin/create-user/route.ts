import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const requestCookies = cookies();
  
  try {
    const { email, fullName, positionId, workLocationId, role, avatarUrl, adminToken } = await request.json();

    // Log para depuração
    console.log('API /api/admin/create-user chamada com:', { 
      email, 
      fullName, 
      positionId, 
      workLocationId, 
      role, 
      avatarUrl,
      adminTokenProvided: !!adminToken
    });

    if (!email || !fullName) {
      return NextResponse.json({ 
        error: 'Dados insuficientes para criar usuário.' 
      }, { status: 400 });
    }

    // Validar domínio de e-mail da Cresol
    if (!email.endsWith('@cresol.com.br')) {
      return NextResponse.json({ 
        error: 'Por favor, utilize um e-mail corporativo da Cresol.' 
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
        // Mas não devemos depender disso devido a problemas de parsing de cookies
      
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
        error: 'Permissão negada. Apenas administradores podem criar usuários.' 
      }, { status: 403 });
    }

    // 2. Verificar se o email já existe
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (existingProfile) {
      return NextResponse.json({ 
        error: 'Este e-mail já está cadastrado no sistema.' 
      }, { status: 409 });
    }

    // 3. Gerar uma senha temporária aleatória
    const tempPassword = Math.random().toString(36).slice(-10);
    
    // 4. Criar usuário no Auth
    const { data: newUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (createUserError) {
      console.error('Erro ao criar usuário:', createUserError);
      return NextResponse.json({ 
        error: `Falha ao criar usuário: ${createUserError.message}` 
      }, { status: 500 });
    }

    if (!newUserData.user) {
      return NextResponse.json({ 
        error: 'Erro ao criar usuário: resposta inválida do Supabase' 
      }, { status: 500 });
    }

    const userId = newUserData.user.id;

    // 5. Atualizar o perfil do usuário
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        position_id: positionId || null,
        work_location_id: workLocationId || null,
        role: role || 'user',
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateProfileError) {
      return NextResponse.json({ 
        error: `Falha ao atualizar perfil: ${updateProfileError.message}` 
      }, { status: 500 });
    }

    // 6. Adicionar usuário aos grupos automáticos baseados no cargo e local
    try {
      const groupsToAdd: string[] = [];

      // Buscar grupo automático do cargo
      if (positionId) {
        const { data: positionGroup } = await supabaseAdmin
          .from('notification_groups')
          .select('id')
          .eq('position_id', positionId)
          .eq('is_active', true)
          .single();

        if (positionGroup) {
          groupsToAdd.push(positionGroup.id);
        }
      }

      // Buscar grupo automático do local
      if (workLocationId) {
        const { data: locationGroup } = await supabaseAdmin
          .from('notification_groups')
          .select('id')
          .eq('work_location_id', workLocationId)
          .eq('is_active', true)
          .single();

        if (locationGroup) {
          groupsToAdd.push(locationGroup.id);
        }
      }

      // Adicionar usuário aos grupos encontrados
      if (groupsToAdd.length > 0) {
        const memberData = groupsToAdd.map(groupId => ({
          group_id: groupId,
          user_id: userId,
          added_by: adminUserId || userId
        }));

        const { error: membersError } = await supabaseAdmin
          .from('notification_group_members')
          .insert(memberData);

        if (membersError) {
          console.error('Erro ao adicionar usuário aos grupos automáticos:', membersError);
          // Não retornar erro, apenas logar
        }
      }
    } catch (groupError) {
      console.error('Erro ao processar grupos automáticos:', groupError);
      // Não retornar erro, apenas logar
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      tempPassword,
      userId
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 