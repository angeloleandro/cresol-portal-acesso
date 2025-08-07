import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Get video details before deletion (for cleanup)
    const { data: video, error: fetchError } = await supabase
      .from('dashboard_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 });
    }

    // Clean up storage files for direct uploads
    if (video.upload_type === 'direct' && video.file_path) {
      // Delete the video file from storage
      const { error: videoDeleteError } = await supabase.storage
        .from('videos')
        .remove([video.file_path]);
      
      if (videoDeleteError) {
        console.warn('Erro ao remover arquivo de vídeo:', videoDeleteError);
        // Continue with database deletion even if file cleanup fails
      }
      
      // Also clean up any temporary chunks that might still exist
      const { data: tempFiles } = await supabase.storage
        .from('videos')
        .list('temp', {
          search: id
        });

      if (tempFiles && tempFiles.length > 0) {
        const tempPaths = tempFiles.map(file => `temp/${file.name}`);
        await supabase.storage
          .from('videos')
          .remove(tempPaths);
      }
    }

    // Clean up custom thumbnail if it exists and is hosted in our storage
    if (video.thumbnail_url && video.thumbnail_url.includes('supabase')) {
      const thumbnailPath = video.thumbnail_url.split('/').pop();
      if (thumbnailPath) {
        await supabase.storage
          .from('banners')
          .remove([thumbnailPath]);
      }
    }

    // Delete the video record from database
    const { error: deleteError } = await supabase
      .from('dashboard_videos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir vídeo:', deleteError);
      return NextResponse.json({ error: 'Erro ao excluir vídeo' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vídeo excluído com sucesso' });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}