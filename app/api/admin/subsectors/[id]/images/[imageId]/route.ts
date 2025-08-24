import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/admin/subsectors/[id]/images/[imageId] - Atualizar imagem
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const subsectorId = params.id;
    const imageId = params.imageId;
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
      
    if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para atualizar imagens' },
        { status: 403 }
      );
    }
    
    // Verificar se a imagem existe e pertence ao subsetor
    const { data: existingImage, error: checkError } = await supabase
      .from('subsector_images')
      .select('id')
      .eq('id', imageId)
      .eq('subsector_id', subsectorId)
      .single();
      
    if (checkError || !existingImage) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      );
    }
    
    // Validar dados
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
    
    // Se for featured, remover featured das outras imagens primeiro
    if (body.is_featured) {
      await supabase
        .from('subsector_images')
        .update({ is_featured: false })
        .eq('subsector_id', subsectorId)
        .neq('id', imageId);
    }
    
    // Atualizar imagem
    const { data: updatedImage, error } = await supabase
      .from('subsector_images')
      .update({
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
        processing_status: body.processing_status || 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar imagem:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar imagem' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedImage
    });
    
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subsectors/[id]/images/[imageId] - Excluir imagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const subsectorId = params.id;
    const imageId = params.imageId;
    
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
      
    if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir imagens' },
        { status: 403 }
      );
    }
    
    // Verificar se a imagem existe e pertence ao subsetor, e obter dados para limpeza
    const { data: existingImage, error: checkError } = await supabase
      .from('subsector_images')
      .select('id, file_path, thumbnail_url, image_url')
      .eq('id', imageId)
      .eq('subsector_id', subsectorId)
      .single();
      
    if (checkError || !existingImage) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      );
    }
    
    // Se houver arquivo armazenado, limpar do storage
    if (existingImage.file_path) {
      await supabase.storage
        .from('images')
        .remove([existingImage.file_path]);
    }
    
    // Se houver thumbnail personalizado armazenado, limpar do storage
    if (existingImage.thumbnail_url && 
        existingImage.thumbnail_url.includes('supabase') && 
        existingImage.thumbnail_url !== existingImage.image_url) {
      
      // Extrair o caminho do thumbnail do URL completo
      const thumbnailPath = existingImage.thumbnail_url.split('/').pop();
      if (thumbnailPath) {
        await supabase.storage
          .from('images')
          .remove([`thumbnails/subsectors/${thumbnailPath}`]);
      }
    }
    
    // Excluir imagem do banco
    const { error } = await supabase
      .from('subsector_images')
      .delete()
      .eq('id', imageId);
    
    if (error) {
      console.error('Erro ao excluir imagem:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir imagem' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Imagem excluída com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}