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
      icon: <LuUser size={16} />
    },
    {
      value: 'groups',
      label: 'Grupos',
      icon: <LuFolder size={16} />
    },
    {
      value: 'history',
      label: 'Histórico',
      icon: <LuSquareCheck size={16} />
    }
  ];

  // Dados reais calculados do sistema
  const notificationsToday = 0; // Implementar com query real quando houver dados
  const totalSent = 0; // Implementar com query real quando houver dados  
  const deliveryRate = 0; // Implementar com query real quando houver dados

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
          color="primary"
          description="Grupos ativos de usuários"
        />
        
        <StandardizedMetricsCard
          title="Usuários Ativos"
          value={availableUsers.length}
          icon="user-circle"
          color="primary"
          description="Usuários com acesso ao sistema"
        />

        <StandardizedMetricsCard
          title="Mensagens Hoje"
          value={notificationsToday}
          icon="mail"
          color="primary"
          description="Notificações enviadas hoje"
        />
      </StandardizedMetricsGrid>

      {/* Cards de métricas secundárias (mais compactos) */}
      <StandardizedMetricsGrid columns={2} className="mb-8">
        <StandardizedMetricsCard
          title="Total de Mensagens Enviadas"
          value={totalSent}
          icon="mail"
          color="primary"
          size="sm"
          description="Histórico completo de notificações"
        />
        
        <StandardizedMetricsCard
          title="Taxa de Entrega"
          value={deliveryRate > 0 ? `${deliveryRate}%` : '-'}
          icon="check-circle"
          color="primary"
          size="sm"
          description="Sucesso na entrega das mensagens"
        />
      </StandardizedMetricsGrid>

      {/* Tabs Chakra UI v3 padronizadas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <Tabs.Root 
            value={activeTab} 
            onValueChange={(details) => setActiveTab(details.value as TabType)}
            variant="plain"
            size="sm"
            colorPalette="gray"
          >
            <StandardizedTabsList
              tabs={tabs}
              className="mb-4"
            />

            {/* Conteúdo das tabs */}
            <div className="mt-4">
              <StandardizedTabContent value="send">
                <NotificationFormEnhanced 
                  availableUsers={availableUsers}
                  availableGroups={groups}
                  variant="minimal"
                />
              </StandardizedTabContent>

              <StandardizedTabContent value="groups">
                <GroupsManager variant="minimal" />
              </StandardizedTabContent>

              <StandardizedTabContent value="history">
                <NotificationHistory variant="minimal" />
              </StandardizedTabContent>
            </div>
          </Tabs.Root>
        </div>
      </div>
    </StandardizedAdminLayout>
  );
}