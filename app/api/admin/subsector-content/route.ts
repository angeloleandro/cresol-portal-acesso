import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


import { HTTP_STATUS, API_ERROR_MESSAGES } from '@/lib/constants/api-config';
import { CreateAdminSupabaseClient } from '@/lib/supabase/admin';


// Função para criar cliente do servidor com autenticação
async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O cookie não pode ser modificado no Server Component
          }
        },
      },
    }
  );
}

// Função para operações administrativas  
function createAdminClient() {
  return CreateAdminSupabaseClient();
}

// POST - Criar novo conteúdo do subsetor (notícia, evento ou mensagem)
export async function POST(request: NextRequest) {
  try {
    const authClient = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { data: profile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAuthorizedAdmin = profile && ['admin', 'sector_admin', 'subsector_admin'].includes(profile.role);
    
    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar conteúdo.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const body = await request.json();
    const { type, subsectorId, data } = body;
    
    if (!type || !subsectorId || !data) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const adminClient = createAdminClient();
    let tableName = '';
    
    switch (type) {
      case 'news':
        tableName = 'subsector_news';
        break;
      case 'events':
        tableName = 'subsector_events';
        break;
      case 'messages':
        tableName = 'subsector_messages';
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de conteúdo inválido' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }

    // Adicionar created_by
    const insertData = {
      ...data,
      subsector_id: subsectorId,
      created_by: user.id
    };

    const { data: result, error } = await adminClient
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conteúdo:', error);
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json({ data: result });
    
  } catch (error: any) {
    console.error('Erro no POST:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT - Atualizar conteúdo do subsetor
export async function PUT(request: NextRequest) {
  try {
    const authClient = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { data: profile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAuthorizedAdmin = profile && ['admin', 'sector_admin', 'subsector_admin'].includes(profile.role);
    
    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem atualizar conteúdo.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const body = await request.json();
    const { type, subsectorId, data } = body;
    
    if (!type || !subsectorId || !data || !data.id) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const adminClient = createAdminClient();
    let tableName = '';
    
    switch (type) {
      case 'news':
        tableName = 'subsector_news';
        break;
      case 'events':
        tableName = 'subsector_events';
        break;
      case 'messages':
        tableName = 'subsector_messages';
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de conteúdo inválido' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }

    // Remover campos que não devem ser atualizados
    const { id, created_at, created_by, ...updateData } = data;

    const { data: result, error } = await adminClient
      .from(tableName)
      .update({
        ...updateData,
        subsector_id: subsectorId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json({ data: result });
    
  } catch (error: any) {
    console.error('Erro no PUT:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE - Deletar conteúdo do subsetor
export async function DELETE(request: NextRequest) {
  try {
    const authClient = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { data: profile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAuthorizedAdmin = profile && ['admin', 'sector_admin', 'subsector_admin'].includes(profile.role);
    
    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem deletar conteúdo.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Tipo e ID são obrigatórios' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const adminClient = createAdminClient();
    let tableName = '';
    
    switch (type) {
      case 'news':
        tableName = 'subsector_news';
        break;
      case 'events':
        tableName = 'subsector_events';
        break;
      case 'messages':
        tableName = 'subsector_messages';
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de conteúdo inválido' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }

    const { error } = await adminClient
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar conteúdo:', error);
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Erro no DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}