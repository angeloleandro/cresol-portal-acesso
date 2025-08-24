import { NextRequest, NextResponse } from 'next/server';

import { CreateClient } from '@/lib/supabase/server';


// GET /api/admin/sectors/[id]/videos - Listar vídeos do setor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectorId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
    const supabase = CreateClient();
    
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
        { error: 'Sem permissão para acessar vídeos do setor' },
        { status: 403 }
      );
    }
    
    // Buscar vídeos
    let query = supabase
      .from('sector_videos')
      .select('*')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    
    const { data: videos, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar vídeos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar vídeos' },
        { status: 500 }
      );
    }
    
    // Contar rascunhos
    const { count: draftCount } = await supabase
      .from('sector_videos')
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', sectorId)
      .eq('is_published', false);
    
    return NextResponse.json({
      success: true,
      data: {
        videos: videos || [],
        draftVideosCount: draftCount || 0
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar vídeos do setor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sectors/[id]/videos - Criar novo vídeo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectorId = params.id;
    const body = await request.json();
    
    const supabase = CreateClient();
    
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
        { error: 'Sem permissão para criar vídeos' },
        { status: 403 }
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
      if (youtubeId) {
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
    }
    
    // Obter próximo order_index
    const { data: lastVideo } = await supabase
      .from('sector_videos')
      .select('order_index')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
      
    const nextOrderIndex = lastVideo ? lastVideo.order_index + 1 : 0;
    
    // Criar vídeo
    const { data: newVideo, error } = await supabase
      .from('sector_videos')
      .insert({
        sector_id: sectorId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        video_url: body.video_url.trim(),
        thumbnail_url: thumbnailUrl,
        thumbnail_timestamp: body.thumbnail_timestamp || null,
        upload_type: body.upload_type || 'youtube',
        is_published: body.is_published !== false,
        is_featured: body.is_featured || false,
        order_index: nextOrderIndex,
        created_by: user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar vídeo:', error);
      return NextResponse.json(
        { error: 'Erro ao criar vídeo' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: newVideo
    });
    
  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
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