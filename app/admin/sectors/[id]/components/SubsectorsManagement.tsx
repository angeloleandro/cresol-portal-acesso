// Componente de gerenciamento de subsetores

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Subsector } from '../types/sector.types';
import { formatDate } from '../utils/dateFormatters';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import DeleteModal from '@/app/components/ui/DeleteModal';

interface SubsectorsManagementProps {
  sectorId: string;
  subsectors: Subsector[];
  onRefresh: () => Promise<void>;
}

export function SubsectorsManagement({
  sectorId,
  subsectors,
  onRefresh
}: SubsectorsManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentSubsector, setCurrentSubsector] = useState<Partial<Subsector>>({
    name: '',
    description: '',
    sector_id: sectorId
  });

  // Modal de exclusão
  const deleteModal = useDeleteModal('subsetor');

  const handleOpenModal = (subsector?: Subsector) => {
    // Reset states
    setSaveError(null);
    setIsSaving(false);
    
    if (subsector) {
      setCurrentSubsector(subsector);
      setIsEditing(true);
    } else {
      setCurrentSubsector({
        name: '',
        description: '',
        sector_id: sectorId
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSaveError(null);
    setIsSaving(false);
    setCurrentSubsector({
      name: '',
      description: '',
      sector_id: sectorId
    });
  };

  const handleSaveSubsector = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setSaveError(null);

    // Validação básica
    if (!currentSubsector.name?.trim()) {
      setSaveError('Nome é obrigatório');
      return;
    }

    if (currentSubsector.name.length < 2) {
      setSaveError('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = '/api/admin/subsectors';
      
      const requestData = isEditing 
        ? {
            id: currentSubsector.id,
            name: currentSubsector.name.trim(),
            description: currentSubsector.description?.trim() || ''
          }
        : {
            name: currentSubsector.name.trim(),
            description: currentSubsector.description?.trim() || '',
            sector_id: sectorId
          };
      
      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestData)
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || 'Erro ao salvar subsetor');
      }
      
      // Refresh data to ensure consistency
      await onRefresh();
      
      // Close modal only after success
      handleCloseModal();
      
    } catch (error: any) {
      const userMessage = error.message.includes('fetch')
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro desconhecido ao salvar subsetor. Tente novamente.';
        
      setSaveError(userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (subsector: Subsector) => {
    deleteModal.openDeleteModal(subsector, subsector.name);
  };

  const handleDeleteSubsector = async (subsector: Subsector) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // TODO: Implementar sistema de notificação moderno (toast/alert)
        console.error('Erro: Usuário não autenticado');
        // Por ora, mostrar erro no console até implementar sistema de notificação
        return;
      }

      const response = await fetch(`/api/admin/subsectors?id=${subsector.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || 'Erro ao excluir subsetor');
      }

      await onRefresh();
    } catch (error: any) {
      console.error('Erro ao excluir subsetor:', error);
      // TODO: Implementar sistema de notificação moderno (toast/alert)
      console.error('Erro ao excluir subsetor:', error.message || error);
      // Por ora, mostrar erro no console até implementar sistema de notificação
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Subsetores</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Novo Subsetor
        </button>
      </div>

      {/* Lista de subsetores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subsectors.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Nenhum subsetor cadastrado ainda</p>
          </div>
        ) : (
          subsectors.map((subsector) => (
            <div key={subsector.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{subsector.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenModal(subsector)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(subsector)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {subsector.description && (
                <p className="text-gray-600 text-sm mb-3">{subsector.description}</p>
              )}
              
              <div className="flex justify-between items-center pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Criado em {formatDate(subsector.created_at)}
                </p>
                <Link
                  href={`/admin-subsetor/subsetores/${subsector.id}`}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Gerenciar →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? 'Editar Subsetor' : 'Novo Subsetor'}
              </h2>
              
              {/* Error display */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{saveError}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={() => setSaveError(null)}
                        className="inline-flex text-red-400 hover:text-red-600"
                      >
                        <span className="sr-only">Fechar</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSaveSubsector} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={currentSubsector.name || ''}
                    onChange={(e) => setCurrentSubsector({ ...currentSubsector, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={currentSubsector.description || ''}
                    onChange={(e) => setCurrentSubsector({ ...currentSubsector, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Descrição opcional do subsetor"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Salvar</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteSubsector)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}