'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import { handleComponentError, devLog } from '@/lib/error-handler';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import ErrorMessage from '@/app/components/ui/ErrorMessage';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';

interface EconomicIndicator {
  id?: string;
  title: string;
  value: string;
  icon: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  issue_date?: string; // Formato MM/YYYY
  created_at?: string;
  updated_at?: string;
}

const AVAILABLE_ICONS = [
  { value: 'users', label: 'Usuários', icon: '👥' },
  { value: 'building', label: 'Edifício', icon: '🏢' },
  { value: 'bank', label: 'Banco', icon: '🏦' },
  { value: 'money', label: 'Dinheiro', icon: '💰' },
  { value: 'treasure', label: 'Tesouro', icon: '💎' },
  { value: 'piggy-bank', label: 'Poupança', icon: '🐷' },
  { value: 'handshake', label: 'Negócio', icon: '🤝' },
  { value: 'tractor', label: 'Agricultura', icon: '🚜' },
  { value: 'briefcase', label: 'Carteira', icon: '💼' },
];

export default function EconomicIndicatorsAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [editingIndicator, setEditingIndicator] = useState<EconomicIndicator | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<EconomicIndicator | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState<EconomicIndicator>({
    title: '',
    value: '',
    icon: 'money',
    description: '',
    display_order: 0,
    is_active: true,
    issue_date: ''
  });

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      await fetchIndicators();
      setLoading(false);
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'checkUserAndFetchData');
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchIndicators = async () => {
    try {
      const response = await fetch('/api/admin/economic-indicators');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar indicadores');
      }

      setIndicators(data.indicators || []);
      devLog.info('Indicadores carregados', { count: data.indicators?.length });
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'fetchIndicators');
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const method = editingIndicator ? 'PUT' : 'POST';
      const body = editingIndicator 
        ? { ...formData, id: editingIndicator.id }
        : formData;

      const response = await fetch('/api/admin/economic-indicators', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar indicador');
      }

      // Atualizar lista
      await fetchIndicators();
      
      // Resetar formulário
      setShowForm(false);
      setEditingIndicator(null);
      setFormData({
        title: '',
        value: '',
        icon: 'money',
        description: '',
        display_order: 0,
        is_active: true,
        issue_date: ''
      });

      devLog.info(`Indicador ${method === 'PUT' ? 'atualizado' : 'criado'} com sucesso`);
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'saveIndicator');
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (indicator: EconomicIndicator) => {
    setEditingIndicator(indicator);
    setFormData({
      title: indicator.title,
      value: indicator.value,
      icon: indicator.icon,
      description: indicator.description || '',
      display_order: indicator.display_order,
      is_active: indicator.is_active,
      issue_date: indicator.issue_date || ''
    });
    setShowForm(true);
  };

  const openDeleteModal = (indicator: EconomicIndicator) => {
    setIndicatorToDelete(indicator);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!indicatorToDelete) return;

    try {
      const response = await fetch(`/api/admin/economic-indicators?id=${indicatorToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir indicador');
      }

      await fetchIndicators();
      devLog.info('Indicador excluído com sucesso');
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'deleteIndicator');
      setError(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setIndicatorToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndicator(null);
    setFormData({
      title: '',
      value: '',
      icon: 'money',
      description: '',
      display_order: 0,
      is_active: true,
      issue_date: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} />
        <LoadingSpinner fullScreen message="Carregando indicadores econômicos..." />
      </div>
    );
  }

  if (error && !indicators.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage
            title="Erro ao Carregar Indicadores"
            message={error}
            type="error"
            showRetry
            onRetry={fetchIndicators}
            fullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Indicadores Econômicos</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie os indicadores econômicos exibidos na página inicial
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage
                title="Erro"
                message={error}
                type="error"
              />
            </div>
          )}

          {/* Botão Adicionar */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Indicador
            </button>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingIndicator ? 'Editar Indicador' : 'Novo Indicador'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Título *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Ex: Cooperados"
                    />
                  </div>

                  <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                      Valor *
                    </label>
                    <input
                      type="text"
                      id="value"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Ex: 36.7 mil"
                    />
                  </div>

                  <div>
                    <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
                      Ícone *
                    </label>
                    <select
                      id="icon"
                      required
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.icon} {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">
                      Ordem de Exibição
                    </label>
                    <input
                      type="number"
                      id="display_order"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
                      Data de Emissão
                    </label>
                    <input
                      type="text"
                      id="issue_date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="MM/AAAA (ex: 05/2025)"
                      pattern="^(0[1-9]|1[0-2])\/[0-9]{4}$"
                      title="Formato: MM/AAAA (ex: 05/2025)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Descrição opcional do indicador"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Indicador ativo
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {formLoading ? 'Salvando...' : (editingIndicator ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Indicadores */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {indicators.length === 0 ? (
                <li className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <p>Nenhum indicador encontrado.</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-2 text-orange-600 hover:text-orange-500"
                    >
                      Criar primeiro indicador
                    </button>
                  </div>
                </li>
              ) : (
                indicators.map((indicator) => (
                  <li key={indicator.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">
                              {AVAILABLE_ICONS.find(icon => icon.value === indicator.icon)?.icon || '💰'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {indicator.title}
                            </h3>
                            <span className="text-lg font-bold text-gray-700">
                              {indicator.value}
                            </span>
                            {!indicator.is_active && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inativo
                              </span>
                            )}
                          </div>
                          {indicator.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {indicator.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                            <span>Ordem: {indicator.display_order}</span>
                            {indicator.issue_date && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                                {indicator.issue_date}
                              </span>
                            )}
                            <span>{new Date(indicator.created_at!).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(indicator)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(indicator)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </main>
      </div>
      {indicatorToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão de Indicador"
          message={`Tem certeza que deseja excluir o indicador "<strong>${indicatorToDelete.title}</strong>"? Esta ação não pode ser desfeita.`}
          isLoading={formLoading}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
        />
      )}
    </>
  );
} 