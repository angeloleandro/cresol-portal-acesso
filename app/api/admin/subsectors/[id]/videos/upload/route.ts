/**
 * Subsector Videos Upload API - Following Gallery Pattern
 * Upload direto de vídeos para subsetores seguindo padrão da galeria
 * Otimizado segundo padrões da codebase Cresol
 */

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { VIDEO_FILE_CONFIG, VIDEO_STORAGE_CONFIG } from '../../../../../../../lib/constants/video-ui';
import { CreateClient } from '../../../../../../../lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Formata tamanho do arquivo para display
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
// Removed unused function formatFileSize
function _formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Valida se o arquivo é um vídeo válido
 * @param file - Arquivo a ser validado
 * @returns boolean
 */
function isValidVideoFile(file: File): boolean {
  return VIDEO_FILE_CONFIG.supportedMimeTypes.includes(file.type as any) && 
         file.size <= VIDEO_FILE_CONFIG.maxSize && 
         file.size > 0;
}

// POST /api/admin/subsectors/[id]/videos/upload
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const subsectorId = params.id;
  
  try {
    const supabase = CreateClient();
    
    // Auth check
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

    if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verify subsector exists
    const { data: subsector, error: subsectorError } = await supabase
      .from('subsectors')
      .select('id, name')
      .eq('id', subsectorId)
      .single();

    if (subsectorError || !subsector) {
      return NextResponse.json({ error: 'Subsetor não encontrado' }, { status: 404 });
    }

    // Service client for storage operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse form data
    const formData = await request.formData();
    const videoFile = formData.get('file') as File;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const isPublished = formData.get('is_published') === 'true';
    const isFeatured = formData.get('is_featured') === 'true';
    const uploadType = formData.get('upload_type') as string;
    const thumbnailMode = formData.get('thumbnail_mode') as string | null;
    const thumbnailTimestamp = formData.get('thumbnail_timestamp') ? 
      parseFloat(formData.get('thumbnail_timestamp') as string) : null;

    // Enhanced validation
    if (!videoFile || !title?.trim()) {
      return NextResponse.json({ 
        error: 'Arquivo e título são obrigatórios' 
      }, { status: 400 });
    }

    if (!isValidVideoFile(videoFile)) {
      return NextResponse.json({ 
        error: `Arquivo inválido. Use ${VIDEO_FILE_CONFIG.supportedFormats.join(', ')} (máximo: ${(VIDEO_FILE_CONFIG.maxSize / 1024 / 1024).toFixed(0)}MB)` 
      }, { status: 400 });
    }

    // Additional validations
    if (title.trim().length > 255) {
      return NextResponse.json({ 
        error: 'Título muito longo (máximo: 255 caracteres)' 
      }, { status: 400 });
    }

    if (description && description.length > 1000) {
      return NextResponse.json({ 
        error: 'Descrição muito longa (máximo: 1000 caracteres)' 
      }, { status: 400 });
    }

    // Upload video to storage - using same structure as gallery
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const uuid = crypto.randomUUID();
    const sanitizedOriginalName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${uuid}_${sanitizedOriginalName}`;
    const filePath = `uploads/subsectors/${subsectorId}/${timestamp}/${fileName}`;
    
    // Debug upload start logging removed for production

    // Upload video file
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(VIDEO_STORAGE_CONFIG.buckets.videos)
      .upload(filePath, videoFile, {
        contentType: videoFile.type,
        upsert: false,
        cacheControl: VIDEO_FILE_CONFIG.cacheControl
      });

    if (uploadError) {

      return NextResponse.json({ 
        error: `Erro no upload: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Get public URL for video
    const { data: urlData } = serviceClient.storage
      .from(VIDEO_STORAGE_CONFIG.buckets.videos)
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return NextResponse.json({ 
        error: 'Erro ao gerar URL do vídeo' 
      }, { status: 500 });
    }

    // Handle thumbnail upload if provided
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      // Type narrowing: thumbnailFile is guaranteed to be File at this point
      const validThumbnailFile = thumbnailFile as File;
      
      const thumbUuid = crypto.randomUUID();
      const thumbExtension = validThumbnailFile.type.split('/')[1] || 'jpg';
      const thumbFileName = `${thumbUuid}.${thumbExtension}`;
      const thumbPath = `thumbnails/subsectors/${subsectorId}/${thumbFileName}`;

      // Upload thumbnail to images bucket
      const { data: thumbUploadData, error: thumbUploadError } = await serviceClient.storage
        .from(VIDEO_STORAGE_CONFIG.buckets.thumbnails)
        .upload(thumbPath, validThumbnailFile, {
          contentType: validThumbnailFile.type,
          upsert: false,
          cacheControl: '3600'
        });

      if (!thumbUploadError) {
        const { data: thumbUrlData } = serviceClient.storage
          .from(VIDEO_STORAGE_CONFIG.buckets.thumbnails)
          .getPublicUrl(thumbPath);
        
        thumbnailUrl = thumbUrlData.publicUrl;
      }
    }

    // Get next order index
    const { data: lastVideo } = await serviceClient
      .from('subsector_videos')
      .select('order_index')
      .eq('subsector_id', subsectorId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastVideo?.order_index || 0) + 1;

    // If featured, unfeatured others
    if (isFeatured) {
      await serviceClient
        .from('subsector_videos')
        .update({ is_featured: false })
        .eq('subsector_id', subsectorId);
    }

    // Insert video record
    const { data: videoRecord, error: dbError } = await serviceClient
      .from('subsector_videos')
      .insert({
        subsector_id: subsectorId,
        title: title.trim(),
        description: description?.trim() || null,
        video_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        thumbnail_timestamp: thumbnailTimestamp,
        upload_type: 'upload',
        file_path: filePath,
        file_size: videoFile.size,
        mime_type: videoFile.type,
        is_published: isPublished,
        is_featured: isFeatured,
        order_index: nextOrderIndex,
        created_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup on error
      await serviceClient.storage
        .from(VIDEO_STORAGE_CONFIG.buckets.videos)
        .remove([filePath]);
      
      if (thumbnailUrl) {
        const thumbPath = thumbnailUrl.split('/').slice(-2).join('/');
        await serviceClient.storage
          .from(VIDEO_STORAGE_CONFIG.buckets.thumbnails)
          .remove([`thumbnails/subsectors/${subsectorId}/${thumbPath}`]);
      }

      return NextResponse.json({ 
        error: `Erro ao salvar no banco: ${dbError.message}` 
      }, { status: 500 });
    }

    // Debug upload success logging removed for production

    // Return response matching gallery pattern
    return NextResponse.json({
      message: 'Vídeo enviado com sucesso!',
      video: {
        id: videoRecord.id,
        url: urlData.publicUrl,
        title: videoRecord.title,
        file_path: filePath,
        file_size: videoFile.size,
        original_filename: videoFile.name
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}