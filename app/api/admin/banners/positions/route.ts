import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminSupabaseClient, 
  authenticateAdminRequest, 
  authorizeAdminOperation,
  AdminAPIResponses 
} from '@/lib/supabase/admin';

// GET /api/admin/banners/positions - Obter informações de posicionamento
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

    // Obter todos os banners para análise de posições
    const { data: banners, error: bannersError } = await supabaseAdmin
      .from('banners')
      .select('id, title, order_index')
      .order('order_index', { ascending: true });

    if (bannersError) {
      return NextResponse.json(
        AdminAPIResponses.serverError('Erro ao buscar banners'), 
        { status: 500 }
      );
    }

    // Obter próxima posição disponível
    const { data: nextPosition, error: positionError } = await supabaseAdmin
      .rpc('get_next_available_banner_position');

    if (positionError) {
      console.error('Erro ao obter próxima posição:', positionError);
    }

    // Calcular estatísticas
    const usedPositions = banners?.map(b => b.order_index).sort((a, b) => a - b) || [];
    const maxPosition = Math.max(...usedPositions, -1);
    const gaps = [];
    
    for (let i = 0; i <= maxPosition; i++) {
      if (!usedPositions.includes(i)) {
        gaps.push(i);
      }
    }

    // Verificar se há lacunas
    const hasGaps = gaps.length > 0;
    const isSequential = usedPositions.every((pos, index) => pos === index);

    return NextResponse.json(AdminAPIResponses.success({
      positioning: {
        nextAvailablePosition: nextPosition || maxPosition + 1,
        usedPositions,
        availableGaps: gaps,
        totalBanners: banners?.length || 0,
        maxPosition,
        hasGaps,
        isSequential,
        recommendCompaction: hasGaps && gaps.length > 1
      },
      banners: banners?.map(b => ({
        id: b.id,
        title: b.title,
        position: b.order_index
      })) || []
    }));

  } catch (error) {
    console.error('Erro interno GET positions:', error);
    return NextResponse.json(
      AdminAPIResponses.serverError(), 
      { status: 500 }
    );
  }
}

// POST /api/admin/banners/positions - Compactar posições
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

    const supabaseAdmin = createAdminSupabaseClient();

    // Executar compactação de posições
    const { data: updatedCount, error: compactError } = await supabaseAdmin
      .rpc('compact_banner_positions');

    if (compactError) {
      console.error('Erro ao compactar posições:', compactError);
      return NextResponse.json(
        AdminAPIResponses.serverError('Erro ao compactar posições'), 
        { status: 500 }
      );
    }

    // Obter estado após compactação
    const { data: banners, error: bannersError } = await supabaseAdmin
      .from('banners')
      .select('id, title, order_index')
      .order('order_index', { ascending: true });

    if (bannersError) {
      console.error('Erro ao buscar banners após compactação:', bannersError);
    }

    const message = updatedCount > 0 
      ? `Posições compactadas com sucesso. ${updatedCount} banners reposicionados.`
      : 'Posições já estavam organizadas sequencialmente.';

    return NextResponse.json(AdminAPIResponses.success({
      compaction: {
        bannersUpdated: updatedCount,
        wasNeeded: updatedCount > 0
      },
      banners: banners?.map(b => ({
        id: b.id,
        title: b.title,
        position: b.order_index
      })) || []
    }, message));

  } catch (error) {
    console.error('Erro interno POST positions:', error);
    return NextResponse.json(
      AdminAPIResponses.serverError(), 
      { status: 500 }
    );
  }
}