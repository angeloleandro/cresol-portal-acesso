/**
 * SUCCESS CRITERIA TRACKER
 * Sistema para acompanhar o progresso dos critérios de sucesso do projeto
 */

import { supabase } from '@/lib/supabase';
import { telemetry } from './telemetry';

export interface PhaseGate {
  phase: 'phase_1' | 'phase_2' | 'phase_3';
  name: string;
  criteria: SuccessCriterion[];
  target_completion: string;
  actual_completion?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completion_percentage: number;
  blocking_issues: string[];
}

export interface SuccessCriterion {
  id: string;
  category: 'technical' | 'business' | 'user_experience' | 'security' | 'sustainability';
  name: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  weight: number; // 0-1, importance in overall score
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  evidence: string[];
  validation_method: string;
  last_updated: string;
}

export interface ProjectSuccessScore {
  overall_score: number;
  business_score: number;
  technical_score: number;
  user_experience_score: number;
  sustainability_score: number;
  calculated_at: string;
  success_level: 'excellent' | 'good' | 'acceptable' | 'needs_improvement';
  recommendations: string[];
}

export class SuccessTracker {
  private static instance: SuccessTracker;
  private supabaseClient = supabase;

  private constructor() {}

  public static getInstance(): SuccessTracker {
    if (!SuccessTracker.instance) {
      SuccessTracker.instance = new SuccessTracker();
    }
    return SuccessTracker.instance;
  }

  // Obter todas as gates de fase
  public async getPhaseGates(): Promise<PhaseGate[]> {
    return this.getDefaultPhaseGates();
  }

  // Obter critérios de uma fase específica
  public async getPhaseCriteria(phase: string): Promise<SuccessCriterion[]> {
    const gates = await this.getPhaseGates();
    const phaseGate = gates.find(g => g.phase === phase);
    return phaseGate?.criteria || [];
  }

  // Atualizar critério específico
  public async updateCriterion(criterionId: string, updates: Partial<SuccessCriterion>): Promise<void> {
    try {
      const criterion = await this.getCriterionById(criterionId);
      if (!criterion) {
        throw new Error(`Criterion ${criterionId} not found`);
      }

      const updatedCriterion = {
        ...criterion,
        ...updates,
        last_updated: new Date().toISOString(),
      };

      // Atualizar status baseado no progresso
      if (updatedCriterion.current_value >= updatedCriterion.target_value) {
        updatedCriterion.status = 'completed';
      } else if (updatedCriterion.current_value > 0) {
        updatedCriterion.status = 'in_progress';
      }

      // Mock - armazenaria no banco de dados
      console.log(`Updated criterion: ${criterionId}`, updatedCriterion);

      // Enviar telemetria
      telemetry.trackBusinessMetric('success_criterion_updated', updatedCriterion.current_value, {
        criterion_id: criterionId,
        category: updatedCriterion.category,
        status: updatedCriterion.status,
        progress_percentage: (updatedCriterion.current_value / updatedCriterion.target_value) * 100,
      });

    } catch (error) {
      console.error('Error updating criterion:', error);
      throw error;
    }
  }

