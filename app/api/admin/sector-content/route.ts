import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { HTTP_STATUS, API_ERROR_MESSAGES, API_SUCCESS_MESSAGES, CONTENT_TYPES, API_VALIDATION } from '@/lib/constants/api-config';

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

// Função helper para operações de update
async function handleUpdateOperation(supabase: any, tableName: string, enrichedData: any) {
  if (!enrichedData.id) {
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.invalidId },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
  
  const { id, created_by, created_at, ...updateData } = enrichedData;
  updateData.updated_at = new Date().toISOString();
  
  const { data: result, error } = await supabase
    .from(tableName)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  return { result, error };
}

// POST - Criar notícia ou evento
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.unauthorized, 
          details: authError?.message,
          code: authError?.code,
          status: authError?.status
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.userNotFound },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.internalError,
          details: profileError.message
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.permissionDenied, 
          role: profile?.role,
          required_roles: ['admin', 'sector_admin']
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    // Parse do body
    const body = await request.json();
    const { type, action, data } = body;
    // Suportar ambos os formatos: 'type' (legado) e 'action' (novo)
    const operationType = action || type;
    
    // Validar campos obrigatórios para notícias
    if (type === CONTENT_TYPES.sectorNews || type === CONTENT_TYPES.subsectorNews) {
      if (!data.title || !data.summary || !data.content) {
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              summary: !data.summary,
              content: !data.content
            }
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    
    // Validar campos obrigatórios para eventos
    if (type === CONTENT_TYPES.sectorEvents || type === CONTENT_TYPES.subsectorEvents) {
      if (!data.title || !data.description || !data.start_date) {
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              description: !data.description,
              start_date: !data.start_date
            }
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    
    // Adicionar created_by
    const enrichedData = {
      ...data,
      created_by: user.id
    };
    
    let result;
    let error;
    
    // INSERÇÃO NO BANCO
    switch (operationType) {
      case CONTENT_TYPES.createNews:
      case CONTENT_TYPES.sectorNews:
        try {
          ({ data: result, error } = await supabase
            .from('sector_news')
            .insert(enrichedData)
            .select()
            .single());
        } catch (insertError: any) {
          error = insertError;
        }
        break;
        
      case CONTENT_TYPES.sectorEvents:
        ({ data: result, error } = await supabase
          .from('sector_events')
          .insert(enrichedData)
          .select()
          .single());
        break;
        
      case CONTENT_TYPES.subsectorNews:
        ({ data: result, error } = await supabase
          .from('subsector_news')
          .insert(enrichedData)
          .select()
          .single());
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        ({ data: result, error } = await supabase
          .from('subsector_events')
          .insert(enrichedData)
          .select()
          .single());
        break;
        
      case CONTENT_TYPES.updateNews:
        const updateNewsResult = await handleUpdateOperation(supabase, 'sector_news', enrichedData);
        if (updateNewsResult instanceof NextResponse) return updateNewsResult;
        ({ result, error } = updateNewsResult);
        break;
        
      case CONTENT_TYPES.updateSubsectorNews:
        const updateSubsectorNewsResult = await handleUpdateOperation(supabase, 'subsector_news', enrichedData);
        if (updateSubsectorNewsResult instanceof NextResponse) return updateSubsectorNewsResult;
        ({ result, error } = updateSubsectorNewsResult);
        break;
        
      case CONTENT_TYPES.updateEvent:
        const updateEventResult = await handleUpdateOperation(supabase, 'sector_events', enrichedData);
        if (updateEventResult instanceof NextResponse) return updateEventResult;
        ({ result, error } = updateEventResult);
        break;
        
      default:
        return NextResponse.json(
          { error: API_ERROR_MESSAGES.invalidType, receivedType: operationType },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    if (error) {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sentData: enrichedData
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ data: result });
    
  } catch (error: any) {
    console.error('Erro crítico no servidor:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        type: error.constructor?.name || 'Unknown',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT - Atualizar notícia ou evento
export async function PUT(request: NextRequest) {
  try {
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
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    const body = await request.json();
    const { type, id, data, sectorId, subsectorId } = body;
    
    // Determinar o ID real e o tipo correto
    let realId = id || data?.id;
    let realType = type;
    
    // Determinar o tipo correto baseado no contexto
    if (type === 'news') {
      if (sectorId) {
        realType = 'sector_news';
      } else if (subsectorId) {
        realType = 'subsector_news';
      }
    } else if (type === 'events') {
      if (sectorId) {
        realType = 'sector_events';
      } else if (subsectorId) {
        realType = 'subsector_events';
      }
    }
    
    // Validações
    if (!realId) {
      return NextResponse.json(
        { 
          error: 'ID é obrigatório para atualização',
          received: { type, id, hasData: !!data, dataId: data?.id }
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    if (!realType) {
      return NextResponse.json(
        { 
          error: 'Tipo é obrigatório',
          received: { type, sectorId, subsectorId }
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { 
          error: 'Dados de atualização são obrigatórios',
          received: { hasData: !!data, dataType: typeof data }
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Preparar dados para atualização
    const { 
      id: dataId, 
      created_by, 
      created_at, 
      ...updateData 
    } = data;
    
    // Adicionar timestamp de atualização
    updateData.updated_at = new Date().toISOString();
    
    let result;
    let error;
    
    switch (realType) {
      case CONTENT_TYPES.sectorNews:
        ({ data: result, error } = await supabase
          .from('sector_news')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        break;
        
      case CONTENT_TYPES.sectorEvents:
        ({ data: result, error } = await supabase
          .from('sector_events')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        break;
        
      case CONTENT_TYPES.subsectorNews:
        ({ data: result, error } = await supabase
          .from('subsector_news')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        ({ data: result, error } = await supabase
          .from('subsector_events')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        break;
        
      default:
        return NextResponse.json(
          { 
            error: 'Tipo inválido',
            received: realType,
            supported: ['sector_news', 'sector_events', 'subsector_news', 'subsector_events']
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ data: result });
    
  } catch (error: any) {
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.internalError },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE - Excluir notícia ou evento
export async function DELETE(request: NextRequest) {
  try {
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
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Parâmetros faltando' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    let error;
    
    switch (type) {
      case CONTENT_TYPES.sectorNews:
        ({ error } = await supabase
          .from('sector_news')
          .delete()
          .eq('id', id));
        break;
        
      case CONTENT_TYPES.sectorEvents:
        ({ error } = await supabase
          .from('sector_events')
          .delete()
          .eq('id', id));
        break;
        
      case CONTENT_TYPES.subsectorNews:
        ({ error } = await supabase
          .from('subsector_news')
          .delete()
          .eq('id', id));
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        ({ error } = await supabase
          .from('subsector_events')
          .delete()
          .eq('id', id));
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo inválido' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.internalError },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}