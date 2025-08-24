import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/sectors/[id]/images - Listar imagens do setor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectorId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
    const supabase = createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar permissões
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar imagens do setor' },
        { status: 403 }
      );
    }
    
    // Buscar imagens
    let query = supabase
      .from('sector_images')
      .select('*')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    
    const { data: images, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar imagens:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar imagens' },
        { status: 500 }
      );
    }
    
    // Contar rascunhos
    const { count: draftCount } = await supabase
      .from('sector_images')
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', sectorId)
      .eq('is_published', false);
    
    return NextResponse.json({
      success: true,
      data: {
        images: images || [],
        draftImagesCount: draftCount || 0
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar imagens do setor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sectors/[id]/images - Criar nova imagem
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectorId = params.id;
    const body = await request.json();
    
    const supabase = createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar permissões
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para criar imagens' },
        { status: 403 }
      );
    }
    
    // Validar dados obrigatórios
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!body.image_url?.trim()) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      );
    }
    
    // Obter próximo order_index
    const { data: lastImage } = await supabase
      .from('sector_images')
      .select('order_index')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
      
    const nextOrderIndex = lastImage ? lastImage.order_index + 1 : 0;
    
    // Criar imagem
    const { data: newImage, error } = await supabase
      .from('sector_images')
      .insert({
        sector_id: sectorId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        image_url: body.image_url.trim(),
        thumbnail_url: body.thumbnail_url || body.image_url.trim(),
        file_path: body.file_path || null,
        file_size: body.file_size || null,
        mime_type: body.mime_type || null,
        width: body.width || null,
        height: body.height || null,
        is_published: body.is_published !== false,
        is_featured: body.is_featured || false,
        order_index: nextOrderIndex,
        processing_status: body.processing_status || 'ready',
        created_by: user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar imagem:', error);
      return NextResponse.json(
        { error: 'Erro ao criar imagem' },
        { status: 500 }
      );
    }
    
    // Se for featured, remover featured das outras imagens
    if (body.is_featured) {
      await supabase
        .from('sector_images')
        .update({ is_featured: false })
        .eq('sector_id', sectorId)
        .neq('id', newImage.id);
    }
    
    return NextResponse.json({
      success: true,
      data: newImage
    });
    
  } catch (error) {
    console.error('Erro ao criar imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}