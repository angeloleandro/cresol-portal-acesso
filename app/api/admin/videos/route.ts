import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token de autorização não encontrado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();


    if (profileError || !['admin', 'sector_admin'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const requestBody = await request.json();
    const { title, video_url, thumbnail_url, is_active, order_index, upload_type, thumbnail_timestamp } = requestBody;
    

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Título e URL são obrigatórios' }, { status: 400 });
    }

    // Calcular próximo order_index disponível se não fornecido ou for 0 (novo vídeo)
    let finalOrderIndex = order_index;
    
    if (finalOrderIndex === undefined || finalOrderIndex === null || finalOrderIndex === 0) {
      
      const { data: maxOrderData, error: maxOrderError } = await supabaseAdmin
        .from('dashboard_videos')
        .select('order_index')
        .eq('is_active', true)
        .order('order_index', { ascending: false })
        .limit(1);

      if (maxOrderError) {
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
      }

      finalOrderIndex = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].order_index + 1 
        : 0;
      
    }

    const insertData = { 
      title, 
      video_url, 
      thumbnail_url, 
      is_active: is_active ?? true, 
      order_index: finalOrderIndex, 
      upload_type: upload_type || 'youtube',
      thumbnail_timestamp: thumbnail_timestamp || null
    };
    
    
    const { data: newVideo, error: insertError } = await supabaseAdmin
      .from('dashboard_videos')
      .insert([insertData])
      .select()
      .single();


    if (insertError) {
      return NextResponse.json({ error: `Erro ao criar vídeo: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Vídeo criado com sucesso', 
      video: newVideo 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token de autorização não encontrado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !['admin', 'sector_admin'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, video_url, thumbnail_url, is_active, order_index, upload_type, thumbnail_timestamp } = body;

    // Enhanced validation
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Título é obrigatório e não pode estar vazio' }, { status: 400 });
    }

    // Validate that video exists before updating
    const { data: existingVideo, error: fetchError } = await supabaseAdmin
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

    if (thumbnail_timestamp !== undefined) {
      updateData.thumbnail_timestamp = thumbnail_timestamp;
    }

    const { data: updatedVideo, error: updateError } = await supabaseAdmin
      .from('dashboard_videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [UPDATE] Erro na atualização:', updateError);
      
      // Tratamento específico para ordem duplicada
      if (updateError.code === '23505' && updateError.message.includes('order_index')) {
        console.log('🔄 [UPDATE] Detectado order_index duplicado, tentando próximo valor...');
        
        // Buscar o próximo order_index disponível
        const { data: maxOrder } = await supabaseAdmin
          .from('dashboard_videos')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1)
          .single();

        const nextOrderIndex = (maxOrder?.order_index || 0) + 1;
        
        console.log('🔄 [UPDATE] Tentando com order_index:', nextOrderIndex);
        
        // Nova tentativa com order_index corrigido
        const { data: updatedVideo2, error: updateError2 } = await supabaseAdmin
          .from('dashboard_videos')
          .update({ ...updateData, order_index: nextOrderIndex })
          .eq('id', id)
          .select()
          .single();

        if (updateError2) {
          return NextResponse.json({ 
            error: `Erro persistente ao atualizar: ${updateError2.message}` 
          }, { status: 500 });
        }

        // Sucesso na segunda tentativa - retornar com aviso
        return NextResponse.json({ 
          message: 'Vídeo atualizado com sucesso', 
          video: updatedVideo2,
          warning: `A ordem ${updateData.order_index} já estava em uso. O vídeo foi posicionado na ordem ${nextOrderIndex}.`
        });
      }
      
      // Outros tipos de erro com mensagens amigáveis
      const friendlyError = updateError.message.includes('duplicate key') 
        ? 'Já existe um vídeo com essas informações. Tente com dados diferentes.'
        : updateError.message.includes('violates check constraint')
        ? 'Dados inválidos fornecidos. Verifique se todos os campos estão corretos.'
        : `Erro ao atualizar vídeo: ${updateError.message}`;

      return NextResponse.json({ 
        error: friendlyError
      }, { status: 400 });
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
    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Get auth token from header - consistent with POST/PUT methods
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token de autorização não encontrado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check if user is admin - following gallery/banners pattern
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !['admin', 'sector_admin'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Get video details before deletion - following gallery/banners pattern
    const { data: video, error: fetchError } = await supabaseAdmin
      .from('dashboard_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 });
    }

    // Clean up associated files if needed
    if (video.upload_type === 'direct' && video.file_path) {
      const { error: fileDeleteError } = await supabaseAdmin.storage
        .from('videos')
        .remove([video.file_path]);
      
      if (fileDeleteError) {
        // Continue with deletion even if file removal fails
      }

      // Clean up temporary files
      const { data: tempFiles } = await supabaseAdmin.storage
        .from('videos')
        .list('temp', { search: video.id });
      
      if (tempFiles && tempFiles.length > 0) {
        const tempPaths = tempFiles.map((file: any) => `temp/${file.name}`);
        await supabaseAdmin.storage.from('videos').remove(tempPaths);
      }
    }

    // Clean up thumbnail if stored in Supabase
    if (video.thumbnail_url && video.thumbnail_url.includes('supabase')) {
      const thumbnailPath = video.thumbnail_url.split('/').pop();
      if (thumbnailPath) {
        const { error: thumbnailDeleteError } = await supabaseAdmin.storage.from('banners').remove([thumbnailPath]);
      }
    }

    // Delete the video record - following gallery/banners pattern
    const { error: deleteError } = await supabaseAdmin
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