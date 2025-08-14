import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminSupabaseClient, 
  authenticateAdminRequest, 
  authorizeAdminOperation,
  AdminAPIResponses 
} from '@/lib/supabase/admin';

// GET /api/admin/banners - Listar todos os banners
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(request);
    
    if (!auth.success) {
      return NextResponse.json(
        AdminAPIResponses.unauthorized(), 
        { status: auth.status }
      );
    }

    if (!authorizeAdminOperation(auth.profile?.role)) {
      return NextResponse.json(
        AdminAPIResponses.forbidden(), 
        { status: 403 }
      );
    }

    const supabaseAdmin = createAdminSupabaseClient();
    
    const { data: banners, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Erro ao buscar banners:', error);
      return NextResponse.json(
        AdminAPIResponses.serverError('Erro ao buscar banners'), 
        { status: 500 }
      );
    }

    // Obter próxima posição disponível para novos banners
    const { data: nextPosition, error: positionError } = await supabaseAdmin
      .rpc('get_next_available_banner_position');

    if (positionError) {
      console.error('Erro ao obter próxima posição:', positionError);
    }

    // Obter estatísticas de posições
    const usedPositions = banners?.map(b => b.order_index).sort((a, b) => a - b) || [];
    const maxPosition = Math.max(...usedPositions, -1);
    const gaps = [];
    
    for (let i = 0; i <= maxPosition; i++) {
      if (!usedPositions.includes(i)) {
        gaps.push(i);
      }
    }

    return NextResponse.json(AdminAPIResponses.success({ 
      banners,
      positioning: {
        nextAvailablePosition: nextPosition || maxPosition + 1,
        usedPositions,
        availableGaps: gaps,
        totalBanners: banners?.length || 0
      }
    }));

  } catch (error) {
    console.error('Erro interno GET banners:', error);
    return NextResponse.json(
      AdminAPIResponses.serverError(), 
      { status: 500 }
    );
  }
}

