import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { adminCORS } from '@/lib/cors-config';

// Schema de validação para criação/edição de mensagem
const messageSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(500, 'Título deve ter no máximo 500 caracteres'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  type: z.enum(['sector', 'subsector'], { message: 'Tipo é obrigatório' }),
  sector_id: z.string().uuid().optional(),
  subsector_id: z.string().uuid().optional(),
  group_id: z.string().uuid().optional(),
  is_published: z.boolean().default(true),
  scheduled_at: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.type === 'sector' && !data.sector_id) {
      return false;
    }
    if (data.type === 'subsector' && !data.subsector_id) {
      return false;
    }
    return true;
  },
  {
    message: "sector_id é obrigatório para mensagens de setor e subsector_id para mensagens de subsetor",
    path: ["sector_id"]
  }
);

const updateMessageSchema = messageSchema.partial().extend({
  id: z.string().uuid(),
});

// Schema para filtros de busca
const searchFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['sector', 'subsector', 'all']).default('all'),
  sector_id: z.string().uuid().optional(),
  subsector_id: z.string().uuid().optional(),
  status: z.enum(['published', 'draft', 'all']).default('all'),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  author_id: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  order_by: z.enum(['created_at', 'updated_at', 'title']).default('created_at'),
  order_direction: z.enum(['asc', 'desc']).default('desc'),
});

// Função auxiliar para verificar permissões de admin
async function checkAdminPermissions(userId: string) {
  const supabase = createAdminSupabaseClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('Usuário não encontrado');
  }

  // Apenas admin geral pode acessar este endpoint
  return profile.role === 'admin';
}

