import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';


import { CreateClient } from '@/lib/supabase/server';


// POST /api/admin/subsectors/[id]/videos/[videoId]/thumbnail - Upload de thumbnail
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    const subsectorId = params.id;
    const videoId = params.videoId;

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
      
    if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para fazer upload de thumbnails' },
        { status: 403 }
      );
    }
    
    // Criar cliente de serviço para upload
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Processar FormData
    const formData = await request.formData();
    const thumbnailFile = formData.get('thumbnail') as File;
    const thumbnailMode = formData.get('thumbnail_mode') as string || 'auto';
    const thumbnailTimestamp = formData.get('thumbnail_timestamp') ? 
      parseFloat(formData.get('thumbnail_timestamp') as string) : null;
    
    if (!thumbnailFile) {
      return NextResponse.json(
        { error: 'Arquivo de thumbnail é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o vídeo existe
    const { data: existingVideo, error: checkError } = await serviceClient
      .from('subsector_videos')
      .select('id, title, thumbnail_url')
      .eq('id', videoId)
      .eq('subsector_id', subsectorId)
      .single();
      
    if (checkError || !existingVideo) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }
    
    // Deletar thumbnail antiga se existir
    if (existingVideo.thumbnail_url && existingVideo.thumbnail_url.includes('supabase')) {
      const oldPath = existingVideo.thumbnail_url.split('/').pop();
      if (oldPath) {

        await serviceClient.storage
          .from('images')
          .remove([`thumbnails/subsectors/${subsectorId}/${oldPath}`]);
      }
    }
    
    // Upload do thumbnail para o storage - usando bucket 'images' como na galeria
    const uuid = crypto.randomUUID();
    const fileExt = thumbnailFile.type.split('/')[1] || 'jpg';
    const fileName = `${uuid}.${fileExt}`;
    const filePath = `thumbnails/subsectors/${subsectorId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('images')
      .upload(filePath, thumbnailFile, {
        contentType: thumbnailFile.type,
        upsert: false,
        cacheControl: '3600'
      });
    
    if (uploadError) {

      return NextResponse.json(
        { error: `Erro ao fazer upload do thumbnail: ${uploadError.message}` },
        { status: 500 }
      );
    }
    
    // Obter URL pública do thumbnail
    const { data: urlData } = serviceClient.storage
      .from('images')
      .getPublicUrl(filePath);
    
    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Erro ao gerar URL do thumbnail' },
        { status: 500 }
      );
    }

    // Atualizar vídeo com o novo thumbnail
    const { data: updatedVideo, error: updateError } = await serviceClient
      .from('subsector_videos')
      .update({
        thumbnail_url: urlData.publicUrl,
        thumbnail_mode: thumbnailMode,
        thumbnail_timestamp: thumbnailTimestamp,
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)
      .select()
      .single();
    
    if (updateError) {

      // Limpar arquivo do storage em caso de erro
      await serviceClient.storage
        .from('images')
        .remove([filePath]);
        
      return NextResponse.json(
        { error: 'Erro ao atualizar vídeo com thumbnail' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        thumbnailUrl: urlData.publicUrl,
        thumbnailMode,
        thumbnailTimestamp,
        video: updatedVideo
      }
    });
    
  } catch (error) {

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}