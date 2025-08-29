// Componente para gerenciar subsetores do setor

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { FormatDate } from '@/lib/utils/formatters';

import { useSectorDataContext } from '../contexts/SectorDataContext';
import type { Subsector } from '../types/sector.types';

interface SubsectorsManagementProps {
  sectorId: string;
}

export function SubsectorsManagement({ sectorId }: SubsectorsManagementProps) {
  const { showError, showSuccess } = useAlert();
  const { subsectors, refreshSectorData } = useSectorDataContext();
  const deleteModal = useDeleteModal<Subsector>('subsetor');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Subsector>>({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      showError('Nome obrigatório', 'O nome do subsetor é obrigatório.');
      return;
    }

    setIsSaving(true);
    
    try {
      const subsectorData = {
        sector_id: sectorId,
        name: formData.name.trim(),
        description: formData.description?.trim() || ''
      };

      const url = '/api/admin/subsectors';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { ...subsectorData, id: editingId }
        : subsectorData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar subsetor');
      }

      showSuccess(editingId ? 'Subsetor atualizado' : 'Subsetor criado', 'O subsetor foi salvo com sucesso.');
      setShowForm(false);
      setFormData({ name: '', description: '' });
      setEditingId(null);
      await refreshSectorData();
    } catch (error) {
      showError('Erro ao salvar subsetor', 'Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (subsector: Subsector) => {
    setFormData({
      name: subsector.name,
      description: subsector.description || ''
    });
    setEditingId(subsector.id);
    setShowForm(true);
  };

  const handleDeleteClick = (subsector: Subsector) => {
    deleteModal.openDeleteModal(subsector, subsector.name);
  };

  const handleDelete = async (subsector: Subsector) => {
    try {
      const response = await fetch(`/api/admin/subsectors?id=${subsector.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir subsetor');
      }

      await refreshSectorData();
      showSuccess('Subsetor excluído', 'O subsetor foi removido com sucesso.');
    } catch (error) {
      showError('Erro ao excluir subsetor', 'Tente novamente.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Subsetores</h3>
        <button
          onClick={() => {
            setFormData({ name: '', description: '' });
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
        >
          Criar Subsetor
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
          <h4 className="text-lg font-medium mb-3">
            {editingId ? 'Editar Subsetor' : 'Novo Subsetor'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Subsetor
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                placeholder="Descrição do subsetor"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {subsectors.length === 0 ? (
        <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
          <p className="text-gray-500">Nenhum subsetor cadastrado para este setor.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subsectors.map((subsector) => (
            <div key={subsector.id} className="bg-white p-4 rounded-md border border-gray-200 hover:border-card-hover transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-medium">{subsector.name}</h4>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(subsector)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(subsector)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                  Criado em {FormatDate(subsector.created_at)}
                </p>
                <Link
                  href={`/admin-subsetor/subsetores/${subsector.id}`}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Gerenciar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDelete)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}