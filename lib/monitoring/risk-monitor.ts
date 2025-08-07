/**
 * RISK MONITORING FRAMEWORK
 * Sistema proativo de monitoramento de riscos para upload direto de vídeos
 */

import { supabase } from '@/lib/supabase';
import { telemetry } from './telemetry';

export interface RiskMetric {
  id: string;
  category: 'storage' | 'performance' | 'adoption' | 'cost' | 'technical_debt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  name: string;
  description: string;
  current_value: number;
  threshold_warning: number;
  threshold_critical: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  last_check: string;
  mitigation_actions: string[];
}

export interface RiskAlert {
  risk_id: string;
  triggered_at: string;
  severity: 'warning' | 'critical';
  message: string;
  recommended_actions: string[];
  auto_resolution_attempted: boolean;
}

export class RiskMonitor {
  private static instance: RiskMonitor;
  private supabaseClient = supabase;
  private checkInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: Array<(alert: RiskAlert) => void> = [];

  private constructor() {}

  public static getInstance(): RiskMonitor {
    if (!RiskMonitor.instance) {
      RiskMonitor.instance = new RiskMonitor();
    }
    return RiskMonitor.instance;
  }

  // Inicializar monitoramento contínuo
  public startMonitoring(intervalMs: number = 300000): void { // 5 minutos default
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.performRiskCheck();
    }, intervalMs);

    // Verificação inicial
    this.performRiskCheck();
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Adicionar callback para alertas
  public onAlert(callback: (alert: RiskAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  // Verificação principal de riscos
  private async performRiskCheck(): Promise<void> {
    const risks = await this.getAllRiskMetrics();
    
    for (const risk of risks) {
      const updatedRisk = await this.checkSpecificRisk(risk);
      if (updatedRisk) {
        await this.updateRiskMetric(updatedRisk);
        await this.checkThresholds(updatedRisk);
      }
    }
  }

  // Verificar risco específico
  private async checkSpecificRisk(risk: RiskMetric): Promise<RiskMetric | null> {
    try {
      let currentValue = 0;
      
      switch (risk.category) {
        case 'storage':
          currentValue = await this.checkStorageRisk(risk.id);
          break;
        case 'performance':
          currentValue = await this.checkPerformanceRisk(risk.id);
          break;
        case 'adoption':
          currentValue = await this.checkAdoptionRisk(risk.id);
          break;
        case 'cost':
          currentValue = await this.checkCostRisk(risk.id);
          break;
        case 'technical_debt':
          currentValue = await this.checkTechnicalDebtRisk(risk.id);
          break;
      }

      // Calcular tendência
      const trend = this.calculateTrend(risk.current_value, currentValue);

      return {
        ...risk,
        current_value: currentValue,
        trend,
        last_check: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error checking risk ${risk.id}:`, error);
      return null;
    }
  }

  // STORAGE RISK MONITORING
  private async checkStorageRisk(riskId: string): Promise<number> {
    switch (riskId) {
      case 'storage_quota_usage':
        return await this.getStorageUsagePercentage();
      case 'storage_growth_rate':
        return await this.getStorageGrowthRate();
      case 'large_file_accumulation':
        return await this.getLargeFileCount();
      default:
        return 0;
    }
  }

  private async getStorageUsagePercentage(): Promise<number> {
    // Mock - seria substituído por chamada real ao Supabase Storage
    const used = 7.8 * 1024 * 1024 * 1024; // 7.8 GB
    const total = 10 * 1024 * 1024 * 1024; // 10 GB Pro Plan
    return (used / total) * 100;
  }

  private async getStorageGrowthRate(): Promise<number> {
    try {
      const { data } = await this.supabaseClient
        .from('video_upload_metrics')
        .select('file_size, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('success', true);

      if (!data || data.length === 0) return 0;

      const totalSize = data.reduce((sum, record) => sum + (record.file_size || 0), 0);
      const gbPerWeek = totalSize / (1024 * 1024 * 1024);
      
      return gbPerWeek * 4; // GB per month
    } catch (error) {
      console.error('Error calculating storage growth rate:', error);
      return 0;
    }
  }

  private async getLargeFileCount(): Promise<number> {
    try {
      const { count } = await this.supabaseClient
        .from('video_upload_metrics')
        .select('*', { count: 'exact', head: true })
        .gt('file_size', 500 * 1024 * 1024) // Files > 500MB
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error counting large files:', error);
      return 0;
    }
  }

  // PERFORMANCE RISK MONITORING
  private async checkPerformanceRisk(riskId: string): Promise<number> {
    switch (riskId) {
      case 'upload_success_rate_decline':
        return await this.getUploadSuccessRate();
      case 'average_upload_time_increase':
        return await this.getAverageUploadTime();
      case 'api_error_rate_increase':
        return await this.getAPIErrorRate();
      case 'concurrent_upload_bottleneck':
        return await this.getConcurrentUploadsCount();
      default:
        return 0;
    }
  }

  private async getUploadSuccessRate(): Promise<number> {
    try {
      const { data } = await this.supabaseClient
        .from('video_upload_metrics')
        .select('success')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!data || data.length === 0) return 100;

      const successCount = data.filter(record => record.success).length;
      return (successCount / data.length) * 100;
    } catch (error) {
      console.error('Error calculating upload success rate:', error);
      return 0;
    }
  }

  private async getAverageUploadTime(): Promise<number> {
    try {
      const { data } = await this.supabaseClient
        .from('video_upload_metrics')
        .select('upload_duration')
        .eq('success', true)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!data || data.length === 0) return 0;

      const avgDuration = data.reduce((sum, record) => sum + (record.upload_duration || 0), 0) / data.length;
      return avgDuration / 1000; // Convert to seconds
    } catch (error) {
      console.error('Error calculating average upload time:', error);
      return 0;
    }
  }

  private async getAPIErrorRate(): Promise<number> {
    try {
      const { data } = await this.supabaseClient
        .from('system_performance_metrics')
        .select('status_code')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!data || data.length === 0) return 0;

      const errorCount = data.filter(record => record.status_code >= 400).length;
      return (errorCount / data.length) * 100;
    } catch (error) {
      console.error('Error calculating API error rate:', error);
      return 0;
    }
  }

  private async getConcurrentUploadsCount(): Promise<number> {
    // Mock - seria implementado com monitoramento em tempo real
    return Math.floor(Math.random() * 10); // 0-9 uploads simultâneos
  }

  // ADOPTION RISK MONITORING
  private async checkAdoptionRisk(riskId: string): Promise<number> {
    switch (riskId) {
      case 'user_adoption_rate':
        return await this.getUserAdoptionRate();
      case 'feature_usage_decline':
        return await this.getFeatureUsageRate();
      case 'user_satisfaction_drop':
        return await this.getUserSatisfactionScore();
      default:
        return 0;
    }
  }

  private async getUserAdoptionRate(): Promise<number> {
    try {
      // Calcular taxa de adoção (usuários que fizeram upload direto vs YouTube)
      const { data: directUploads } = await this.supabaseClient
        .from('video_upload_metrics')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: totalUsers } = await this.supabaseClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (!totalUsers || totalUsers === 0) return 0;
      return ((directUploads || 0) / totalUsers) * 100;
    } catch (error) {
      console.error('Error calculating user adoption rate:', error);
      return 0;
    }
  }

  private async getFeatureUsageRate(): Promise<number> {
    try {
      const { data } = await this.supabaseClient
        .from('video_upload_metrics')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      return data?.length || 0; // Uploads per week
    } catch (error) {
      console.error('Error calculating feature usage rate:', error);
      return 0;
    }
  }

  private async getUserSatisfactionScore(): Promise<number> {
    try {
      const { data } = await this.supabaseClient
        .from('user_experience_metrics')
        .select('satisfaction_score')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .not('satisfaction_score', 'is', null);

      if (!data || data.length === 0) return 0;

      const avgSatisfaction = data.reduce((sum, record) => sum + record.satisfaction_score, 0) / data.length;
      return avgSatisfaction;
    } catch (error) {
      console.error('Error calculating user satisfaction:', error);
      return 0;
    }
  }

  // COST RISK MONITORING
  private async checkCostRisk(riskId: string): Promise<number> {
    switch (riskId) {
      case 'bandwidth_cost_increase':
        return await this.getBandwidthUsage();
      case 'storage_cost_projection':
        return await this.getStorageCostProjection();
      default:
        return 0;
    }
  }

  private async getBandwidthUsage(): Promise<number> {
    // Mock - seria integrado com métricas reais do Supabase
    return Math.random() * 100; // GB per month
  }

  private async getStorageCostProjection(): Promise<number> {
    const currentUsage = await this.getStorageUsagePercentage();
    const growthRate = await this.getStorageGrowthRate();
    
    // Projeção de custo baseada no crescimento
    const projectedUsage = currentUsage + (growthRate * 3); // 3 meses à frente
    return projectedUsage;
  }

  // TECHNICAL DEBT RISK MONITORING
  private async checkTechnicalDebtRisk(riskId: string): Promise<number> {
    switch (riskId) {
      case 'error_accumulation':
        return await this.getErrorAccumulationRate();
      case 'maintenance_backlog':
        return await this.getMaintenanceBacklogSize();
      default:
        return 0;
    }
  }

  private async getErrorAccumulationRate(): Promise<number> {
    try {
      const { count } = await this.supabaseClient
        .from('video_upload_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error calculating error accumulation rate:', error);
      return 0;
    }
  }

  private async getMaintenanceBacklogSize(): Promise<number> {
    // Mock - seria integrado com sistema de tickets
    return Math.floor(Math.random() * 20);
  }

  // Utility Methods
  private calculateTrend(previous: number, current: number): 'improving' | 'stable' | 'declining' {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 5) return 'stable';
    return change < 0 ? 'improving' : 'declining';
  }

  private async checkThresholds(risk: RiskMetric): Promise<void> {
    let alertTriggered = false;
    let severity: 'warning' | 'critical' = 'warning';

    if (risk.current_value >= risk.threshold_critical) {
      alertTriggered = true;
      severity = 'critical';
    } else if (risk.current_value >= risk.threshold_warning) {
      alertTriggered = true;
      severity = 'warning';
    }

    if (alertTriggered) {
      const alert: RiskAlert = {
        risk_id: risk.id,
        triggered_at: new Date().toISOString(),
        severity,
        message: `${risk.name}: ${risk.current_value}${risk.unit} (limite ${severity}: ${severity === 'critical' ? risk.threshold_critical : risk.threshold_warning}${risk.unit})`,
        recommended_actions: risk.mitigation_actions,
        auto_resolution_attempted: false,
      };

      // Tentar resolução automática para alguns riscos
      if (this.canAutoResolve(risk)) {
        alert.auto_resolution_attempted = await this.attemptAutoResolution(risk);
      }

      // Notificar callbacks
      this.alertCallbacks.forEach(callback => callback(alert));

      // Armazenar alerta no banco
      await this.storeAlert(alert);

      // Enviar telemetria
      telemetry.trackBusinessMetric('risk_alert_triggered', 1, {
        risk_id: risk.id,
        severity,
        current_value: risk.current_value,
        threshold: severity === 'critical' ? risk.threshold_critical : risk.threshold_warning,
      });
    }
  }

  private canAutoResolve(risk: RiskMetric): boolean {
    // Definir quais riscos podem ter resolução automática
    const autoResolvableRisks = [
      'storage_quota_usage', // Cleanup de arquivos temporários
      'concurrent_upload_bottleneck', // Throttling automático
    ];
    
    return autoResolvableRisks.includes(risk.id);
  }

  private async attemptAutoResolution(risk: RiskMetric): Promise<boolean> {
    try {
      switch (risk.id) {
        case 'storage_quota_usage':
          return await this.cleanupTemporaryFiles();
        case 'concurrent_upload_bottleneck':
          return await this.enableUploadThrottling();
        default:
          return false;
      }
    } catch (error) {
      console.error(`Auto-resolution failed for risk ${risk.id}:`, error);
      return false;
    }
  }

  private async cleanupTemporaryFiles(): Promise<boolean> {
    // Mock - implementaria limpeza de arquivos temporários
    console.log('Auto-cleanup: Removing temporary files...');
    return true;
  }

  private async enableUploadThrottling(): Promise<boolean> {
    // Mock - implementaria throttling automático
    console.log('Auto-throttling: Limiting concurrent uploads...');
    return true;
  }

  // Database Operations
  private async getAllRiskMetrics(): Promise<RiskMetric[]> {
    // Retornar métricas de risco pré-configuradas
    return this.getDefaultRiskMetrics();
  }

  private async updateRiskMetric(risk: RiskMetric): Promise<void> {
    // Mock - atualizaria no banco de dados
    console.log(`Updated risk metric: ${risk.id} = ${risk.current_value}${risk.unit}`);
  }

  private async storeAlert(alert: RiskAlert): Promise<void> {
    try {
      await this.supabaseClient
        .from('risk_alerts')
        .insert({
          risk_id: alert.risk_id,
          triggered_at: alert.triggered_at,
          severity: alert.severity,
          message: alert.message,
          recommended_actions: alert.recommended_actions,
          auto_resolution_attempted: alert.auto_resolution_attempted,
        });
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  private getDefaultRiskMetrics(): RiskMetric[] {
    return [
      // Storage Risks
      {
        id: 'storage_quota_usage',
        category: 'storage',
        severity: 'high',
        name: 'Uso de Quota de Storage',
        description: 'Monitoramento do uso do storage para evitar estouro de quota',
        current_value: 75,
        threshold_warning: 70,
        threshold_critical: 80,
        unit: '%',
        trend: 'declining',
        last_check: new Date().toISOString(),
        mitigation_actions: [
          'Implementar compressão automática de vídeos antigos',
          'Configurar cleanup de arquivos temporários',
          'Considerar upgrade do plano Supabase',
          'Implementar políticas de retenção de dados'
        ],
      },
      {
        id: 'storage_growth_rate',
        category: 'storage',
        severity: 'medium',
        name: 'Taxa de Crescimento de Storage',
        description: 'Monitoramento da velocidade de crescimento do storage',
        current_value: 2.5,
        threshold_warning: 3.0,
        threshold_critical: 5.0,
        unit: 'GB/mês',
        trend: 'stable',
        last_check: new Date().toISOString(),
        mitigation_actions: [
          'Otimizar compressão de vídeos',
          'Implementar políticas de cleanup',
          'Monitorar uploads de arquivos grandes',
          'Educar usuários sobre boas práticas'
        ],
      },

      // Performance Risks
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
        mitigation_actions: [
          'Investigar causas de falhas de upload',
          'Melhorar tratamento de erros de rede',
          'Implementar retry automático',
          'Otimizar infraestrutura de upload'
        ],
      },
      {
        id: 'average_upload_time_increase',
        category: 'performance',
        severity: 'medium',
        name: 'Aumento do Tempo Médio de Upload',
        description: 'Monitoramento da performance de upload',
        current_value: 85,
        threshold_warning: 90,
        threshold_critical: 120,
        unit: 's',
        trend: 'stable',
        last_check: new Date().toISOString(),
        mitigation_actions: [
          'Otimizar algoritmos de compressão',
          'Implementar upload paralelo por chunks',
          'Melhorar infraestrutura de rede',
          'Cache e CDN para otimização'
        ],
      },

      // Adoption Risks
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
        mitigation_actions: [
          'Treinamento adicional para usuários',
          'Melhorar UX do sistema de upload',
          'Campanhas de incentivo ao uso',
          'Documentação e tutoriais'
        ],
      },

      // Cost Risks
      {
        id: 'storage_cost_projection',
        category: 'cost',
        severity: 'medium',
        name: 'Projeção de Custo de Storage',
        description: 'Projeção de custos baseada no crescimento atual',
        current_value: 25,
        threshold_warning: 30,
        threshold_critical: 40,
        unit: 'USD/mês',
        trend: 'stable',
        last_check: new Date().toISOString(),
        mitigation_actions: [
          'Implementar políticas de retenção',
          'Otimizar compressão',
          'Considerar tiers de storage',
          'Monitorar ROI do projeto'
        ],
      },

      // Technical Debt Risks
      {
        id: 'error_accumulation',
        category: 'technical_debt',
        severity: 'low',
        name: 'Acumulação de Erros',
        description: 'Monitoramento de erros não resolvidos',
        current_value: 5,
        threshold_warning: 10,
        threshold_critical: 20,
        unit: 'erros/semana',
        trend: 'stable',
        last_check: new Date().toISOString(),
        mitigation_actions: [
          'Implementar resolução automática de erros comuns',
          'Melhorar logging e debugging',
          'Criar processo de revisão semanal',
          'Investir em testes automatizados'
        ],
      },
    ];
  }
}

// Singleton instance
export const riskMonitor = RiskMonitor.getInstance();