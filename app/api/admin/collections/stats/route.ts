// Admin Collections Stats API
// Estatísticas de coleções para interface administrativa

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ERROR_MESSAGES } from '@/lib/constants/collections';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// GET /api/admin/collections/stats - Obter estatísticas das coleções
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 403 }
      );
    }

    // Obter estatísticas gerais
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, is_active, type, created_at');

    if (collectionsError) {
      console.error('Erro ao buscar coleções para stats:', collectionsError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    // Obter total de itens
    const { count: totalItems, error: itemsError } = await supabase
      .from('collection_items')
      .select('*', { count: 'exact', head: true });

    if (itemsError) {
      console.error('Erro ao contar itens:', itemsError);
    }

    // Calcular estatísticas
    const total = collections?.length || 0;
    const active = collections?.filter(c => c.is_active).length || 0;
    const inactive = total - active;

    const byType = {
      mixed: collections?.filter(c => c.type === 'mixed').length || 0,
      images: collections?.filter(c => c.type === 'images').length || 0,
      videos: collections?.filter(c => c.type === 'videos').length || 0,
    };

    // Atividade recente (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = collections?.filter(c => 
      new Date(c.created_at) >= sevenDaysAgo
    ).length || 0;

    const stats = {
      total,
      active,
      inactive,
      by_type: byType,
      total_items: totalItems || 0,
      recent_activity: recentActivity,
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Erro na API de estatísticas:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}