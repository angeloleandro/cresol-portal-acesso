'use client';

import React, { useState } from 'react';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import Icon from '@/app/components/icons/Icon';
import { Card } from './design-system/components';
import { StatsCard } from './components/enhanced/StatsCard';
import { TabNavigation } from './components/enhanced/TabNavigation';
import { NotificationFormEnhanced } from './components/enhanced/NotificationFormEnhanced';
import { GroupsManager } from './components/GroupsManager';
import { NotificationHistory } from './components/NotificationHistory';
import { useAuth, useFormData, useGroups } from './hooks';
import { TabType } from './types';

export default function NotificationsAdmin() {
  const { user, loading } = useAuth();
  const { availableUsers } = useFormData();
  const { groups } = useGroups();
  const [activeTab, setActiveTab] = useState<TabType>('send');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useAuth handles redirects
  }

  const tabs = [
    {
      id: 'send' as TabType,
      label: 'Nova Notificação',
      icon: <Icon name="mail" className="w-4 h-4" />,
    },
    {
      id: 'groups' as TabType,
      label: 'Grupos',
      icon: <Icon name="user-group" className="w-4 h-4" />,
      badge: groups.length,
    },
    {
      id: 'history' as TabType,
      label: 'Histórico',
      icon: <Icon name="clock" className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Notificações' }
            ]} 
          />
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Central de Notificações
            </h1>
            <p className="text-sm text-gray-600">
              Gerencie comunicações, configure grupos de usuários e acompanhe o histórico de mensagens enviadas
            </p>
          </div>
        </div>

        {/* Mobile-Optimized Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total de Grupos"
            value={groups.length}
            icon={<Icon name="user-group" className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="primary"
            trend={{ value: 12, isPositive: true, period: 'vs. mês anterior' }}
          />
          
          <StatsCard
            title="Usuários Ativos"
            value={availableUsers.length}
            icon={<Icon name="user-circle" className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="secondary"
            trend={{ value: 8, isPositive: true, period: 'vs. mês anterior' }}
          />

          <div className="sm:col-span-2 lg:col-span-1">
            <StatsCard
              title="Mensagens Hoje"
              value="0"
              icon={<Icon name="mail" className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="info"
            />
          </div>
        </div>

        {/* Mobile-First Main Content */}
        <Card variant="elevated" className="overflow-hidden">
          {/* Mobile-Optimized Tab Navigation */}
          <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId as TabType)}
              variant="underline"
              size="md"
            />
          </div>

          {/* Mobile-Responsive Tab Content */}
          <div className="px-0">
            {activeTab === 'send' && (
              <div className="p-3 sm:p-4 lg:p-6 pt-2 sm:pt-4">
                <NotificationFormEnhanced 
                  availableUsers={availableUsers}
                  availableGroups={groups}
                />
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="p-3 sm:p-4 lg:p-6 pt-2 sm:pt-4">
                <GroupsManager />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-3 sm:p-4 lg:p-6 pt-2 sm:pt-4">
                <NotificationHistory />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}