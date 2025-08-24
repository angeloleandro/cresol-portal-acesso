// Sector Videos Upload API - Following Gallery Pattern
// Upload direto de vídeos para setores seguindo padrão da galeria

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { VIDEO_CONFIG, STORAGE_CONFIG } from '@/lib/constants';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// POST /api/admin/sectors/[id]/videos/upload
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const sectorId = params.id;
  
  try {
    const supabase = createClient();
    
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

    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verify sector exists
    const { data: sector, error: sectorError } = await supabase
      .from('sectors')
      .select('id, name')
      .eq('id', sectorId)
      .single();

    if (sectorError || !sector) {
      return NextResponse.json({ error: 'Setor não encontrado' }, { status: 404 });
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

    // Validation
    if (!videoFile || !title) {
      return NextResponse.json({ error: 'Arquivo e título são obrigatórios' }, { status: 400 });
    }

    if (!VIDEO_CONFIG.ALLOWED_MIME_TYPES.includes(videoFile.type as any)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use MP4, WebM, MOV ou AVI.' 
      }, { status: 400 });
    }

    if (videoFile.size > VIDEO_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Arquivo muito grande. Máximo: ${(VIDEO_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB` 
      }, { status: 400 });
    }

    // Upload video to storage - using same structure as gallery
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const uuid = crypto.randomUUID();
    const sanitizedOriginalName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${uuid}_${sanitizedOriginalName}`;
    const filePath = `uploads/sectors/${sectorId}/${timestamp}/${fileName}`;
    
    console.log('[SECTOR-VIDEO-UPLOAD] Uploading video:', {
      filePath,
      fileSize: formatFileSize(videoFile.size),
      mimeType: videoFile.type
    });

    // Upload video file
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
      .upload(filePath, videoFile, {
        contentType: videoFile.type,
        upsert: false,
        cacheControl: VIDEO_CONFIG.CACHE_CONTROL
      });

    if (uploadError) {
      console.error('[SECTOR-VIDEO-UPLOAD] Storage upload error:', uploadError);
      return NextResponse.json({ 
        error: `Erro no upload: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Get public URL for video
    const { data: urlData } = serviceClient.storage
      .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return NextResponse.json({ 
        error: 'Erro ao gerar URL do vídeo' 
      }, { status: 500 });
    }

    // Handle thumbnail upload if provided
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbUuid = crypto.randomUUID();
      const thumbExtension = thumbnailFile.type.split('/')[1] || 'jpg';
      const thumbFileName = `${thumbUuid}.${thumbExtension}`;
      const thumbPath = `thumbnails/sectors/${sectorId}/${thumbFileName}`;
      
      console.log('[SECTOR-VIDEO-UPLOAD] Uploading thumbnail:', {
        thumbPath,
        fileSize: formatFileSize(thumbnailFile.size)
      });

      // Upload thumbnail to images bucket
      const { data: thumbUploadData, error: thumbUploadError } = await serviceClient.storage
        .from(STORAGE_CONFIG.BUCKETS.IMAGES)
        .upload(thumbPath, thumbnailFile, {
          contentType: thumbnailFile.type,
          upsert: false,
          cacheControl: '3600'
        });

      if (!thumbUploadError) {
        const { data: thumbUrlData } = serviceClient.storage
          .from(STORAGE_CONFIG.BUCKETS.IMAGES)
          .getPublicUrl(thumbPath);
        
        thumbnailUrl = thumbUrlData.publicUrl;
        console.log('[SECTOR-VIDEO-UPLOAD] Thumbnail uploaded:', thumbnailUrl);
      } else {
        console.error('[SECTOR-VIDEO-UPLOAD] Thumbnail upload error:', thumbUploadError);
      }
    }

    // Get next order index
    const { data: lastVideo } = await serviceClient
      .from('sector_videos')
      .select('order_index')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastVideo?.order_index || 0) + 1;

    // If featured, unfeatured others
    if (isFeatured) {
      await serviceClient
        .from('sector_videos')
        .update({ is_featured: false })
        .eq('sector_id', sectorId);
    }

    // Insert video record
    const { data: videoRecord, error: dbError } = await serviceClient
      .from('sector_videos')
      .insert({
        sector_id: sectorId,
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
      console.error('[SECTOR-VIDEO-UPLOAD] Database error:', dbError);
      
      // Cleanup on error
      await serviceClient.storage
        .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
        .remove([filePath]);
      
      if (thumbnailUrl) {
        const thumbPath = thumbnailUrl.split('/').slice(-2).join('/');
        await serviceClient.storage
          .from(STORAGE_CONFIG.BUCKETS.IMAGES)
          .remove([`thumbnails/sectors/${sectorId}/${thumbPath}`]);
      }

      return NextResponse.json({ 
        error: `Erro ao salvar no banco: ${dbError.message}` 
      }, { status: 500 });
    }

    console.log('[SECTOR-VIDEO-UPLOAD] Video uploaded successfully:', {
      id: videoRecord.id,
      title: videoRecord.title,
      uploadDuration: `${Date.now() - startTime}ms`
    });

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
    console.error('[SECTOR-VIDEO-UPLOAD] Unexpected error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}