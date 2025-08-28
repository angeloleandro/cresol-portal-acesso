import { NextRequest, NextResponse } from 'next/server';

import { CreateClient } from '@/lib/supabase/server';

// Força renderização dinâmica para usar cookies via createClient
export const dynamic = 'force-dynamic';

// GET /api/admin/banners/positions - Obter informações de posicionamento
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

    // Obter todos os banners para análise de posições
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('id, title, order_index')
      .order('order_index', { ascending: true });

    if (bannersError) {
      return NextResponse.json({ error: 'Erro ao buscar banners' }, { status: 500 });
    }

    // Obter próxima posição disponível
    const { data: nextPosition, error: positionError } = await supabase
      .rpc('get_next_available_banner_position');

    if (positionError) {
      console.error('Erro ao obter próxima posição:', positionError);
    }

    // Calcular estatísticas
    const usedPositions = banners?.map((b: any) => b.order_index).sort((a: number, b: number) => a - b) || [];
    const maxPosition = Math.max(...usedPositions, -1);
    const gaps = [];
    
    for (let i = 0; i <= maxPosition; i++) {
      if (!usedPositions.includes(i)) {
        gaps.push(i);
      }
    }

    // Verificar se há lacunas
    const hasGaps = gaps.length > 0;
    const isSequential = usedPositions.every((pos: number, index: number) => pos === index);

    return NextResponse.json({ 
      success: true,
      data: {
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
        banners: banners?.map((b: any) => ({
          id: b.id,
          title: b.title,
          position: b.order_index
        })) || []
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro interno GET positions:', message);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/banners/positions - Compactar posições
export async function POST(_request: NextRequest) {
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

    // Executar compactação de posições
    const { data: updatedCount, error: compactError } = await supabase
      .rpc('compact_banner_positions');

    if (compactError) {
      console.error('Erro ao compactar posições:', compactError);
      return NextResponse.json({ error: 'Erro ao compactar posições' }, { status: 500 });
    }

    // Obter estado após compactação
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('id, title, order_index')
      .order('order_index', { ascending: true });

    if (bannersError) {
      console.error('Erro ao buscar banners após compactação:', bannersError);
    }

    const message = updatedCount > 0 
      ? `Posições compactadas com sucesso. ${updatedCount} banners reposicionados.`
      : 'Posições já estavam organizadas sequencialmente.';

    return NextResponse.json({ 
      success: true,
      message,
      data: {
        compaction: {
          bannersUpdated: updatedCount,
          wasNeeded: updatedCount > 0
        },
        banners: banners?.map((b: any) => ({
          id: b.id,
          title: b.title,
          position: b.order_index
        })) || []
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro interno POST positions:', message);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}