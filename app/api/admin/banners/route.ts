import { NextRequest, NextResponse } from 'next/server';

import { CreateClient } from '@/lib/supabase/server';

// Força renderização dinâmica para usar cookies via createClient
export const dynamic = 'force-dynamic';

// GET /api/admin/banners - Listar todos os banners
export async function GET(_request: NextRequest) {
  try {
    const supabase = CreateClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Erro ao buscar banners:', error);
      return NextResponse.json({ error: 'Erro ao buscar banners' }, { status: 500 });
    }

    // Calcular próxima posição disponível simples (como nos vídeos)
    const maxOrder = banners && banners.length > 0 
      ? Math.max(...banners.map((b: any) => b.order_index))
      : -1;
    const nextPosition = maxOrder + 1;


    // Obter estatísticas de posições
    const usedPositions = banners?.map((b: any) => b.order_index).sort((a: number, b: number) => a - b) || [];
    const maxPosition = Math.max(...usedPositions, -1);
    const gaps = [];
    
    for (let i = 0; i <= maxPosition; i++) {
      if (!usedPositions.includes(i)) {
        gaps.push(i);
      }
    }

    return NextResponse.json({ 
      success: true,
      data: {
        banners,
        positioning: {
          nextAvailablePosition: nextPosition,
          usedPositions,
          availableGaps: gaps,
          totalBanners: banners?.length || 0
        }
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro interno GET banners:', message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/admin/banners - Criar novo banner
export async function POST(request: NextRequest) {
  try {
    const supabase = CreateClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const requestBody = await request.json();
    const { title, image_url, link, is_active, order_index } = requestBody;

    if (!title || !image_url) {
      return NextResponse.json({ error: 'Título e URL da imagem são obrigatórios' }, { status: 400 });
    }

    // Iniciar transação para garantir order_index único
    let finalOrderIndex = order_index;
    let newBanner;
    
    if (finalOrderIndex === undefined || finalOrderIndex === null || finalOrderIndex === 0) {
      // Usar transação para evitar race condition
      const { data, error } = await supabase.rpc('create_banner_with_order', {
        p_title: title,
        p_image_url: image_url,
        p_link: link,
        p_is_active: is_active ?? true
      });

      if (error) {
        console.error('Erro ao criar banner com order:', error);
        // Fallback para método tradicional se RPC não existe
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from('banners')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1);

        if (maxOrderError) {
          return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
        }

        finalOrderIndex = maxOrderData && maxOrderData.length > 0 
          ? maxOrderData[0].order_index + 1 
          : 0;
          
        const insertData = {
          title,
          image_url,
          link,
          is_active: is_active ?? true,
          order_index: finalOrderIndex
        };

        const { data: fallbackBanner, error: insertError } = await supabase
          .from('banners')
          .insert([insertData])
          .select()
          .single();
          
        if (insertError) {
          console.error('Erro ao criar banner:', insertError);
          return NextResponse.json({ error: 'Erro ao criar banner' }, { status: 500 });
        }
        
        newBanner = fallbackBanner;
      } else {
        newBanner = data;
        finalOrderIndex = data.order_index;
      }
    } else {
      // Order_index específico fornecido
      const insertData = {
        title,
        image_url,
        link,
        is_active: is_active ?? true,
        order_index: finalOrderIndex
      };

      const { data: directBanner, error: insertError } = await supabase
        .from('banners')
        .insert([insertData])
        .select()
        .single();
        
      if (insertError) {
        console.error('Erro ao criar banner:', insertError);
        return NextResponse.json({ error: 'Erro ao criar banner' }, { status: 500 });
      }
      
      newBanner = directBanner;
    }


    return NextResponse.json({
      success: true,
      message: 'Banner criado com sucesso',
      data: { 
        banner: newBanner,
        positioning: {
          finalPosition: finalOrderIndex
        }
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro interno POST banners:', message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/admin/banners - Atualizar banner existente
export async function PUT(request: NextRequest) {
  try {
    const supabase = CreateClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const requestBody = await request.json();
    const { id, title, image_url, link, is_active, order_index } = requestBody;

    if (!id) {
      return NextResponse.json({ error: 'ID do banner é obrigatório' }, { status: 400 });
    }

    // Verificar se o banner existe
    const { data: existingBanner, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingBanner) {
      return NextResponse.json({ error: 'Banner não encontrado' }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (link !== undefined) updateData.link = link;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (order_index !== undefined) updateData.order_index = order_index;

    const { data: updatedBanner, error: updateError } = await supabase
      .from('banners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar banner:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar banner' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Banner atualizado com sucesso',
      data: { 
        banner: updatedBanner
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro interno PUT banners:', message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/admin/banners - Excluir banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const supabase = CreateClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se o banner existe antes de deletar
    const { data: banner, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !banner) {
      return NextResponse.json({ error: 'Banner não encontrado' }, { status: 404 });
    }

    // Deletar o banner
    const { error: deleteError } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir banner:', deleteError);
      return NextResponse.json({ error: 'Erro ao excluir banner' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Banner excluído com sucesso'
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro interno DELETE banners:', message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}