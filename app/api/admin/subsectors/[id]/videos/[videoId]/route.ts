import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    const subsectorId = params.id;
    const videoId = params.videoId;
    const body = await request.json();
    
    console.log('[SUBSECTOR-VIDEO-UPDATE] Iniciando update de vídeo:', {
      subsectorId,
      videoId,
      uploadType: body.upload_type,
      hasTitle: !!body.title,
      hasVideoUrl: !!body.video_url,
      hasThumbnailUrl: !!body.thumbnail_url
    });

    const supabase = createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check permissions
    if (profile.role !== 'admin' && profile.role !== 'subsector_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify video belongs to subsector
    const { data: existingVideo, error: fetchError } = await supabase
      .from('subsector_videos')
      .select('*')
      .eq('id', videoId)
      .eq('subsector_id', subsectorId)
      .single();

    if (fetchError || !existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    
    console.log('[SUBSECTOR-VIDEO-UPDATE] Vídeo existente encontrado:', {
      exists: !!existingVideo,
      uploadType: existingVideo?.upload_type,
      hasVideoUrl: !!existingVideo?.video_url,
      hasThumbnailUrl: !!existingVideo?.thumbnail_url,
      hasFilePath: !!existingVideo?.file_path
    });

    // Extract YouTube thumbnail if it's a YouTube video and URL changed
    let thumbnailUrl = body.thumbnail_url;
    if (body.upload_type === 'youtube' && body.video_url && body.video_url !== existingVideo.video_url) {
      try {
        const url = new URL(body.video_url);
        let videoId = '';
        
        if (url.hostname === 'youtu.be') {
          videoId = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
          videoId = url.searchParams.get('v') || '';
        }
        
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } catch (e) {
        console.error('Error parsing YouTube URL:', e);
      }
    }
    
    console.log('[SUBSECTOR-VIDEO-UPDATE] Processando thumbnail:', {
      originalThumbnail: body.thumbnail_url,
      processedThumbnail: thumbnailUrl,
      isYoutube: body.upload_type === 'youtube',
      isDirectUpload: body.upload_type === 'upload'
    });

    // Update video
    const { data: video, error: updateError } = await supabase
      .from('subsector_videos')
      .update({
        title: body.title,
        description: body.description || null,
        video_url: body.video_url,
        thumbnail_url: thumbnailUrl,
        upload_type: body.upload_type || existingVideo.upload_type,
        file_path: body.file_path || existingVideo.file_path,
        file_size: body.file_size || existingVideo.file_size,
        mime_type: body.mime_type || existingVideo.mime_type,
        duration: body.duration || existingVideo.duration,
        order_index: body.order_index !== undefined ? body.order_index : existingVideo.order_index,
        is_published: body.is_published !== undefined ? body.is_published : existingVideo.is_published,
        is_featured: body.is_featured !== undefined ? body.is_featured : existingVideo.is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)
      .eq('subsector_id', subsectorId)
      .select()
      .single();

    if (updateError) {
      console.error('[SUBSECTOR-VIDEO-UPDATE] Erro ao atualizar vídeo:', updateError);
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }
    
    console.log('[SUBSECTOR-VIDEO-UPDATE] Vídeo atualizado com sucesso:', {
      videoId: video?.id,
      title: video?.title,
      uploadType: video?.upload_type,
      thumbnailUrl: video?.thumbnail_url
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    const subsectorId = params.id;
    const videoId = params.videoId;

    const supabase = createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check permissions
    if (profile.role !== 'admin' && profile.role !== 'subsector_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get video details before deletion
    const { data: video, error: fetchError } = await supabase
      .from('subsector_videos')
      .select('*')
      .eq('id', videoId)
      .eq('subsector_id', subsectorId)
      .single();

    if (fetchError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // If it's an uploaded video, delete the file from storage
    if (video.upload_type === 'upload' && video.file_path) {
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([video.file_path]);

      if (storageError) {
        console.error('Error deleting video file:', storageError);
        // Continue with deletion even if storage deletion fails
      }

      // Also try to delete the thumbnail if it exists
      if (video.thumbnail_url && video.thumbnail_url.includes('supabase')) {
        const thumbnailPath = video.thumbnail_url.split('/').pop();
        if (thumbnailPath) {
          await supabase.storage
            .from('videos')
            .remove([`thumbnails/${thumbnailPath}`]);
        }
      }
    }

    // Delete video record
    const { error: deleteError } = await supabase
      .from('subsector_videos')
      .delete()
      .eq('id', videoId)
      .eq('subsector_id', subsectorId);

    if (deleteError) {
      console.error('Error deleting video:', deleteError);
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}