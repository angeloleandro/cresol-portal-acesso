import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { VIDEO_CONFIG, STORAGE_CONFIG } from '@/lib/constants';

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let uploadMetrics = {
    fileSize: 0,
    uploadDuration: 0,
    processingDuration: 0,
    success: false
  };

  try {
    const supabase = createClient();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - apenas administradores' }, { status: 403 });
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const isActive = formData.get('isActive') === 'true';
    const orderIndex = parseInt(formData.get('orderIndex') as string) || 0;

    if (!videoFile || !title) {
      return NextResponse.json({ error: 'Arquivo de vídeo e título são obrigatórios' }, { status: 400 });
    }

    if (!VIDEO_CONFIG.ALLOWED_MIME_TYPES.includes(videoFile.type as any)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use MP4, WebM, MOV ou AVI.' 
      }, { status: 400 });
    }
    const fileExt = videoFile.name.split('.').pop()?.toLowerCase();
    const mimeTypeExtensionMap: Record<string, string[]> = {
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'video/quicktime': ['mov'],
      'video/x-msvideo': ['avi'],
      'video/mov': ['mov'],
      'video/avi': ['avi']
    };
    
    const allowedExtensions = mimeTypeExtensionMap[videoFile.type];
    if (!allowedExtensions?.includes(fileExt || '')) {
      return NextResponse.json({ 
        error: 'Extensão de arquivo não corresponde ao tipo MIME.' 
      }, { status: 400 });
    }

    if (videoFile.size > VIDEO_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Arquivo muito grande. Máximo: ${(VIDEO_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB` 
      }, { status: 400 });
    }

    if (videoFile.size === 0) {
      return NextResponse.json({ 
        error: 'Arquivo vazio ou corrompido' 
      }, { status: 400 });
    }

    uploadMetrics.fileSize = videoFile.size;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const uuid = crypto.randomUUID();
    const sanitizedOriginalName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${uuid}_${sanitizedOriginalName}`;
    const filePath = `${STORAGE_CONFIG.FOLDERS.VIDEO_UPLOADS}/${timestamp}/${fileName}`;
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
      .upload(filePath, videoFile, {
        contentType: videoFile.type,
        upsert: false,
        cacheControl: VIDEO_CONFIG.CACHE_CONTROL
      });

    if (uploadError) {
      return NextResponse.json({ 
        error: `Erro no upload: ${uploadError.message}` 
      }, { status: 500 });
    }

    const { data: urlData } = serviceClient.storage
      .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return NextResponse.json({ 
        error: 'Erro ao gerar URL do vídeo' 
      }, { status: 500 });
    }
    const { data: videoRecord, error: dbError } = await serviceClient
      .rpc('create_video_record', {
        p_title: title,
        p_video_url: urlData.publicUrl,
        p_thumbnail_url: null,
        p_is_active: isActive,
        p_order_index: orderIndex,
        p_upload_type: 'direct',
        p_file_path: filePath,
        p_file_size: videoFile.size,
        p_mime_type: videoFile.type,
        p_original_filename: videoFile.name,
        p_processing_status: 'ready',
        p_upload_progress: 100
      });

    if (dbError || !videoRecord) {
      await serviceClient.storage
        .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
        .remove([filePath]);

      return NextResponse.json({ 
        error: `Erro ao salvar no banco: ${dbError?.message || 'Função RPC falhou'}` 
      }, { status: 500 });
    }

    const parsedRecord = typeof videoRecord === 'string' ? JSON.parse(videoRecord) : videoRecord;
    
    uploadMetrics.success = true;
    uploadMetrics.uploadDuration = Date.now() - startTime;
    return NextResponse.json({
      message: 'Vídeo enviado com sucesso!',
      video: {
        id: parsedRecord.id,
        url: urlData.publicUrl,
        title: parsedRecord.title,
        file_path: filePath,
        file_size: videoFile.size,
        original_filename: videoFile.name
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}