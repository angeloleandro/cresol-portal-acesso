import { useState } from 'react';
import { NotificationFormData } from '../types';

const initialFormData: NotificationFormData = {
  title: '',
  message: '',
  type: 'message',
  priority: 'normal',
  isGlobal: false,
  groups: [],
  users: [],
  expiresAt: ''
};

export const useNotificationForm = () => {
  const [notificationForm, setNotificationForm] = useState<NotificationFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const updateForm = (updates: Partial<NotificationFormData>) => {
    setNotificationForm(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setNotificationForm(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          priority: notificationForm.priority,
          isGlobal: notificationForm.isGlobal,
          groups: notificationForm.groups,
          recipients: notificationForm.users,
          expiresAt: notificationForm.expiresAt || null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Notificação enviada com sucesso!');
        resetForm();
        return { success: true, data: result };
      } else {
        alert(`Erro: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      alert('Erro ao enviar notificação');
      return { success: false, error: 'Erro interno' };
    } finally {
      setLoading(false);
    }
  };

  return {
    notificationForm,
    loading,
    updateForm,
    resetForm,
    handleSubmit
  };
};