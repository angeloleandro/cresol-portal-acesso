import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/admin/sectors/[id]/videos/[videoId] - Atualizar vídeo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    const sectorId = params.id;
    const videoId = params.videoId;
    const body = await request.json();
    
    console.log('[VIDEO-UPDATE] Iniciando update de vídeo:', {
      sectorId,
      videoId,
      uploadType: body.upload_type,
      hasTitle: !!body.title,
      hasVideoUrl: !!body.video_url,
      hasThumbnailUrl: !!body.thumbnail_url
    });
    
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
        { error: 'Sem permissão para atualizar vídeos' },
        { status: 403 }
      );
    }
    
    // Verificar se o vídeo existe e pertence ao setor
    const { data: existingVideo, error: checkError } = await supabase
      .from('sector_videos')
      .select('id, upload_type, video_url, thumbnail_url, file_path')
      .eq('id', videoId)
      .eq('sector_id', sectorId)
      .single();
      
    console.log('[VIDEO-UPDATE] Vídeo existente encontrado:', {
      exists: !!existingVideo,
      uploadType: existingVideo?.upload_type,
      hasVideoUrl: !!existingVideo?.video_url,
      hasThumbnailUrl: !!existingVideo?.thumbnail_url,
      hasFilePath: !!existingVideo?.file_path
    });
      
    if (checkError || !existingVideo) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
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
    
    if (!body.video_url?.trim()) {
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      );
    }
    
    // Processar URL do YouTube se necessário
    let thumbnailUrl = body.thumbnail_url;
    if (body.upload_type === 'youtube' && body.video_url) {
      const youtubeId = extractYouTubeId(body.video_url);
      if (youtubeId && !body.thumbnail_url) {
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
    }
    
    console.log('[VIDEO-UPDATE] Processando thumbnail:', {
      originalThumbnail: body.thumbnail_url,
      processedThumbnail: thumbnailUrl,
      isYoutube: body.upload_type === 'youtube',
      isDirectUpload: body.upload_type === 'upload'
    });
    
    // Atualizar vídeo
    const { data: updatedVideo, error } = await supabase
      .from('sector_videos')
      .update({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        video_url: body.video_url.trim(),
        thumbnail_url: thumbnailUrl,
        upload_type: body.upload_type || 'youtube',
        is_published: body.is_published !== false,
        is_featured: body.is_featured || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)
      .select()
      .single();
    
    if (error) {
      console.error('[VIDEO-UPDATE] Erro ao atualizar vídeo:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar vídeo' },
        { status: 500 }
      );
    }
    
    console.log('[VIDEO-UPDATE] Vídeo atualizado com sucesso:', {
      videoId: updatedVideo?.id,
      title: updatedVideo?.title,
      uploadType: updatedVideo?.upload_type,
      thumbnailUrl: updatedVideo?.thumbnail_url
    });
    
    return NextResponse.json({
      success: true,
      data: updatedVideo
    });
    
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sectors/[id]/videos/[videoId] - Excluir vídeo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    const sectorId = params.id;
    const videoId = params.videoId;
    
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
        { error: 'Sem permissão para excluir vídeos' },
        { status: 403 }
      );
    }
    
    // Verificar se o vídeo existe e pertence ao setor
    const { data: existingVideo, error: checkError } = await supabase
      .from('sector_videos')
      .select('id, file_path, thumbnail_url')
      .eq('id', videoId)
      .eq('sector_id', sectorId)
      .single();
      
    if (checkError || !existingVideo) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }
    
    // Se for upload direto, deletar arquivos do storage
    if (existingVideo.file_path) {
      // Extrair o caminho do arquivo do URL completo
      const filePath = existingVideo.file_path.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('videos')
          .remove([`uploads/${filePath}`]);
      }
    }
    
    if (existingVideo.thumbnail_url && existingVideo.thumbnail_url.includes('supabase')) {
      // Extrair o caminho do thumbnail do URL completo
      const thumbnailPath = existingVideo.thumbnail_url.split('/').pop();
      if (thumbnailPath) {
        await supabase.storage
          .from('videos')
          .remove([`thumbnails/${thumbnailPath}`]);
      }
    }
    
    // Excluir vídeo do banco
    const { error } = await supabase
      .from('sector_videos')
      .delete()
      .eq('id', videoId);
    
    if (error) {
      console.error('Erro ao excluir vídeo:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir vídeo' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vídeo excluído com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao excluir vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para extrair ID do YouTube
function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}