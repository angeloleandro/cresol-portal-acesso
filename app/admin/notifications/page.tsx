'use client';

import React, { useState } from 'react';
import { 
  StandardizedAdminLayout, 
  StandardizedPageHeader,
  StandardizedMetricsCard,
  StandardizedMetricsGrid,
  StandardizedTabsList,
  StandardizedTabContent,
  type BreadcrumbItem
} from '@/app/components/admin';
import { Tabs } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { NotificationFormEnhanced } from './components/enhanced/NotificationFormEnhanced';
import { GroupsManager } from './components/GroupsManager';
import { NotificationHistory } from './components/NotificationHistory';
import { useAuth, useFormData, useGroups } from './hooks';
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';

/**
 * PÁGINA DE NOTIFICAÇÕES PADRONIZADA
 * 
 * Implementação completamente padronizada seguindo o design system Cresol.
 * 
 * Features implementadas:
 * - Layout padronizado com StandardizedAdminLayout
 * - Header padronizado com StandardizedPageHeader
 * - Cards de métricas usando StandardizedMetricsCard
 * - Sistema de tabs Chakra UI v3 com StandardizedChakraTabs
 * - Design clean e minimalista
 * - Responsivo e acessível
 * - Cores neutras (sem tons azulados)
 * - Espaçamento consistente
 * - Hierarquia visual otimizada
 */

type TabType = 'send' | 'groups' | 'history';

export default function NotificationsAdminStandardized() {
  const { user, loading } = useAuth();
  const { availableUsers } = useFormData();
  const { groups } = useGroups();
  const [activeTab, setActiveTab] = useState<TabType>('send');

  if (loading) {
    return <AdminSpinner fullScreen message="Carregando painel administrativo..." size="lg" />;
  }

  if (!user) {
    return null; // useAuth handles redirects
  }

  // Breadcrumbs padronizados
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/home', icon: 'house' },
    { label: 'Administração', href: '/admin' },
    { label: 'Notificações' }
  ];

  // Tabs configuradas para Chakra UI
  const tabs = [
    {
      value: 'send',
      label: 'Nova Notificação',
      icon: <LuUser />
    },
    {
      value: 'groups',
      label: 'Grupos',
      icon: <LuFolder />
    },
    {
      value: 'history',
      label: 'Histórico',
      icon: <LuSquareCheck />
    }
  ];

  // Dados mockados para demonstrar trends (implementar com dados reais)
  const mockNotificationsToday = 0;
  const mockTotalSent = 245; // Implementar contador real
  const mockDeliveryRate = 98.5; // Implementar taxa real

  return (
    <StandardizedAdminLayout user={user} breadcrumbs={breadcrumbs}>
      {/* Header padronizado */}
      <StandardizedPageHeader
        title="Central de Notificações"
        subtitle="Gerencie comunicações, configure grupos de usuários e acompanhe o histórico de mensagens enviadas"
      />

      {/* Cards de métricas padronizados */}
      <StandardizedMetricsGrid columns={3} className="mb-8">
        <StandardizedMetricsCard
          title="Total de Grupos"
          value={groups.length}
          icon="user-group"
          color="secondary"
          trend={{ value: 12, isPositive: true, period: 'vs. mês anterior' }}
          description="Grupos ativos de usuários"
        />
        
        <StandardizedMetricsCard
          title="Usuários Ativos"
          value={availableUsers.length}
          icon="user-circle"
          color="secondary"
          trend={{ value: 8, isPositive: true, period: 'vs. mês anterior' }}
          description="Usuários com acesso ao sistema"
        />

        <StandardizedMetricsCard
          title="Mensagens Hoje"
          value={mockNotificationsToday}
          icon="mail"
          color="secondary"
          trend={{ value: 0, isPositive: true, period: 'vs. ontem' }}
          description="Notificações enviadas hoje"
        />
      </StandardizedMetricsGrid>

      {/* Cards de métricas secundárias (mais compactos) */}
      <StandardizedMetricsGrid columns={2} className="mb-8">
        <StandardizedMetricsCard
          title="Total de Mensagens Enviadas"
          value={mockTotalSent}
          icon="mail"
          color="secondary"
          size="sm"
          trend={{ value: 15, isPositive: true, period: 'últimos 30 dias' }}
          description="Histórico completo de notificações"
        />
        
        <StandardizedMetricsCard
          title="Taxa de Entrega"
          value={`${mockDeliveryRate}%`}
          icon="check-circle"
          color="secondary"
          size="sm"
          trend={{ value: 2.1, isPositive: true, period: 'vs. média anterior' }}
          description="Sucesso na entrega das mensagens"
        />
      </StandardizedMetricsGrid>

      {/* Tabs Chakra UI v3 padronizadas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <Tabs.Root 
            value={activeTab} 
            onValueChange={(details) => setActiveTab(details.value as TabType)}
            variant="plain"
            size="md"
            colorPalette="gray"
          >
            <StandardizedTabsList
              tabs={tabs}
              className="mb-6"
            />

            {/* Conteúdo das tabs */}
            <div className="mt-6">
              <StandardizedTabContent value="send">
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Criar Nova Notificação</h3>
                    <p>Envie mensagens para usuários específicos ou grupos. Configure prioridade e tipo de notificação.</p>
                  </div>
                  <NotificationFormEnhanced 
                    availableUsers={availableUsers}
                    availableGroups={groups}
                  />
                </div>
              </StandardizedTabContent>

              <StandardizedTabContent value="groups">
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Gerenciar Grupos</h3>
                    <p>Crie, edite ou remova grupos de usuários para facilitar o envio de notificações em massa.</p>
                  </div>
                  <GroupsManager />
                </div>
              </StandardizedTabContent>

              <StandardizedTabContent value="history">
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Histórico de Notificações</h3>
                    <p>Visualize o histórico completo de notificações enviadas, status de entrega e estatísticas.</p>
                  </div>
                  <NotificationHistory />
                </div>
              </StandardizedTabContent>
            </div>
          </Tabs.Root>
        </div>
      </div>
    </StandardizedAdminLayout>
  );
}