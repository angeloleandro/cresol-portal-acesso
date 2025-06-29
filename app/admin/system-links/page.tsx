'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import { handleComponentError, devLog } from '@/lib/error-handler';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import ErrorMessage from '@/app/components/ui/ErrorMessage';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';

interface SystemLink {
  id?: string;
  name: string;
  url: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function SystemLinksAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<SystemLink[]>([]);
  const [editingLink, setEditingLink] = useState<SystemLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<SystemLink | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState<SystemLink>({
    name: '',
    url: '',
    description: '',
    display_order: 0,
    is_active: true
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

      await fetchLinks();
      setLoading(false);
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'checkUserAndFetchData');
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/admin/system-links');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar links');
      }

      setLinks(data.links || []);
      devLog.info('Links carregados', { count: data.links?.length });
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'fetchLinks');
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const method = editingLink ? 'PUT' : 'POST';
      const body = editingLink 
        ? { ...formData, id: editingLink.id }
        : formData;

      const response = await fetch('/api/admin/system-links', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar link');
      }

      // Atualizar lista
      await fetchLinks();
      
      // Resetar formulário
      setShowForm(false);
      setEditingLink(null);
      setFormData({
        name: '',
        url: '',
        description: '',
        display_order: 0,
        is_active: true
      });

      devLog.info(`Link ${method === 'PUT' ? 'atualizado' : 'criado'} com sucesso`);
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'saveLink');
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (link: SystemLink) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      description: link.description || '',
      display_order: link.display_order,
      is_active: link.is_active
    });
    setShowForm(true);
  };

  const openDeleteModal = (link: SystemLink) => {
    setLinkToDelete(link);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!linkToDelete) return;

    try {
      const response = await fetch(`/api/admin/system-links?id=${linkToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir link');
      }

      await fetchLinks();
      devLog.info('Link excluído com sucesso');
    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'deleteLink');
      setError(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setLinkToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLink(null);
    setFormData({
      name: '',
      url: '',
      description: '',
      display_order: 0,
      is_active: true
    });
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} />
        <LoadingSpinner fullScreen message="Carregando links de sistemas..." />
      </div>
    );
  }

  if (error && !links.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage
            title="Erro ao Carregar Links"
            message={error}
            type="error"
            showRetry
            onRetry={fetchLinks}
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
            <h1 className="text-3xl font-bold text-gray-900">Links de Sistemas</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie os links de acesso aos sistemas exibidos na página inicial
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
              Adicionar Link
            </button>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingLink ? 'Editar Link' : 'Novo Link'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome do Sistema *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Ex: AXDOC"
                    />
                  </div>

                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                      URL *
                    </label>
                    <input
                      type="url"
                      id="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="https://sistema.cresol.com.br"
                    />
                    {formData.url && !validateUrl(formData.url) && (
                      <p className="mt-1 text-sm text-red-600">URL inválida</p>
                    )}
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

                  <div className="flex items-center pt-6">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Link ativo
                    </label>
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
                    placeholder="Descrição opcional do sistema"
                  />
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
                    disabled={formLoading || (formData.url !== '' && !validateUrl(formData.url))}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {formLoading ? 'Salvando...' : (editingLink ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Links */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {links.length === 0 ? (
                <li className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <p>Nenhum link encontrado.</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-2 text-orange-600 hover:text-orange-500"
                    >
                      Criar primeiro link
                    </button>
                  </div>
                </li>
              ) : (
                links.map((link) => (
                  <li key={link.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {link.name}
                            </h3>
                            {!link.is_active && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inativo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-600 hover:text-blue-500 mt-1">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.url}
                            </a>
                          </p>
                          {link.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {link.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Ordem: {link.display_order} • {new Date(link.created_at!).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(link)}
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
      {linkToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão de Link"
          message={`Tem certeza que deseja excluir o link "<strong>${linkToDelete.name}</strong>"? Esta ação não pode ser desfeita.`}
          isLoading={formLoading}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
        />
      )}
    </>
  );
} 