// POST /api/admin/banners - Criar novo banner
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(request);
    
    if (!auth.success) {
      return NextResponse.json(
        AdminAPIResponses.unauthorized(), 
        { status: auth.status }
      );
    }

    if (!authorizeAdminOperation(auth.profile?.role)) {
      return NextResponse.json(
        AdminAPIResponses.forbidden(), 
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    const { title, image_url, link, is_active, order_index } = requestBody;

    if (!title || !image_url) {
      return NextResponse.json(
        { error: 'Título e URL da imagem são obrigatórios' }, 
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // Determinar posição usando sistema inteligente
    let finalOrderIndex = order_index;
    
    if (finalOrderIndex === undefined || finalOrderIndex === null) {
      // Usar função para encontrar próxima posição disponível
      const { data: nextPosition, error: positionError } = await supabaseAdmin
        .rpc('get_next_available_banner_position');

      if (positionError) {
        console.error('Erro ao obter próxima posição disponível:', positionError);
        return NextResponse.json(
          AdminAPIResponses.serverError('Erro ao calcular posição'), 
          { status: 500 }
        );
      }

      finalOrderIndex = nextPosition || 0;
    } else {
      // Verificar se a posição solicitada está disponível e resolver conflitos
      const { data: resolvedPosition, error: resolveError } = await supabaseAdmin
        .rpc('resolve_banner_position_conflict', {
          banner_id: '00000000-0000-0000-0000-000000000000', // ID temporário para novos banners
          requested_position: finalOrderIndex
        });

      if (resolveError) {
        console.error('Erro ao resolver conflito de posição:', resolveError);
        // Continuar com a posição original em caso de erro
      } else if (resolvedPosition !== finalOrderIndex) {
        console.log(`Posição ${finalOrderIndex} ocupada, usando posição ${resolvedPosition}`);
        finalOrderIndex = resolvedPosition;
      }
    }

    const insertData = {
      title,
      image_url,
      link,
      is_active: is_active ?? true,
      order_index: finalOrderIndex
    };

    const { data: newBanner, error: insertError } = await supabaseAdmin
      .from('banners')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar banner:', insertError);
      return NextResponse.json(
        AdminAPIResponses.serverError('Erro ao criar banner'), 
        { status: 500 }
      );
    }

    const responseMessage = finalOrderIndex !== order_index 
      ? `Banner criado com sucesso na posição ${finalOrderIndex} (posição ${order_index} estava ocupada)`
      : 'Banner criado com sucesso';

    return NextResponse.json(
      AdminAPIResponses.success({ 
        banner: newBanner,
        positioning: {
          requestedPosition: order_index,
          finalPosition: finalOrderIndex,
          positionChanged: finalOrderIndex !== order_index
        }
      }, responseMessage)
    );

  } catch (error) {
    console.error('Erro interno POST banners:', error);
    return NextResponse.json(
      AdminAPIResponses.serverError(), 
      { status: 500 }
    );
  }
}

// PUT /api/admin/banners - Atualizar banner existente
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(request);
    
    if (!auth.success) {
      return NextResponse.json(
        AdminAPIResponses.unauthorized(), 
        { status: auth.status }
      );
    }

    if (!authorizeAdminOperation(auth.profile?.role)) {
      return NextResponse.json(
        AdminAPIResponses.forbidden(), 
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    const { id, title, image_url, link, is_active, order_index } = requestBody;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do banner é obrigatório' }, 
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // Verificar se o banner existe
    const { data: existingBanner, error: fetchError } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingBanner) {
      return NextResponse.json(
        AdminAPIResponses.notFound('Banner'), 
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (link !== undefined) updateData.link = link;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    let finalOrderIndex = order_index;
    let positionChanged = false;
    
    if (order_index !== undefined) {
      // Verificar se a nova posição está disponível e resolver conflitos
      const { data: resolvedPosition, error: resolveError } = await supabaseAdmin
        .rpc('resolve_banner_position_conflict', {
          banner_id: id,
          requested_position: order_index
        });

      if (resolveError) {
        console.error('Erro ao resolver conflito de posição na atualização:', resolveError);
        finalOrderIndex = order_index; // Usar posição original se falhar
      } else {
        finalOrderIndex = resolvedPosition;
        positionChanged = resolvedPosition !== order_index;
        
        if (positionChanged) {
          console.log(`Banner ${id}: Posição ${order_index} ocupada, usando posição ${resolvedPosition}`);
        }
      }
      
      updateData.order_index = finalOrderIndex;
    }

    const { data: updatedBanner, error: updateError } = await supabaseAdmin
      .from('banners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar banner:', updateError);
      return NextResponse.json(
        AdminAPIResponses.serverError('Erro ao atualizar banner'), 
        { status: 500 }
      );
    }

    const responseMessage = positionChanged
      ? `Banner atualizado com sucesso na posição ${finalOrderIndex} (posição ${order_index} estava ocupada)`
      : 'Banner atualizado com sucesso';

    return NextResponse.json(
      AdminAPIResponses.success({ 
        banner: updatedBanner,
        positioning: order_index !== undefined ? {
          requestedPosition: order_index,
          finalPosition: finalOrderIndex,
          positionChanged
        } : undefined
      }, responseMessage)
    );

  } catch (error) {
    console.error('Erro interno PUT banners:', error);
    return NextResponse.json(
      AdminAPIResponses.serverError(), 
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banners - Excluir banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' }, 
        { status: 400 }
      );
    }

    const auth = await authenticateAdminRequest(request);
    
    if (!auth.success) {
      return NextResponse.json(
        AdminAPIResponses.unauthorized(), 
        { status: auth.status }
      );
    }

    if (!authorizeAdminOperation(auth.profile?.role)) {
      return NextResponse.json(
        AdminAPIResponses.forbidden(), 
        { status: 403 }
      );
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // Verificar se o banner existe antes de deletar
    const { data: banner, error: fetchError } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !banner) {
      return NextResponse.json(
        AdminAPIResponses.notFound('Banner'), 
        { status: 404 }
      );
    }

    // Deletar o banner
    const { error: deleteError } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir banner:', deleteError);
      return NextResponse.json(
        AdminAPIResponses.serverError('Erro ao excluir banner'), 
        { status: 500 }
      );
    }

    return NextResponse.json(
      AdminAPIResponses.success(null, 'Banner excluído com sucesso')
    );

  } catch (error) {
    console.error('Erro interno DELETE banners:', error);
    return NextResponse.json(
      AdminAPIResponses.serverError(), 
      { status: 500 }
    );
  }
}