  // Calcular Project Success Score (PSS)
  public async calculateProjectSuccessScore(): Promise<ProjectSuccessScore> {
    try {
      const gates = await this.getPhaseGates();
      const allCriteria = gates.flatMap(gate => gate.criteria);

      // Agrupar critérios por categoria
      const businessCriteria = allCriteria.filter(c => c.category === 'business');
      const technicalCriteria = allCriteria.filter(c => c.category === 'technical');
      const userExperienceCriteria = allCriteria.filter(c => c.category === 'user_experience');
      const sustainabilityCriteria = allCriteria.filter(c => c.category === 'sustainability' || c.category === 'security');

      // Calcular scores por categoria
      const businessScore = this.calculateCategoryScore(businessCriteria);
      const technicalScore = this.calculateCategoryScore(technicalCriteria);
      const userExperienceScore = this.calculateCategoryScore(userExperienceCriteria);
      const sustainabilityScore = this.calculateCategoryScore(sustainabilityCriteria);

      // Calcular score geral (weighted)
      const overallScore = 
        (businessScore * 0.40) + 
        (technicalScore * 0.30) + 
        (userExperienceScore * 0.20) + 
        (sustainabilityScore * 0.10);

      // Determinar nível de sucesso
      let successLevel: ProjectSuccessScore['success_level'] = 'needs_improvement';
      if (overallScore >= 85) successLevel = 'excellent';
      else if (overallScore >= 70) successLevel = 'good';
      else if (overallScore >= 55) successLevel = 'acceptable';

      // Gerar recomendações
      const recommendations = this.generateRecommendations(
        { businessScore, technicalScore, userExperienceScore, sustainabilityScore },
        allCriteria
      );

      const result: ProjectSuccessScore = {
        overall_score: overallScore,
        business_score: businessScore,
        technical_score: technicalScore,
        user_experience_score: userExperienceScore,
        sustainability_score: sustainabilityScore,
        calculated_at: new Date().toISOString(),
        success_level: successLevel,
        recommendations,
      };

      // Enviar telemetria
      telemetry.trackBusinessMetric('project_success_score', overallScore, {
        success_level: successLevel,
        business_score: businessScore,
        technical_score: technicalScore,
        user_experience_score: userExperienceScore,
        sustainability_score: sustainabilityScore,
      });

      return result;

    } catch (error) {
      console.error('Error calculating project success score:', error);
      throw error;
    }
  }

  // Validar gate de fase
  public async validatePhaseGate(phase: string): Promise<{ passed: boolean; blockers: string[] }> {
    try {
      const criteria = await this.getPhaseCriteria(phase);
      const blockers: string[] = [];

      for (const criterion of criteria) {
        if (criterion.status !== 'completed') {
          const progress = (criterion.current_value / criterion.target_value) * 100;
          if (progress < 80) { // Threshold para blocking
            blockers.push(`${criterion.name}: ${progress.toFixed(1)}% complete (target: ${criterion.target_value}${criterion.unit})`);
          }
        }
      }

      const passed = blockers.length === 0;

      return { passed, blockers };

    } catch (error) {
      console.error('Error validating phase gate:', error);
      throw error;
    }
  }

