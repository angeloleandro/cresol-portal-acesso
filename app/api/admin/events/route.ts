import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { CreateAdminSupabaseClient } from '@/lib/supabase/admin';


// Schema de validação para criação/edição de evento
const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória').max(2000, 'Descrição deve ter no máximo 2.000 caracteres'),
  location: z.string().min(1, 'Local é obrigatório').max(500, 'Local deve ter no máximo 500 caracteres'),
  start_date: z.string().datetime('Data de início inválida'),
  end_date: z.string().datetime('Data de fim inválida').optional().or(z.literal('')),
  type: z.enum(['sector', 'subsector'], { message: 'Tipo é obrigatório' }),
  sector_id: z.string().uuid().optional(),
  subsector_id: z.string().uuid().optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
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
    message: "sector_id é obrigatório para eventos de setor e subsector_id para eventos de subsetor",
    path: ["sector_id"]
  }
).refine(
  (data) => {
    if (data.end_date && data.start_date >= data.end_date) {
      return false;
    }
    return true;
  },
  {
    message: "Data de fim deve ser posterior à data de início",
    path: ["end_date"]
  }
);

const updateEventSchema = eventSchema.partial().extend({
  id: z.string().uuid(),
});

// Schema para filtros de busca
const searchFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['sector', 'subsector', 'all']).default('all'),
  sector_id: z.string().uuid().optional(),
  subsector_id: z.string().uuid().optional(),
  status: z.enum(['published', 'draft', 'all']).default('all'),
  featured: z.enum(['featured', 'not_featured', 'all']).default('all'),
  period: z.enum(['upcoming', 'past', 'all']).default('all'),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  author_id: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  order_by: z.enum(['start_date', 'created_at', 'updated_at', 'title']).default('start_date'),
  order_direction: z.enum(['asc', 'desc']).default('asc'),
});

