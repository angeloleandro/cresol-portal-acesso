'use client';

import React, { useState } from 'react';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Card } from './design-system/components';
import { StatsCard } from './components/enhanced/StatsCard';
import { TabNavigation } from './components/enhanced/TabNavigation';
import { NotificationFormEnhanced } from './components/enhanced/NotificationFormEnhanced';
import { GroupsManager } from './components/GroupsManager';
import { NotificationHistory } from './components/NotificationHistory';
import { useAuth, useFormData, useGroups } from './hooks';
import { TabType } from './types';

export default function NotificationsAdminEnhanced() {
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
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      id: 'groups' as TabType,
      label: 'Grupos',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: groups.length,
    },
    {
      id: 'history' as TabType,
      label: 'Histórico',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Notificações' }
            ]} 
          />
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5.07 7.07a10 10 0 0014.86 0M5.07 7.07A10 10 0 117.07 5.07M5.07 7.07L12 14l6.93-6.93" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Notificações</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gerencie comunicações, configure grupos de usuários e acompanhe o histórico de mensagens enviadas
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total de Grupos"
            value={groups.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="primary"
            trend={{ value: 12, isPositive: true, period: 'vs. mês anterior' }}
          />
          
          <StatsCard
            title="Usuários Ativos"
            value={availableUsers.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            color="secondary"
            trend={{ value: 8, isPositive: true, period: 'vs. mês anterior' }}
          />

          <StatsCard
            title="Mensagens Hoje"
            value="0"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
            color="info"
          />
        </div>

        {/* Main Content */}
        <Card variant="elevated" className="overflow-hidden">
          {/* Tab Navigation */}
          <div className="px-6 pt-6 pb-2">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId as TabType)}
              variant="underline"
              size="md"
            />
          </div>

          {/* Tab Content */}
          <div className="px-0">
            {activeTab === 'send' && (
              <div className="p-6 pt-4">
                <NotificationFormEnhanced 
                  availableUsers={availableUsers}
                  availableGroups={groups}
                />
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="p-6 pt-4">
                <GroupsManager />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6 pt-4">
                <NotificationHistory />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}