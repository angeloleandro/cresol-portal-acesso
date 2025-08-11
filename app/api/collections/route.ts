// Collections API Routes
// CRUD completo para coleções - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { COLLECTION_CONFIG, ERROR_MESSAGES } from '@/lib/constants/collections';
import { validateCollection } from '@/lib/utils/collections';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// GET /api/collections - Listar coleções com filtros
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sort_by') || 'order_index';
    const sortOrder = searchParams.get('sort_order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || COLLECTION_CONFIG.DEFAULT_PAGE_SIZE.toString()),
      COLLECTION_CONFIG.MAX_PAGE_SIZE
    );

    // Construir query
    let query = supabase
      .from('collections')
      .select(`
        *,
        collection_items!inner(count)
      `, { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    if (status !== 'all') {
      const isActive = status === 'active';
      query = query.eq('is_active', isActive);
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Aplicar paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: collections, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar coleções:', error);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    // Calcular item_count para cada coleção
    const collectionsWithCount = collections?.map(collection => ({
      ...collection,
      item_count: collection.collection_items?.length || 0,
    })) || [];

    return NextResponse.json({
      collections: collectionsWithCount,
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > (page * limit),
    });

  } catch (error) {
    console.error('Erro na API de coleções:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}

// POST /api/collections - Criar nova coleção (apenas admins)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      cover_image_url,
      color_theme,
      type = 'mixed',
      is_active = true,
      order_index,
    } = body;

    // Validações
    const nameError = validateCollection.name(name);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const descriptionError = validateCollection.description(description || '');
    if (descriptionError) {
      return NextResponse.json({ error: descriptionError }, { status: 400 });
    }

    const colorError = validateCollection.colorTheme(color_theme || '');
    if (colorError) {
      return NextResponse.json({ error: colorError }, { status: 400 });
    }

    // Verificar se já existe coleção com mesmo nome
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('id')
      .eq('name', name)
      .single();

    if (existingCollection) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.COLLECTION_ALREADY_EXISTS },
        { status: 409 }
      );
    }

    // Calcular order_index se não fornecido
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const { data: lastCollection } = await supabase
        .from('collections')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      finalOrderIndex = (lastCollection?.order_index || 0) + COLLECTION_CONFIG.DEFAULT_ORDER_INCREMENT;
    }

    // Criar coleção
    const { data: newCollection, error: createError } = await supabase
      .from('collections')
      .insert({
        name,
        description,
        cover_image_url,
        color_theme,
        type,
        is_active,
        order_index: finalOrderIndex,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Erro ao criar coleção:', createError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        collection: { ...newCollection, item_count: 0 },
        message: 'Coleção criada com sucesso!',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro na criação de coleção:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}