  // Gerar relatório de progresso
  public async generateProgressReport(): Promise<{
    overall_progress: number;
    phase_progress: Record<string, number>;
    critical_blockers: string[];
    achievements: string[];
    next_actions: string[];
  }> {
    try {
      const gates = await this.getPhaseGates();
      const successScore = await this.calculateProjectSuccessScore();

      // Calcular progresso geral
      const overallProgress = successScore.overall_score;

      // Calcular progresso por fase
      const phaseProgress: Record<string, number> = {};
      for (const gate of gates) {
        phaseProgress[gate.phase] = gate.completion_percentage;
      }

      // Identificar blockers críticos
      const criticalBlockers: string[] = [];
      const allCriteria = gates.flatMap(gate => gate.criteria);
      for (const criterion of allCriteria) {
        if (criterion.status === 'failed' || 
            (criterion.current_value / criterion.target_value < 0.5 && criterion.weight > 0.7)) {
          criticalBlockers.push(`${criterion.name}: ${(criterion.current_value / criterion.target_value * 100).toFixed(1)}% of target`);
        }
      }

      // Listar achievements
      const achievements: string[] = [];
      for (const criterion of allCriteria) {
        if (criterion.status === 'completed') {
          achievements.push(`✅ ${criterion.name}: ${criterion.current_value}${criterion.unit} achieved`);
        }
      }

      // Próximas ações
      const nextActions = this.generateNextActions(allCriteria, successScore.success_level);

      return {
        overall_progress: overallProgress,
        phase_progress: phaseProgress,
        critical_blockers: criticalBlockers,
        achievements,
        next_actions: nextActions,
      };

    } catch (error) {
      console.error('Error generating progress report:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados

  private async getCriterionById(criterionId: string): Promise<SuccessCriterion | null> {
    const gates = await this.getPhaseGates();
    const allCriteria = gates.flatMap(gate => gate.criteria);
    return allCriteria.find(c => c.id === criterionId) || null;
  }

  private calculateCategoryScore(criteria: SuccessCriterion[]): number {
    if (criteria.length === 0) return 100;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const criterion of criteria) {
      const progress = Math.min(100, (criterion.current_value / criterion.target_value) * 100);
      weightedSum += progress * criterion.weight;
      totalWeight += criterion.weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private generateRecommendations(
    scores: { businessScore: number; technicalScore: number; userExperienceScore: number; sustainabilityScore: number },
    criteria: SuccessCriterion[]
  ): string[] {
    const recommendations: string[] = [];

    // Recomendações baseadas em scores baixos
    if (scores.businessScore < 70) {
      recommendations.push('Focus on business KPIs: improve user adoption and operational efficiency');
    }
    if (scores.technicalScore < 70) {
      recommendations.push('Address technical issues: optimize performance and reliability');
    }
    if (scores.userExperienceScore < 70) {
      recommendations.push('Enhance user experience: improve usability and accessibility');
    }
    if (scores.sustainabilityScore < 70) {
      recommendations.push('Strengthen sustainability: improve security and operational procedures');
    }

    // Recomendações baseadas em critérios específicos em atraso
    const failingCriteria = criteria.filter(c => 
      c.status === 'failed' || (c.current_value / c.target_value < 0.6 && c.weight > 0.5)
    );

    for (const criterion of failingCriteria.slice(0, 3)) { // Top 3 issues
      recommendations.push(`Priority fix needed: ${criterion.name} (${(criterion.current_value / criterion.target_value * 100).toFixed(1)}% of target)`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent progress! Continue monitoring and maintain current quality standards');
    }

    return recommendations;
  }

  private generateNextActions(criteria: SuccessCriterion[], successLevel: string): string[] {
    const actions: string[] = [];

    // Ações baseadas no nível de sucesso
    switch (successLevel) {
      case 'needs_improvement':
        actions.push('Immediate action required: Address all critical and high-priority issues');
        actions.push('Daily standups to track progress on blocking items');
        actions.push('Consider additional resources or scope reduction');
        break;
      
      case 'acceptable':
        actions.push('Focus on top 3 improvement areas to reach "good" level');
        actions.push('Implement quick wins to boost overall score');
        actions.push('Regular progress reviews to maintain momentum');
        break;
      
      case 'good':
        actions.push('Polish remaining issues to achieve "excellent" rating');
        actions.push('Focus on user experience and sustainability improvements');
        actions.push('Document lessons learned and best practices');
        break;
      
      case 'excellent':
        actions.push('Maintain current standards through ongoing monitoring');
        actions.push('Share success patterns with other projects');
        actions.push('Plan for continuous improvement post-launch');
        break;
    }

    // Ações específicas baseadas em critérios
    const inProgressCriteria = criteria.filter(c => c.status === 'in_progress');
    if (inProgressCriteria.length > 0) {
      actions.push(`Complete ${inProgressCriteria.length} in-progress criteria`);
    }

    return actions;
  }

  // Configuração padrão de gates e critérios
  private getDefaultPhaseGates(): PhaseGate[] {
    return [
      {
        phase: 'phase_1',
        name: 'Foundation Setup',
        target_completion: '2024-01-15',
        status: 'in_progress',
        completion_percentage: 75,
        blocking_issues: [],
        criteria: [
          {
            id: 'database_schema_setup',
            category: 'technical',
            name: 'Database Schema Setup',
            description: 'Database schema criado e validado',
            target_value: 100,
            current_value: 100,
            unit: '%',
            weight: 0.8,
            status: 'completed',
            evidence: ['Schema migration executed successfully'],
            validation_method: 'Automated migration test',
            last_updated: new Date().toISOString(),
          },
          {
            id: 'tus_server_integration',
            category: 'technical',
            name: 'TUS Server Integration',
            description: 'Servidor TUS rodando e configurado corretamente',
            target_value: 100,
            current_value: 85,
            unit: '%',
            weight: 0.9,
            status: 'in_progress',
            evidence: ['TUS server responding to healthchecks', 'Upload functionality working'],
            validation_method: 'Integration tests',
            last_updated: new Date().toISOString(),
          },
          {
            id: 'basic_upload_functionality',
            category: 'technical',
            name: 'Basic Upload Functionality',
            description: 'Upload básico de arquivos funcionando (até 500MB)',
            target_value: 500,
            current_value: 500,
            unit: 'MB',
            weight: 1.0,
            status: 'completed',
            evidence: ['Successfully uploaded 500MB test file'],
            validation_method: 'Manual testing',
            last_updated: new Date().toISOString(),
          },
          {
            id: 'progress_tracking',
            category: 'user_experience',
            name: 'Progress Tracking',
            description: 'Barra de progresso funcionando em tempo real',
            target_value: 100,
            current_value: 90,
            unit: '%',
            weight: 0.6,
            status: 'in_progress',
            evidence: ['Progress bar updates every 5%', 'Real-time feedback working'],
            validation_method: 'UI testing',
            last_updated: new Date().toISOString(),
          },
        ],
      },
      {
        phase: 'phase_2',
        name: 'Core Features',
        target_completion: '2024-01-17',
        status: 'not_started',
        completion_percentage: 20,
        blocking_issues: ['Waiting for Phase 1 completion'],
        criteria: [
          {
            id: 'large_file_support',
            category: 'technical',
            name: 'Large File Support',
            description: 'Suporte para arquivos até 2GB',
            target_value: 2048,
            current_value: 500,
            unit: 'MB',
            weight: 0.9,
            status: 'in_progress',
            evidence: [],
            validation_method: 'Stress testing with 2GB files',
            last_updated: new Date().toISOString(),
          },
          {
            id: 'format_support',
            category: 'technical',
            name: 'Format Support',
            description: 'Todos os formatos principais (MP4, AVI, MOV, etc.)',
            target_value: 95,
            current_value: 60,
            unit: '%',
            weight: 0.7,
            status: 'in_progress',
            evidence: ['MP4 and MOV support confirmed'],
            validation_method: 'Format compatibility testing',
            last_updated: new Date().toISOString(),
          },
          {
            id: 'admin_integration',
            category: 'user_experience',
            name: 'Admin Integration',
            description: 'Interface integrada no painel admin',
            target_value: 100,
            current_value: 30,
            unit: '%',
            weight: 0.8,
            status: 'in_progress',
            evidence: ['Basic UI components created'],
            validation_method: 'User acceptance testing',
            last_updated: new Date().toISOString(),
          },
        ],
      },
      {
        phase: 'phase_3',
        name: 'Production Ready',
        target_completion: '2024-01-19',
        status: 'not_started',
        completion_percentage: 0,
        blocking_issues: ['Waiting for Phase 2 completion'],
        criteria: [
          {
            id: 'performance_optimization',
            category: 'technical',
            name: 'Performance Optimization',
            description: 'Upload 1GB em <5min (95th percentile)',
            target_value: 5,
            current_value: 8,
            unit: 'min',
            weight: 0.9,
            status: 'not_started',
            evidence: [],
            validation_method: 'Performance benchmarking',
            last_updated: new Date().toISOString(),
          },
          {
            id: 'monitoring_system',
            category: 'sustainability',
            name: 'Monitoring System',
            description: 'Sistema de monitoramento completo',
            target_value: 100,
            current_value: 40,
            unit: '%',
            weight: 0.8,
            status: 'in_progress',
            evidence: ['Basic telemetry implemented'],
            validation_method: 'Monitoring dashboard validation',
            last_updated: new Date().toISOString(),
          },
          {
            id: 'security_validation',
            category: 'security',
            name: 'Security Validation',
            description: 'Zero vulnerabilidades críticas ou altas',
            target_value: 0,
            current_value: 2,
            unit: 'vulnerabilities',
            weight: 1.0,
            status: 'not_started',
            evidence: [],
            validation_method: 'Security scan',
            last_updated: new Date().toISOString(),
          },
        ],
      },
    ];
  }
}

// Singleton instance
export const successTracker = SuccessTracker.getInstance();