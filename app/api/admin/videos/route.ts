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

    // Get video details before deletion (for cleanup if needed)
    const { data: video, error: fetchError } = await supabase
      .from('dashboard_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 });
    }

    // Delete the video
    const { error: deleteError } = await supabase
      .from('dashboard_videos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir vídeo:', deleteError);
      return NextResponse.json({ error: 'Erro ao excluir vídeo' }, { status: 500 });
    }

    // Note: In a real implementation, you might also want to delete the thumbnail file from storage
    // if it's no longer referenced by other records

    return NextResponse.json({ message: 'Vídeo excluído com sucesso' });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}