import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('📝 [VIDEO_POST_API] Iniciando criação de vídeo');
  
  try {
    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔧 [VIDEO_POST_API] Configuração:', { 
      supabaseUrl: !!supabaseUrl, 
      serviceKey: !!serviceKey 
    });
    
    if (!supabaseUrl || !serviceKey) {
      console.error('❌ [VIDEO_POST_API] Configuração do servidor incompleta');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔐 [VIDEO_POST_API] Token extraído:', !!token);
    
    if (!token) {
      console.error('❌ [VIDEO_POST_API] Token de autorização não encontrado');
      return NextResponse.json({ error: 'Token de autorização não encontrado' }, { status: 401 });
    }

    console.log('👤 [VIDEO_POST_API] Validando usuário...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    console.log('👤 [VIDEO_POST_API] Usuário encontrado:', !!user);
    console.log('❌ [VIDEO_POST_API] Erro de autenticação:', authError?.message || 'NENHUM');
    
    if (authError || !user) {
      console.error('❌ [VIDEO_POST_API] Não autorizado - erro de usuário');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('🔍 [VIDEO_POST_API] Buscando perfil do usuário:', user.id);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('👤 [VIDEO_POST_API] Perfil encontrado:', !!profile);
    console.log('🎭 [VIDEO_POST_API] Role do usuário:', profile?.role);
    console.log('❌ [VIDEO_POST_API] Erro de perfil:', profileError?.message || 'NENHUM');

    if (profileError || !['admin', 'sector_admin'].includes(profile?.role)) {
      console.error('❌ [VIDEO_POST_API] Acesso negado - sem privilégios');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    console.log('📥 [VIDEO_POST_API] Processando dados do body...');
    const requestBody = await request.json();
    const { title, video_url, thumbnail_url, is_active, order_index, upload_type } = requestBody;
    
    console.log('📋 [VIDEO_POST_API] Dados recebidos:', { 
      title, 
      video_url, 
      thumbnail_url: !!thumbnail_url, 
      is_active, 
      order_index, 
      upload_type 
    });

    console.log('✅ [VIDEO_POST_API] Validando dados obrigatórios...');
    if (!title || !video_url) {
      console.error('❌ [VIDEO_POST_API] Dados obrigatórios ausentes:', { title: !!title, video_url: !!video_url });
      return NextResponse.json({ error: 'Título e URL são obrigatórios' }, { status: 400 });
    }

    console.log('💾 [VIDEO_POST_API] Inserindo vídeo no banco...');
    const insertData = { 
      title, 
      video_url, 
      thumbnail_url, 
      is_active: is_active ?? true, 
      order_index: order_index ?? 0, 
      upload_type: upload_type || 'youtube'
    };
    
    console.log('📊 [VIDEO_POST_API] Dados para inserção:', insertData);
    
    const { data: newVideo, error: insertError } = await supabaseAdmin
      .from('dashboard_videos')
      .insert([insertData])
      .select()
      .single();

    console.log('✅ [VIDEO_POST_API] Vídeo inserido:', !!newVideo);
    console.log('❌ [VIDEO_POST_API] Erro de inserção:', insertError?.message || 'NENHUM');
    console.log('📊 [VIDEO_POST_API] Código do erro:', insertError?.code || 'NENHUM');
    console.log('📋 [VIDEO_POST_API] Detalhes do erro:', insertError?.details || 'NENHUM');

    if (insertError) {
      console.error('💥 [VIDEO_POST_API] Falha na inserção:', insertError);
      return NextResponse.json({ error: `Erro ao criar vídeo: ${insertError.message}` }, { status: 500 });
    }

    console.log('🎉 [VIDEO_POST_API] Vídeo criado com sucesso:', newVideo?.id);
    return NextResponse.json({ 
      message: 'Vídeo criado com sucesso', 
      video: newVideo 
    });

  } catch (error) {
    console.error('💥 [VIDEO_POST_API] Erro interno do servidor:', error);
    console.error('💥 [VIDEO_POST_API] Stack trace:', error instanceof Error ? error.stack : 'Não disponível');
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
    const { id, title, video_url, thumbnail_url, is_active, order_index, upload_type } = body;

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

    const { data: updatedVideo, error: updateError } = await supabaseAdmin
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
        console.error('Erro ao remover arquivo de vídeo:', fileDeleteError);
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
        if (thumbnailDeleteError) {
          console.error('Erro ao remover thumbnail:', thumbnailDeleteError);
        }
      }
    }

    // Delete the video record - following gallery/banners pattern
    const { error: deleteError } = await supabaseAdmin
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