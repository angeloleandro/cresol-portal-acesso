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
  console.log('🚀 [UPLOAD] Iniciando upload de vídeo direto...');
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

    console.log('📋 [UPLOAD] Extraindo dados do FormData...');
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const isActive = formData.get('isActive') === 'true';
    const orderIndex = parseInt(formData.get('orderIndex') as string) || 0;
    const thumbnailTimestamp = formData.get('thumbnailTimestamp') ? parseFloat(formData.get('thumbnailTimestamp') as string) : null;
    const collectionId = formData.get('collection_id') as string | null; // Optional collection integration

    console.log('📊 [UPLOAD] Dados recebidos:', {
      fileName: videoFile?.name || 'N/A',
      fileSize: videoFile?.size || 0,
      fileType: videoFile?.type || 'N/A',
      title: title || 'N/A',
      isActive,
      orderIndex,
      thumbnailTimestamp,
      collectionId: collectionId || 'N/A'
    });

    if (!videoFile || !title) {
      console.error('❌ [UPLOAD] Dados obrigatórios faltando');
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
    
    console.log('🔄 [UPLOAD] Iniciando upload para Supabase Storage...');
    console.log('📁 [UPLOAD] Caminho do arquivo:', filePath);
    
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
      .upload(filePath, videoFile, {
        contentType: videoFile.type,
        upsert: false,
        cacheControl: VIDEO_CONFIG.CACHE_CONTROL
      });

    if (uploadData) {
      console.log('✅ [UPLOAD] Upload para storage concluído:', uploadData.path);
    }

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
    console.log('🔄 [UPLOAD] Criando registro no banco de dados...');
    let { data: videoRecord, error: dbError } = await serviceClient
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
        p_upload_progress: 100,
        p_thumbnail_timestamp: thumbnailTimestamp
      });

    if (dbError) {
      console.error('❌ [UPLOAD] Erro na RPC create_video_record:', dbError);
      
      // Cleanup do arquivo já uploadado
      await serviceClient.storage
        .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
        .remove([filePath]);

      // Tratamento específico para ordem duplicada
      if (dbError.code === '23505' && dbError.message.includes('order_index')) {
        console.log('🔄 [UPLOAD] Detectado order_index duplicado, tentando próximo valor...');
        
        // Buscar o próximo order_index disponível
        const { data: maxOrder } = await serviceClient
          .from('dashboard_videos')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1)
          .single();

        const nextOrderIndex = (maxOrder?.order_index || 0) + 1;
        
        console.log('🔄 [UPLOAD] Tentando com order_index:', nextOrderIndex);
        
        // Nova tentativa de upload
        const { data: uploadData2, error: uploadError2 } = await serviceClient.storage
          .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
          .upload(filePath, videoFile, {
            contentType: videoFile.type,
            upsert: false,
            cacheControl: VIDEO_CONFIG.CACHE_CONTROL
          });

        if (uploadError2) {
          return NextResponse.json({ 
            error: `Erro no reupload: ${uploadError2.message}` 
          }, { status: 500 });
        }

        // Nova tentativa de criação do registro
        const { data: videoRecord2, error: dbError2 } = await serviceClient
          .rpc('create_video_record', {
            p_title: title,
            p_video_url: urlData.publicUrl,
            p_thumbnail_url: null,
            p_is_active: isActive,
            p_order_index: nextOrderIndex,
            p_upload_type: 'direct',
            p_file_path: filePath,
            p_file_size: videoFile.size,
            p_mime_type: videoFile.type,
            p_original_filename: videoFile.name,
            p_processing_status: 'ready',
            p_upload_progress: 100,
            p_thumbnail_timestamp: thumbnailTimestamp
          });

        if (dbError2 || !videoRecord2) {
          await serviceClient.storage
            .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
            .remove([filePath]);

          return NextResponse.json({ 
            error: `Erro persistente ao salvar: ${dbError2?.message || 'Função RPC falhou'}` 
          }, { status: 500 });
        }

        // Sucesso na segunda tentativa
        videoRecord = videoRecord2;
      } else {
        // Outros tipos de erro
        const friendlyError = dbError.message.includes('duplicate key') 
          ? 'Já existe um vídeo com essas informações. Tente com dados diferentes.'
          : dbError.message.includes('violates check constraint')
          ? 'Dados inválidos fornecidos. Verifique se todos os campos estão corretos.'
          : `Erro no banco de dados: ${dbError.message}`;

        return NextResponse.json({ 
          error: friendlyError
        }, { status: 400 });
      }
    } else {
      console.log('✅ [UPLOAD] Registro criado com sucesso:', videoRecord);
    }

    const parsedRecord = typeof videoRecord === 'string' ? JSON.parse(videoRecord) : videoRecord;
    
    // Se collection_id foi fornecido, adicionar vídeo à coleção
    if (collectionId) {
      try {
        // Verificar se a coleção existe e suporta vídeos
        const { data: collection, error: collectionError } = await serviceClient
          .from('collections')
          .select('id, type')
          .eq('id', collectionId)
          .single();

        if (collectionError || !collection) {
          console.log('⚠️ [UPLOAD] Coleção não encontrada para adicionar vídeo:', collectionId);
          // Continue sem adicionar à coleção, mas não falhe o upload
        } else if (collection.type === 'images') {
          console.log('⚠️ [UPLOAD] Tentativa de adicionar vídeo a coleção de imagens:', collectionId);
          // Continue sem adicionar à coleção
        } else {
          // Buscar próximo order_index na coleção
          const { data: lastItem } = await serviceClient
            .from('collection_items')
            .select('order_index')
            .eq('collection_id', collectionId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single();

          const nextOrder = (lastItem?.order_index || 0) + 1;

          // Adicionar vídeo à coleção
          const { error: collectionItemError } = await serviceClient
            .from('collection_items')
            .insert({
              collection_id: collectionId,
              item_id: parsedRecord.id,
              item_type: 'video',
              order_index: nextOrder,
            });

          if (collectionItemError) {
            console.error('❌ [UPLOAD] Erro ao adicionar vídeo à coleção:', { 
              collectionId, 
              videoId: parsedRecord.id,
              error: collectionItemError 
            });
            // Continue sem falhar o upload
          } else {
            console.log('✅ [UPLOAD] Vídeo adicionado à coleção com sucesso:', {
              collectionId,
              videoId: parsedRecord.id,
              order: nextOrder
            });
          }
        }
      } catch (error) {
        console.error('❌ [UPLOAD] Erro na integração com coleção:', error);
        // Continue sem falhar o upload
      }
    }
    
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