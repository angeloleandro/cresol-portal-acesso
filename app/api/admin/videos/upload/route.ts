// Videos Upload API
// Upload direto de vídeos para dashboard - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, devLog } from '@/lib/error-handler';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// POST /api/admin/videos/upload - Upload de vídeo para dashboard
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar se usuário está autenticado e é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Validações básicas
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'];

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 100MB.' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use MP4, WebM, MOV ou AVI.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const fileName = `video_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `videos/${fileName}`;

    // Converter File para ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images') // Usando o bucket 'images' como nos outros uploads
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      devLog.error('Erro no upload de vídeo', { uploadError });
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // Extrair título do nome do arquivo (sem extensão)
    const title = file.name.replace(/\.[^/.]+$/, '');

    // Buscar próximo order_index
    const { data: lastVideo } = await supabase
      .from('dashboard_videos')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastVideo?.order_index || 0) + 1;

    // Gerar thumbnail placeholder (pode ser melhorado futuramente)
    const thumbnailUrl = '/images/video-placeholder.jpg'; // Placeholder genérico

    // Inserir registro na tabela dashboard_videos
    const { data: videoRecord, error: insertError } = await supabase
      .from('dashboard_videos')
      .insert({
        title,
        video_url: publicUrl,
        thumbnail_url: thumbnailUrl,
        is_active: true,
        order_index: nextOrderIndex,
        upload_type: 'direct',
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        processing_status: 'ready',
        original_filename: file.name,
        upload_progress: 100,
        thumbnail_timestamp: null,
      })
      .select()
      .single();

    if (insertError) {
      devLog.error('Erro ao inserir vídeo no dashboard', { insertError });
      
      // Limpar arquivo do storage em caso de erro
      await supabase.storage.from('images').remove([filePath]);
      
      return NextResponse.json(
        { error: 'Erro ao salvar vídeo no dashboard' },
        { status: 500 }
      );
    }

    devLog.info('Vídeo adicionado ao dashboard', { 
      id: videoRecord.id,
      title,
      fileName, 
      fileSize: file.size 
    });

    // Retornar dados no formato esperado pelo BulkUpload
    return NextResponse.json({
      id: videoRecord.id,
      title: videoRecord.title,
      video_url: videoRecord.video_url,
      thumbnail_url: videoRecord.thumbnail_url,
      upload_type: videoRecord.upload_type,
      is_active: videoRecord.is_active,
      order_index: videoRecord.order_index,
      processing_status: videoRecord.processing_status,
      upload_progress: videoRecord.upload_progress,
      created_at: videoRecord.created_at,
      // Dados extras para compatibilidade
      file_size: file.size,
      file_type: file.type,
      original_name: file.name,
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'uploadVideo');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}