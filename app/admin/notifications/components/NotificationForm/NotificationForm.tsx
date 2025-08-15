import React from 'react';
import { PrioritySelector } from './PrioritySelector';
import { RecipientsSelector } from './RecipientsSelector';
import { FormFieldGroup } from '../shared/FormFieldGroup';
import { useNotificationForm } from '../../hooks/useNotificationForm';
import { User, NotificationGroup, NotificationType, PriorityType } from '../../types';
import { StandardizedInput, StandardizedTextarea } from '@/app/components/ui/StandardizedInput';

interface NotificationFormProps {
  availableUsers: User[];
  availableGroups: NotificationGroup[];
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  availableUsers,
  availableGroups
}) => {
  const { notificationForm, loading, updateForm, resetForm, handleSubmit } = useNotificationForm();

  const handleFormChange = (field: string, value: any) => {
    updateForm({ [field]: value });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Nova Notificação</h2>
          <p className="text-sm text-gray-500">Configure e envie mensagens para grupos ou usuários específicos</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos básicos - Grid 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormFieldGroup title="Informações Básicas">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Notificação *
                </label>
                <StandardizedInput
                  type="text"
                  required
                  value={notificationForm.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('title', e.target.value)}
                  placeholder="Ex: Reunião Geral de Cooperados"
                  startIcon="file-text"
                  variant="outline"
                  size="md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Notificação
                </label>
                <select
                  value={notificationForm.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFormChange('type', e.target.value as NotificationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="message">📝 Mensagem</option>
                  <option value="system">⚙️ Sistema</option>
                  <option value="news">📰 Notícia</option>
                  <option value="event">📅 Evento</option>
                </select>
              </div>
            </div>
          </FormFieldGroup>

          <FormFieldGroup title="Configurações">
            <div className="space-y-4">
              <PrioritySelector
                value={notificationForm.priority as PriorityType}
                onChange={(priority) => handleFormChange('priority', priority)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Expiração <span className="text-xs text-gray-500">(Opcional)</span>
                </label>
                <StandardizedInput
                  type="datetime-local"
                  value={notificationForm.expiresAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('expiresAt', e.target.value)}
                  startIcon="calendar"
                  variant="outline"
                  size="md"
                />
                <p className="text-xs text-gray-500 mt-1">Deixe vazio para notificação permanente</p>
              </div>
            </div>
          </FormFieldGroup>
        </div>

        {/* Mensagem - Full width */}
        <FormFieldGroup title="Conteúdo">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Conteúdo da Mensagem *
            </label>
            <div className="relative">
              <StandardizedTextarea
                required
                rows={5}
                value={notificationForm.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFormChange('message', e.target.value)}
                placeholder="Digite aqui o conteúdo completo da notificação que será enviada aos usuários..."
                variant="outline"
                size="md"
                resize="none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {notificationForm.message.length} caracteres
              </div>
            </div>
          </div>
        </FormFieldGroup>

        {/* Destinatários */}
        <FormFieldGroup title="Destinatários">
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
        </FormFieldGroup>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpar Formulário
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            Enviar Notificação
          </button>
        </div>
      </form>
    </div>
  );
};