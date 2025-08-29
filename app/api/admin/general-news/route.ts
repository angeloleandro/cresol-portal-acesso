import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { API_ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants/api-config';
import { CreateAdminSupabaseClient } from '@/lib/supabase/admin';
import { generalNewsSchema } from '@/app/api/admin/shared/validators';

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

// Função para operações administrativas que usam Service Role Key (bypass RLS)
function createAdminClient() {
  return CreateAdminSupabaseClient();
}

// GET - Buscar notícias gerais
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
    const authClient = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.internalError },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Apenas admin pode acessar notícias gerais
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    const supabase = createAdminClient();

    let query = supabase
      .from('general_news')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    // Se não incluir não publicados, filtrar apenas os publicados
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    
    const { data: result, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ 
      data: result || [],
      count: result?.length || 0,
      type: 'general_news',
      includeUnpublished,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST - Criar notícia geral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.internalError },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    // Validar dados com schema Zod
    const validationResult = generalNewsSchema.safeParse(data);
    
    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          fieldErrors: flattenedErrors.fieldErrors,
          formErrors: flattenedErrors.formErrors,
          timestamp: new Date().toISOString()
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Usar dados validados (isso remove campos como is_featured)
    const validatedData = validationResult.data;
    
    // Adicionar created_by
    const enrichedData = {
      ...validatedData,
      created_by: user.id
    };
    
    // USAR CLIENTE ADMIN PARA INSERÇÕES (BYPASS RLS)
    const adminClient = createAdminClient();
    
    const { data: result, error } = await adminClient
      .from('general_news')
      .insert(enrichedData)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sentData: enrichedData,
          timestamp: new Date().toISOString()
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ 
      data: result,
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT - Atualizar notícia geral
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.internalError },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    // Validar ID
    if (!data.id) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.invalidId },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Validar dados com schema Zod (exclui id, created_by, created_at da validação)
    const { id, created_by, created_at, ...dataToValidate } = data;
    
    const validationResult = generalNewsSchema.safeParse(dataToValidate);
    
    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          fieldErrors: flattenedErrors.fieldErrors,
          formErrors: flattenedErrors.formErrors,
          timestamp: new Date().toISOString()
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Usar dados validados (isso remove campos como is_featured)
    const validatedData = validationResult.data;
    
    // Preparar dados para atualização
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    };
    
    // USAR CLIENTE ADMIN PARA ATUALIZAÇÕES (BYPASS RLS)
    const adminClient = createAdminClient();
    
    const { data: result, error } = await adminClient
      .from('general_news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sentData: updateData,
          timestamp: new Date().toISOString()
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ 
      data: result,
      success: true,
      updated_id: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.internalError },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PATCH - Alternar status de notícia geral (publicar/despublicar, destacar/remover destaque)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    // Validar parâmetros obrigatórios
    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID e ação são obrigatórios' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validar ações permitidas
    if (!['publish', 'unpublish', 'feature', 'unfeature'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "publish", "unpublish", "feature" ou "unfeature"' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const authClient = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.internalError },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Determinar campo a atualizar baseado na ação
    let updateField = {};
    
    if (action === 'publish') {
      updateField = { is_published: true };
    } else if (action === 'unpublish') {
      updateField = { is_published: false };
    } else if (action === 'feature') {
      // Para notícias gerais, feature significa aumentar prioridade
      // Primeiro buscar a notícia atual para obter a prioridade
      const { data: currentNews, error: fetchError } = await authClient
        .from('general_news')
        .select('priority')
        .eq('id', id)
        .single();
      
      if (fetchError || !currentNews) {
        return NextResponse.json(
          { error: 'Notícia não encontrada' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      
      // Incrementar prioridade (máximo 10)
      updateField = { priority: Math.min(10, (currentNews.priority || 0) + 1) };
    } else if (action === 'unfeature') {
      // Reduzir prioridade para 0
      updateField = { priority: 0 };
    }
    
    // USAR CLIENTE ADMIN PARA ATUALIZAÇÕES (BYPASS RLS)
    const adminClient = createAdminClient();
    
    const { data: updatedNews, error } = await adminClient
      .from('general_news')
      .update({ 
        ...updateField,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { 
          error: `Erro ao executar ação ${action}`,
          details: error.message,
          code: error.code
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Mensagens de sucesso personalizadas
    const actionMessages = {
      publish: 'publicada',
      unpublish: 'despublicada',
      feature: 'destacada',
      unfeature: 'removida dos destaques'
    };

    return NextResponse.json({
      success: true,
      message: `Notícia ${actionMessages[action as keyof typeof actionMessages]} com sucesso`,
      data: updatedNews,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: API_ERROR_MESSAGES.internalError,
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE - Excluir notícia geral
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // USAR CLIENTE ADMIN PARA EXCLUSÕES (BYPASS RLS)
    const adminClient = createAdminClient();
    
    const { error } = await adminClient
      .from('general_news')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.internalError },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}