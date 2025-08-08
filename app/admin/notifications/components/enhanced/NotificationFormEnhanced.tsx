import React from 'react';
import Icon from '@/app/components/icons/Icon';
import { Card } from '../../design-system/components';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { PrioritySelector } from './PrioritySelector';
import { RecipientsSelector } from '../NotificationForm/RecipientsSelector';
import { useNotificationForm } from '../../hooks/useNotificationForm';
import { User, NotificationGroup, NotificationType, PriorityType } from '../../types';

interface NotificationFormEnhancedProps {
  availableUsers: User[];
  availableGroups: NotificationGroup[];
}

const notificationTypeOptions = [
  { value: 'message', label: 'Mensagem Geral', icon: 'chat-line' },
  { value: 'system', label: 'Notificação do Sistema', icon: 'settings' },
  { value: 'news', label: 'Notícia/Comunicado', icon: 'bell' },
  { value: 'event', label: 'Evento/Reunião', icon: 'calendar' },
];

export const NotificationFormEnhanced: React.FC<NotificationFormEnhancedProps> = ({
  availableUsers,
  availableGroups
}) => {
  const { notificationForm, loading, errors, updateForm, resetForm, handleSubmit } = useNotificationForm();

  const handleFormChange = (field: string, value: any) => {
    updateForm({ [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <Icon name="mail" className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nova Notificação</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure e envie mensagens personalizadas para grupos ou usuários específicos da plataforma
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="info" className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Título da Notificação"
                placeholder="Ex: Reunião Geral de Cooperados"
                value={notificationForm.title}
                onChange={(value) => handleFormChange('title', value)}
                required
                error={errors?.title}
                className="lg:col-span-1"
              />

              <Select
                label="Tipo de Notificação"
                value={notificationForm.type}
                onChange={(value) => handleFormChange('type', value as NotificationType)}
                options={notificationTypeOptions}
                error={errors?.type}
              />
            </div>
          </div>
        </Card>

        {/* Prioridade e Configurações */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Icon name="star" className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Prioridade e Configurações</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PrioritySelector
                  value={notificationForm.priority as PriorityType}
                  onChange={(priority) => handleFormChange('priority', priority)}
                />
              </div>

              <div>
                <Input
                  label="Data de Expiração"
                  type="datetime-local"
                  value={notificationForm.expiresAt}
                  onChange={(value) => handleFormChange('expiresAt', value)}
                  helpText="Opcional - deixe vazio para notificação permanente"
                  error={errors?.expiresAt}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Conteúdo da Mensagem */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Icon name="pencil" className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Conteúdo da Mensagem</h2>
            </div>

            <Textarea
              label="Mensagem"
              placeholder="Digite aqui o conteúdo completo da notificação que será enviada aos usuários..."
              value={notificationForm.message}
              onChange={(value) => handleFormChange('message', value)}
              required
              rows={5}
              maxLength={1000}
              error={errors?.message}
              helpText="Seja claro e objetivo. Os usuários receberão esta mensagem em suas caixas de notificação."
            />
          </div>
        </Card>

        {/* Destinatários */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Icon name="user-group" className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Destinatários</h2>
            </div>

            <RecipientsSelector
              isGlobal={notificationForm.isGlobal}
              selectedGroups={notificationForm.groups}
              selectedUsers={notificationForm.users}
              availableGroups={availableGroups}
              availableUsers={availableUsers}
              onGlobalToggle={(isGlobal) => handleFormChange('isGlobal', isGlobal)}
              onGroupsChange={(groups) => handleFormChange('groups', groups)}
              onUsersChange={(users) => handleFormChange('users', users)}
            />
          </div>
        </Card>

        {/* Actions */}
        <Card variant="outlined" className="bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-sm text-gray-600 order-2 sm:order-1">
              <p>Revise todas as informações antes de enviar a notificação.</p>
            </div>
            
            <div className="flex gap-3 order-1 sm:order-2">
              <Button
                variant="secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Limpar Formulário
              </Button>
              
              <Button
                type="submit"
                loading={loading}
                icon={<Icon name="mail" className="w-4 h-4" />}
              >
                Enviar Notificação
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};