// GET - Buscar todas as mensagens com filtros
export const GET = adminCORS(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const filters = searchFiltersSchema.parse(Object.fromEntries(searchParams));

    const supabase = createAdminSupabaseClient();

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
            return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
            return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
            return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Construir queries para mensagens de setor e subsetor
    let sectorMessages: any[] = [];
    let subsectorMessages: any[] = [];
    let totalCount = 0;

    // Buscar mensagens de setor
    if (filters.type === 'all' || filters.type === 'sector') {
      let sectorQuery = supabase
        .from('sector_messages')
        .select(`
          id,
          title,
          content,
          is_published,
          created_at,
          updated_at,
          sector_id,
          group_id,
          created_by,
          sectors!inner(id, name),
          message_groups(name, color_theme)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.search) {
        sectorQuery = sectorQuery.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      
      if (filters.sector_id) {
        sectorQuery = sectorQuery.eq('sector_id', filters.sector_id);
      }
      
      if (filters.status === 'published') {
        sectorQuery = sectorQuery.eq('is_published', true);
      } else if (filters.status === 'draft') {
        sectorQuery = sectorQuery.eq('is_published', false);
      }
      
      if (filters.date_from) {
        sectorQuery = sectorQuery.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        sectorQuery = sectorQuery.lte('created_at', filters.date_to);
      }

            const { data: sectorData, count: sectorCount } = await sectorQuery
        .order(filters.order_by, { ascending: filters.order_direction === 'asc' });

      // Buscar nomes dos autores das mensagens do setor
      const sectorAuthorIds = [...new Set((sectorData || []).map(msg => msg.created_by).filter(Boolean))];
      const { data: sectorAuthors } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', sectorAuthorIds);

      const sectorAuthorMap = new Map(
        (sectorAuthors || []).map(author => [
          author.id, 
          `${author.first_name} ${author.last_name}`.trim()
        ])
      );

      sectorMessages = (sectorData || []).map(msg => ({
        ...msg,
        type: 'sector',
        location_name: (msg as any).sectors?.name,
        location_id: msg.sector_id,
        author_name: sectorAuthorMap.get(msg.created_by) || 'Usuário não encontrado',
        group_name: (msg as any).message_groups?.name,
        group_color: (msg as any).message_groups?.color_theme,
      }));
      
      totalCount += sectorCount || 0;
    }

    // Buscar mensagens de subsetor
    if (filters.type === 'all' || filters.type === 'subsector') {
      let subsectorQuery = supabase
        .from('subsector_messages')
        .select(`
          id,
          title,
          content,
          is_published,
          created_at,
          updated_at,
          subsector_id,
          group_id,
          created_by,
          subsectors!inner(id, name, sectors(name)),
          message_groups(name, color_theme)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.search) {
        subsectorQuery = subsectorQuery.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      
      if (filters.subsector_id) {
        subsectorQuery = subsectorQuery.eq('subsector_id', filters.subsector_id);
      }
      
      if (filters.sector_id) {
        subsectorQuery = subsectorQuery.eq('subsectors.sector_id', filters.sector_id);
      }
      
      if (filters.status === 'published') {
        subsectorQuery = subsectorQuery.eq('is_published', true);
      } else if (filters.status === 'draft') {
        subsectorQuery = subsectorQuery.eq('is_published', false);
      }
      
      if (filters.date_from) {
        subsectorQuery = subsectorQuery.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        subsectorQuery = subsectorQuery.lte('created_at', filters.date_to);
      }

            const { data: subsectorData, count: subsectorCount } = await subsectorQuery
        .order(filters.order_by, { ascending: filters.order_direction === 'asc' });

      // Buscar nomes dos autores das mensagens do subsetor
      const subsectorAuthorIds = [...new Set((subsectorData || []).map(msg => msg.created_by).filter(Boolean))];
      const { data: subsectorAuthors } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', subsectorAuthorIds);

      const subsectorAuthorMap = new Map(
        (subsectorAuthors || []).map(author => [
          author.id, 
          `${author.first_name} ${author.last_name}`.trim()
        ])
      );

      subsectorMessages = (subsectorData || []).map(msg => ({
        ...msg,
        type: 'subsector',
        location_name: (msg as any).subsectors?.name,
        location_id: msg.subsector_id,
        sector_name: (msg as any).subsectors?.sectors?.name,
        author_name: subsectorAuthorMap.get(msg.created_by) || 'Usuário não encontrado',
        group_name: (msg as any).message_groups?.name,
        group_color: (msg as any).message_groups?.color_theme,
      }));
      
      totalCount += subsectorCount || 0;
    }

    // Combinar e ordenar mensagens
    const allMessages = [...sectorMessages, ...subsectorMessages];
    
    allMessages.sort((a, b) => {
      const aValue = a[filters.order_by];
      const bValue = b[filters.order_by];
      
      if (filters.order_direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Aplicar paginação após combinação
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedMessages = allMessages.slice(startIndex, endIndex);

    // Calcular metadados de paginação baseado no total combinado
    const actualTotalCount = allMessages.length;
    const totalPages = Math.ceil(actualTotalCount / filters.limit);
    const hasNextPage = filters.page < totalPages;
    const hasPrevPage = filters.page > 1;

    // Calcular estatísticas
    const published = allMessages.filter(m => m.is_published).length;
    const drafts = allMessages.filter(m => !m.is_published).length;

    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          currentPage: filters.page,
          totalPages,
          totalCount: actualTotalCount,
          limit: filters.limit,
          hasNextPage,
          hasPrevPage,
        },
        stats: {
          total: actualTotalCount,
          published,
          drafts,
          byType: { 
            sector: sectorMessages.length, 
            subsector: subsectorMessages.length 
          }
        },
        filters: filters,
      }
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Filtros inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('[SUPABASE-ERROR] Error in GET messages:', { 
      error: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

// POST - Criar nova mensagem
export const POST = adminCORS(async (request: NextRequest) => {
  try {
    const body = await request.json();
        
    const validatedData = messageSchema.parse(body);
    
    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Preparar dados da mensagem
    const messageData = {
      title: validatedData.title.trim(),
      content: validatedData.content.trim(),
      is_published: validatedData.is_published,
      created_by: user.id,
      group_id: validatedData.group_id || null,
      scheduled_at: validatedData.scheduled_at || null,
    };

    let newMessage;

    // Criar mensagem no local apropriado
    if (validatedData.type === 'sector') {
            
      const { data, error } = await supabase
        .from('sector_messages')
        .insert([{
          ...messageData,
          sector_id: validatedData.sector_id,
        }])
        .select(`
          *,
          sectors(name),
          message_groups(name, color_theme)
        `)
        .single();

      if (error) {
        console.error('[SUPABASE-ERROR] Error creating sector message:', {
          error: error.message,
          code: error.code,
          details: error.details,
          messageData,
          timestamp: new Date().toISOString()
        });
        return NextResponse.json(
          { error: 'Erro ao criar mensagem' },
          { status: 500 }
        );
      }

      newMessage = {
        ...data,
        type: 'sector',
        location_name: data.sectors?.name,
        location_id: data.sector_id,
        author_name: data.profiles?.full_name,
        group_name: data.message_groups?.name,
        group_color: data.message_groups?.color_theme,
      };
    } else {
      const { data, error } = await supabase
        .from('subsector_messages')
        .insert([{
          ...messageData,
          subsector_id: validatedData.subsector_id,
        }])
        .select(`
          *,
          subsectors(name, sectors(name)),
          message_groups(name, color_theme)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar mensagem de subsetor:', error);
        return NextResponse.json(
          { error: 'Erro ao criar mensagem' },
          { status: 500 }
        );
      }

      newMessage = {
        ...data,
        type: 'subsector',
        location_name: data.subsectors?.name,
        location_id: data.subsector_id,
        sector_name: data.subsectors?.sectors?.name,
        author_name: data.profiles?.full_name,
        group_name: data.message_groups?.name,
        group_color: data.message_groups?.color_theme,
      };
    }

    return NextResponse.json({
      success: true,
      message: newMessage
    }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Erro no POST messages:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

// PUT - Atualizar mensagem existente
export const PUT = adminCORS(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = updateMessageSchema.parse(body);
    const { id, type, ...updateData } = validatedData;

    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Preparar dados de atualização
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    cleanUpdateData.updated_at = new Date().toISOString();

    let updatedMessage;

    // Atualizar mensagem no local apropriado
    if (type === 'sector') {
      const { data, error } = await supabase
        .from('sector_messages')
        .update(cleanUpdateData)
        .eq('id', id)
        .select(`
          *,
          sectors(name),
          message_groups(name, color_theme)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar mensagem de setor:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar mensagem' },
          { status: 500 }
        );
      }

      updatedMessage = {
        ...data,
        type: 'sector',
        location_name: data.sectors?.name,
        location_id: data.sector_id,
        author_name: data.profiles?.full_name,
        group_name: data.message_groups?.name,
        group_color: data.message_groups?.color_theme,
      };
    } else {
      const { data, error } = await supabase
        .from('subsector_messages')
        .update(cleanUpdateData)
        .eq('id', id)
        .select(`
          *,
          subsectors(name, sectors(name)),
          message_groups(name, color_theme)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar mensagem de subsetor:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar mensagem' },
          { status: 500 }
        );
      }

      updatedMessage = {
        ...data,
        type: 'subsector',
        location_name: data.subsectors?.name,
        location_id: data.subsector_id,
        sector_name: data.subsectors?.sectors?.name,
        author_name: data.profiles?.full_name,
        group_name: data.message_groups?.name,
        group_color: data.message_groups?.color_theme,
      };
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Erro no PUT messages:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

// DELETE - Excluir mensagem
export const DELETE = adminCORS(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID e tipo da mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['sector', 'subsector'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo deve ser "sector" ou "subsector"' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Excluir mensagem do local apropriado
    const tableName = type === 'sector' ? 'sector_messages' : 'subsector_messages';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao excluir mensagem de ${type}:`, error);
      return NextResponse.json(
        { error: 'Erro ao excluir mensagem' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem excluída com sucesso'
    });

  } catch (error: any) {
    console.error('Erro no DELETE messages:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

// PATCH - Alternar status de publicação
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const action = searchParams.get('action');

    if (!id || !type || !action) {
      return NextResponse.json(
        { error: 'ID, tipo e ação são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['sector', 'subsector'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo deve ser "sector" ou "subsector"' },
        { status: 400 }
      );
    }

    if (!['publish', 'unpublish', 'duplicate'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "publish", "unpublish" ou "duplicate"' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    const tableName = type === 'sector' ? 'sector_messages' : 'subsector_messages';

    if (action === 'duplicate') {
      // Buscar mensagem original
      const { data: originalMessage, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !originalMessage) {
        return NextResponse.json(
          { error: 'Mensagem não encontrada' },
          { status: 404 }
        );
      }

      // Criar cópia
      const { title, content, sector_id, subsector_id, group_id } = originalMessage;
      const duplicatedData = {
        title: `${title} (Cópia)`,
        content,
        is_published: false, // Cópia sempre começa como rascunho
        created_by: user.id,
        group_id,
        ...(type === 'sector' ? { sector_id } : { subsector_id }),
      };

      const { data: duplicatedMessage, error: duplicateError } = await supabase
        .from(tableName)
        .insert([duplicatedData])
        .select('*')
        .single();

      if (duplicateError) {
        console.error('Erro ao duplicar mensagem:', duplicateError);
        return NextResponse.json(
          { error: 'Erro ao duplicar mensagem' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Mensagem duplicada com sucesso',
        data: duplicatedMessage
      });
    } else {
      // Publish/Unpublish
      const isPublished = action === 'publish';
      
      const { data: updatedMessage, error } = await supabase
        .from(tableName)
        .update({ 
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error(`Erro ao ${action} mensagem:`, error);
        return NextResponse.json(
          { error: `Erro ao ${action === 'publish' ? 'publicar' : 'despublicar'} mensagem` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Mensagem ${action === 'publish' ? 'publicada' : 'despublicada'} com sucesso`,
        data: updatedMessage
      });
    }

  } catch (error: any) {
    console.error('Erro no PATCH messages:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}