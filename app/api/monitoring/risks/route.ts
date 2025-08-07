import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { riskMonitor } from '@/lib/monitoring/risk-monitor';

/**
 * API ENDPOINT - Risk Monitoring
 * Endpoints para monitoramento de riscos do projeto de upload direto
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'current-risks':
        return await getCurrentRisks();
      
      case 'risk-alerts':
        return await getRiskAlerts(url.searchParams);
      
      case 'risk-history':
        return await getRiskHistory(url.searchParams);
      
      default:
        return await getCurrentRisks();
    }

  } catch (error) {
    console.error('Error in risk monitoring API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getCurrentRisks() {
  try {
    // Mock data - seria substituído por dados reais do RiskMonitor
    const risks = [
      {
        id: 'storage_quota_usage',
        category: 'storage',
        severity: 'high',
        name: 'Uso de Quota de Storage',
        description: 'Monitoramento do uso do storage para evitar estouro de quota',
        current_value: 78,
        threshold_warning: 70,
        threshold_critical: 80,
        unit: '%',
        trend: 'declining',
        last_check: new Date().toISOString(),
        status: 'warning',
        mitigation_actions: [
          'Implementar compressão automática de vídeos antigos',
          'Configurar cleanup de arquivos temporários',
          'Considerar upgrade do plano Supabase'
        ],
      },
      {
        id: 'upload_success_rate_decline',
        category: 'performance',
        severity: 'critical',
        name: 'Declínio da Taxa de Sucesso',
        description: 'Monitoramento da taxa de sucesso de uploads',
        current_value: 92,
        threshold_warning: 95,
        threshold_critical: 90,
        unit: '%',
        trend: 'declining',
        last_check: new Date().toISOString(),
        status: 'warning',
        mitigation_actions: [
          'Investigar causas de falhas de upload',
          'Melhorar tratamento de erros de rede',
          'Implementar retry automático'
        ],
      },
      {
        id: 'user_adoption_rate',
        category: 'adoption',
        severity: 'medium',
        name: 'Taxa de Adoção de Usuários',
        description: 'Monitoramento da adoção do upload direto vs YouTube',
        current_value: 65,
        threshold_warning: 60,
        threshold_critical: 40,
        unit: '%',
        trend: 'improving',
        last_check: new Date().toISOString(),
        status: 'healthy',
        mitigation_actions: [
          'Treinamento adicional para usuários',
          'Melhorar UX do sistema de upload',
          'Campanhas de incentivo ao uso'
        ],
      }
    ];

    // Calcular estatísticas gerais
    const riskStats = {
      total_risks: risks.length,
      critical_count: risks.filter(r => r.status === 'critical').length,
      warning_count: risks.filter(r => r.status === 'warning').length,
      healthy_count: risks.filter(r => r.status === 'healthy').length,
      categories: {
        storage: risks.filter(r => r.category === 'storage').length,
        performance: risks.filter(r => r.category === 'performance').length,
        adoption: risks.filter(r => r.category === 'adoption').length,
        cost: risks.filter(r => r.category === 'cost').length,
        technical_debt: risks.filter(r => r.category === 'technical_debt').length,
      },
      last_update: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        risks,
        statistics: riskStats,
      },
    });

  } catch (error) {
    console.error('Error getting current risks:', error);
    return NextResponse.json(
      { error: 'Failed to get current risks' },
      { status: 500 }
    );
  }
}

async function getRiskAlerts(searchParams: URLSearchParams) {
  try {
    const limit = parseInt(searchParams.get('limit') || '50');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');

    // Mock data - seria substituído por query real no Supabase
    let alerts = [
      {
        id: '1',
        risk_id: 'storage_quota_usage',
        risk_name: 'Uso de Quota de Storage',
        triggered_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        severity: 'warning',
        message: 'Storage usage reached 78% of quota limit',
        current_value: 78,
        threshold: 70,
        unit: '%',
        recommended_actions: [
          'Implementar compressão automática',
          'Configurar cleanup de arquivos temporários'
        ],
        auto_resolution_attempted: false,
        resolved_at: null,
        resolved_by: null,
      },
      {
        id: '2',
        risk_id: 'upload_success_rate_decline',
        risk_name: 'Declínio da Taxa de Sucesso',
        triggered_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        severity: 'warning',
        message: 'Upload success rate dropped to 92%',
        current_value: 92,
        threshold: 95,
        unit: '%',
        recommended_actions: [
          'Investigar causas de falhas',
          'Melhorar tratamento de erros'
        ],
        auto_resolution_attempted: true,
        resolved_at: null,
        resolved_by: null,
      }
    ];

    // Aplicar filtros
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    if (category) {
      // Filtrar por categoria baseado no risk_id
      alerts = alerts.filter(alert => {
        if (category === 'storage') return alert.risk_id.includes('storage');
        if (category === 'performance') return alert.risk_id.includes('success') || alert.risk_id.includes('time');
        return true;
      });
    }

    // Limitar resultados
    alerts = alerts.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
        filters: {
          severity,
          category,
          limit,
        },
      },
    });

  } catch (error) {
    console.error('Error getting risk alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get risk alerts' },
      { status: 500 }
    );
  }
}

async function getRiskHistory(searchParams: URLSearchParams) {
  try {
    const risk_id = searchParams.get('risk_id');
    const days = parseInt(searchParams.get('days') || '30');

    if (!risk_id) {
      return NextResponse.json(
        { error: 'risk_id parameter is required' },
        { status: 400 }
      );
    }

    // Mock data - seria substituído por query real no Supabase
    const history = [];
    const now = Date.now();
    const interval = (days * 24 * 60 * 60 * 1000) / 100; // 100 pontos de dados

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now - (i * interval)).toISOString();
      let value = 75; // Base value

      // Simular diferentes padrões baseados no risk_id
      if (risk_id === 'storage_quota_usage') {
        value = 65 + (i * 0.2) + (Math.random() * 5 - 2.5);
      } else if (risk_id === 'upload_success_rate_decline') {
        value = 98 - (i * 0.05) + (Math.random() * 3 - 1.5);
      } else if (risk_id === 'user_adoption_rate') {
        value = 50 + (i * 0.15) + (Math.random() * 4 - 2);
      }

      history.push({
        timestamp,
        value: Math.max(0, Math.min(100, value)),
        date: timestamp.split('T')[0],
      });
    }

    // Reverter para ordem cronológica
    history.reverse();

    return NextResponse.json({
      success: true,
      data: {
        risk_id,
        period_days: days,
        data_points: history.length,
        history,
      },
    });

  } catch (error) {
    console.error('Error getting risk history:', error);
    return NextResponse.json(
      { error: 'Failed to get risk history' },
      { status: 500 }
    );
  }
}

// POST endpoint para ações de mitigação
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, risk_id, alert_id } = body;

    switch (action) {
      case 'resolve_alert':
        return await resolveAlert(alert_id, user.id);
      
      case 'trigger_mitigation':
        return await triggerMitigation(risk_id, user.id);
      
      case 'update_thresholds':
        return await updateThresholds(body.thresholds, user.id);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in risk monitoring POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function resolveAlert(alertId: string, userId: string) {
  try {
    // Mock - atualizaria o alerta como resolvido
    console.log(`Resolving alert ${alertId} by user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Alert resolved successfully',
      data: {
        alert_id: alertId,
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      },
    });

  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}

async function triggerMitigation(riskId: string, userId: string) {
  try {
    // Mock - dispararia ações de mitigação automática
    console.log(`Triggering mitigation for risk ${riskId} by user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Mitigation actions triggered successfully',
      data: {
        risk_id: riskId,
        triggered_at: new Date().toISOString(),
        triggered_by: userId,
        actions_initiated: [
          'Storage cleanup initiated',
          'Performance monitoring increased',
          'User notifications sent'
        ],
      },
    });

  } catch (error) {
    console.error('Error triggering mitigation:', error);
    return NextResponse.json(
      { error: 'Failed to trigger mitigation' },
      { status: 500 }
    );
  }
}

async function updateThresholds(thresholds: any, userId: string) {
  try {
    // Mock - atualizaria os thresholds dos riscos
    console.log(`Updating thresholds by user ${userId}:`, thresholds);

    return NextResponse.json({
      success: true,
      message: 'Risk thresholds updated successfully',
      data: {
        updated_at: new Date().toISOString(),
        updated_by: userId,
        thresholds,
      },
    });

  } catch (error) {
    console.error('Error updating thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to update thresholds' },
      { status: 500 }
    );
  }
}