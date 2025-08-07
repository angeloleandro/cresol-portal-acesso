import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token de autorização não encontrado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { title, video_url, thumbnail_url, is_active, order_index, upload_type } = await request.json();

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Título e URL são obrigatórios' }, { status: 400 });
    }

    const { data: newVideo, error: insertError } = await supabase
      .from('dashboard_videos')
      .insert([{ 
        title, 
        video_url, 
        thumbnail_url, 
        is_active: is_active ?? true, 
        order_index: order_index ?? 0, 
        upload_type: upload_type || 'youtube'
      }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Erro ao criar vídeo' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Vídeo criado com sucesso', 
      video: newVideo 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token de autorização não encontrado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, video_url, thumbnail_url, is_active, order_index, upload_type } = body;

    // Enhanced validation
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Título é obrigatório e não pode estar vazio' }, { status: 400 });
    }

    // Validate that video exists before updating
    const { data: existingVideo, error: fetchError } = await supabase
      .from('dashboard_videos')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 });
    }

    // Build update object with only defined values
    const updateData: any = {
      title: title.trim(),
      is_active: is_active !== undefined ? is_active : true,
      order_index: order_index !== undefined ? order_index : 0,
    };

    // Only add these fields if they are provided
    if (video_url !== undefined) {
      updateData.video_url = video_url;
    }
    
    if (thumbnail_url !== undefined) {
      updateData.thumbnail_url = thumbnail_url;
    }
    
    if (upload_type !== undefined) {
      updateData.upload_type = upload_type;
    }

    const { data: updatedVideo, error: updateError } = await supabase
      .from('dashboard_videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ 
        error: `Erro ao atualizar vídeo: ${updateError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Vídeo atualizado com sucesso', 
      video: updatedVideo 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token de autorização não encontrado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { data: video, error: fetchError } = await supabase
      .from('dashboard_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.message?.includes('No rows returned')) {
        return NextResponse.json({ message: 'Vídeo já foi excluído anteriormente' });
      }
      return NextResponse.json({ error: 'Erro ao buscar vídeo' }, { status: 500 });
    }


    if (video.upload_type === 'direct' && video.file_path) {
      const { error: videoDeleteError } = await supabase.storage
        .from('videos')
        .remove([video.file_path]);
      
      // Silently handle storage errors
      
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

    if (video.thumbnail_url && video.thumbnail_url.includes('supabase')) {
      const thumbnailPath = video.thumbnail_url.split('/').pop();
      if (thumbnailPath) {
        await supabase.storage
          .from('banners')
          .remove([thumbnailPath]);
      }
    }

    const { error: deleteError } = await supabase
      .from('dashboard_videos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: 'Erro ao excluir vídeo' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vídeo excluído com sucesso' });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}