// Função auxiliar para verificar permissões de admin
async function checkAdminPermissions(userId: string) {
  const supabase = CreateAdminSupabaseClient();
  
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

// GET - Buscar todos os eventos com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pré-processar parâmetros para converter strings vazias em undefined
    const rawFilters = Object.fromEntries(searchParams);
    const cleanedFilters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
      // Converter strings vazias em undefined para campos UUID e datetime
      if (['sector_id', 'subsector_id', 'author_id', 'date_from', 'date_to'].includes(key) && value === '') {
        return acc; // Omitir o campo
      }
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
    
    const filters = searchFiltersSchema.parse(cleanedFilters);

    const supabase = CreateAdminSupabaseClient();

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

    const timestamp = new Date().toISOString();

    // Construir queries para eventos de setor e subsetor
    let sectorEvents: any[] = [];
    let subsectorEvents: any[] = [];
    let totalCount = 0;

    // Buscar eventos de setor
    if (filters.type === 'all' || filters.type === 'sector') {
      let sectorQuery = supabase
        .from('sector_events')
        .select(`
          id,
          title,
          description,
          location,
          start_date,
          end_date,
          is_featured,
          is_published,
          created_at,
          updated_at,
          sector_id,
          sectors!inner(id, name)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.search) {
        sectorQuery = sectorQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }
      
      if (filters.sector_id) {
        sectorQuery = sectorQuery.eq('sector_id', filters.sector_id);
      }
      
      if (filters.status === 'published') {
        sectorQuery = sectorQuery.eq('is_published', true);
      } else if (filters.status === 'draft') {
        sectorQuery = sectorQuery.eq('is_published', false);
      }
      
      if (filters.featured === 'featured') {
        sectorQuery = sectorQuery.eq('is_featured', true);
      } else if (filters.featured === 'not_featured') {
        sectorQuery = sectorQuery.eq('is_featured', false);
      }
      
      // Filtros de período
      const now = new Date().toISOString();
      if (filters.period === 'upcoming') {
        sectorQuery = sectorQuery.gte('start_date', now);
      } else if (filters.period === 'past') {
        sectorQuery = sectorQuery.lt('start_date', now);
      }
      
      if (filters.date_from) {
        sectorQuery = sectorQuery.gte('start_date', filters.date_from);
      }
      
      if (filters.date_to) {
        sectorQuery = sectorQuery.lte('start_date', filters.date_to);
      }

            const { data: sectorData, count: sectorCount } = await sectorQuery
        .order(filters.order_by, { ascending: filters.order_direction === 'asc' });

      sectorEvents = (sectorData || []).map((event: any) => ({
        ...event,
        type: 'sector',
        location_name: (event as any).sectors?.name,
        location_id: event.sector_id,
      }));
      
      totalCount += sectorCount || 0;
    }

    // Buscar eventos de subsetor
    if (filters.type === 'all' || filters.type === 'subsector') {
      let subsectorQuery = supabase
        .from('subsector_events')
        .select(`
          id,
          title,
          description,
          location,
          start_date,
          end_date,
          is_featured,
          is_published,
          created_at,
          updated_at,
          subsector_id,
          subsectors!inner(id, name, sectors(name))
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.search) {
        subsectorQuery = subsectorQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
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
      
      if (filters.featured === 'featured') {
        subsectorQuery = subsectorQuery.eq('is_featured', true);
      } else if (filters.featured === 'not_featured') {
        subsectorQuery = subsectorQuery.eq('is_featured', false);
      }
      
      // Filtros de período
      const now = new Date().toISOString();
      if (filters.period === 'upcoming') {
        subsectorQuery = subsectorQuery.gte('start_date', now);
      } else if (filters.period === 'past') {
        subsectorQuery = subsectorQuery.lt('start_date', now);
      }
      
      if (filters.date_from) {
        subsectorQuery = subsectorQuery.gte('start_date', filters.date_from);
      }
      
      if (filters.date_to) {
        subsectorQuery = subsectorQuery.lte('start_date', filters.date_to);
      }

            const { data: subsectorData, count: subsectorCount } = await subsectorQuery
        .order(filters.order_by, { ascending: filters.order_direction === 'asc' });

      subsectorEvents = (subsectorData || []).map((event: any) => ({
        ...event,
        type: 'subsector',
        location_name: (event as any).subsectors?.name,
        location_id: event.subsector_id,
        sector_name: (event as any).subsectors?.sectors?.name,
      }));
      
      totalCount += subsectorCount || 0;
    }

    // Combinar e ordenar eventos
    const allEvents = [...sectorEvents, ...subsectorEvents];
    
    allEvents.sort((a, b) => {
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
    const paginatedEvents = allEvents.slice(startIndex, endIndex);

    // Calcular metadados de paginação baseado no total combinado
    const actualTotalCount = allEvents.length;
    const totalPages = Math.ceil(actualTotalCount / filters.limit);
    const hasNextPage = filters.page < totalPages;
    const hasPrevPage = filters.page > 1;

    // Calcular estatísticas adicionais
    const now = new Date().toISOString();
    const published = allEvents.filter(e => e.is_published).length;
    const drafts = allEvents.filter(e => !e.is_published).length;
    const featured = allEvents.filter(e => e.is_featured).length;
    const upcoming = allEvents.filter(e => e.start_date >= now).length;
    const past = allEvents.filter(e => e.start_date < now).length;

    return NextResponse.json({
      success: true,
      data: {
        events: paginatedEvents,
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
          featured,
          upcoming,
          past,
          bySector: {},
          byType: { 
            sector: sectorEvents.length, 
            subsector: subsectorEvents.length 
          }
        },
        filters: filters,
      }
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const timestamp = new Date().toISOString();

      return NextResponse.json(
        { 
          error: 'Filtros inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('[SUPABASE-ERROR] Error in GET events:', { 
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
}

// POST - Criar novo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
        
    const validatedData = eventSchema.parse(body);
    
    const supabase = CreateAdminSupabaseClient();
    
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

    // Preparar dados do evento
    const eventData = {
      title: validatedData.title.trim(),
      description: validatedData.description.trim(),
      location: validatedData.location.trim(),
      start_date: validatedData.start_date,
      end_date: validatedData.end_date || null,
      is_featured: validatedData.is_featured,
      is_published: validatedData.is_published,
      created_by: user.id,
    };

    let newEvent;

    // Criar evento no local apropriado
    if (validatedData.type === 'sector') {
            
      const { data, error } = await supabase
        .from('sector_events')
        .insert([{
          ...eventData,
          sector_id: validatedData.sector_id,
        }])
        .select(`
          *,
          sectors(name)
        `)
        .single();

      if (error) {
        console.error('[SUPABASE-ERROR] Error creating sector event:', {
          error: error.message,
          code: error.code,
          details: error.details,
          eventData,
          timestamp: new Date().toISOString()
        });
        return NextResponse.json(
          { error: 'Erro ao criar evento' },
          { status: 500 }
        );
      }

      newEvent = {
        ...data,
        type: 'sector',
        location_name: data.sectors?.name,
        location_id: data.sector_id,
      };
    } else {
      const { data, error } = await supabase
        .from('subsector_events')
        .insert([{
          ...eventData,
          subsector_id: validatedData.subsector_id,
        }])
        .select(`
          *,
          subsectors(name, sectors(name))
        `)
        .single();

      if (error) {

        return NextResponse.json(
          { error: 'Erro ao criar evento' },
          { status: 500 }
        );
      }

      newEvent = {
        ...data,
        type: 'subsector',
        location_name: data.subsectors?.name,
        location_id: data.subsector_id,
        sector_name: data.subsectors?.sectors?.name,
      };
    }

    return NextResponse.json({
      success: true,
      event: newEvent
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

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar evento existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);
    const { id, type, ...updateData } = validatedData;

    const supabase = CreateAdminSupabaseClient();
    
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

    let updatedEvent;

    // Atualizar evento no local apropriado
    if (type === 'sector') {
      const { data, error } = await supabase
        .from('sector_events')
        .update(cleanUpdateData)
        .eq('id', id)
        .select(`
          *,
          sectors(name)
        `)
        .single();

      if (error) {

        return NextResponse.json(
          { error: 'Erro ao atualizar evento' },
          { status: 500 }
        );
      }

      updatedEvent = {
        ...data,
        type: 'sector',
        location_name: data.sectors?.name,
        location_id: data.sector_id,
      };
    } else {
      const { data, error } = await supabase
        .from('subsector_events')
        .update(cleanUpdateData)
        .eq('id', id)
        .select(`
          *,
          subsectors(name, sectors(name))
        `)
        .single();

      if (error) {

        return NextResponse.json(
          { error: 'Erro ao atualizar evento' },
          { status: 500 }
        );
      }

      updatedEvent = {
        ...data,
        type: 'subsector',
        location_name: data.subsectors?.name,
        location_id: data.subsector_id,
        sector_name: data.subsectors?.sectors?.name,
      };
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent
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

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir evento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID e tipo do evento são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['sector', 'subsector'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo deve ser "sector" ou "subsector"' },
        { status: 400 }
      );
    }

    const supabase = CreateAdminSupabaseClient();
    
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

    // Excluir evento do local apropriado
    const tableName = type === 'sector' ? 'sector_events' : 'subsector_events';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {

      return NextResponse.json(
        { error: 'Erro ao excluir evento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Evento excluído com sucesso'
    });

  } catch (error: any) {

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Ações especiais (publicar/despublicar, destacar, duplicar)
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

    if (!['publish', 'unpublish', 'duplicate', 'feature', 'unfeature'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "publish", "unpublish", "duplicate", "feature" ou "unfeature"' },
        { status: 400 }
      );
    }

    const supabase = CreateAdminSupabaseClient();
    
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

    const tableName = type === 'sector' ? 'sector_events' : 'subsector_events';

    if (action === 'duplicate') {
      // Buscar evento original
      const { data: originalEvent, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !originalEvent) {
        return NextResponse.json(
          { error: 'Evento não encontrado' },
          { status: 404 }
        );
      }

      // Criar cópia
      const { title, description, location, start_date, end_date, sector_id, subsector_id, is_featured } = originalEvent;
      const duplicatedData = {
        title: `${title} (Cópia)`,
        description,
        location,
        start_date,
        end_date,
        is_featured: false, // Cópia não vem destacada
        is_published: false, // Cópia sempre começa como rascunho
        created_by: user.id,
        ...(type === 'sector' ? { sector_id } : { subsector_id }),
      };

      const { data: duplicatedEvent, error: duplicateError } = await supabase
        .from(tableName)
        .insert([duplicatedData])
        .select('*')
        .single();

      if (duplicateError) {

        return NextResponse.json(
          { error: 'Erro ao duplicar evento' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Evento duplicado com sucesso',
        data: duplicatedEvent
      });
    } else {
      // Publish/Unpublish/Feature/Unfeature
      let updateField = {};
      
      if (action === 'publish') {
        updateField = { is_published: true };
      } else if (action === 'unpublish') {
        updateField = { is_published: false };
      } else if (action === 'feature') {
        updateField = { is_featured: true };
      } else if (action === 'unfeature') {
        updateField = { is_featured: false };
      }
      
      const { data: updatedEvent, error } = await supabase
        .from(tableName)
        .update({ 
          ...updateField,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {

        return NextResponse.json(
          { error: `Erro ao executar ação ${action}` },
          { status: 500 }
        );
      }

      const actionMessages = {
        publish: 'publicado',
        unpublish: 'despublicado',
        feature: 'destacado',
        unfeature: 'removido dos destaques'
      };

      return NextResponse.json({
        success: true,
        message: `Evento ${(actionMessages as any)[action]} com sucesso`,
        data: updatedEvent
      });
    }

  } catch (error: any) {

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}