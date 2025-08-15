// Componente de gerenciamento de subsetores

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Subsector } from '../types/sector.types';
import { formatDate } from '../utils/dateFormatters';

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
  const [currentSubsector, setCurrentSubsector] = useState<Partial<Subsector>>({
    name: '',
    description: '',
    sector_id: sectorId
  });

  const handleOpenModal = (subsector?: Subsector) => {
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
    setCurrentSubsector({
      name: '',
      description: '',
      sector_id: sectorId
    });
  };

  const handleSaveSubsector = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentSubsector.id) {
        const { error } = await supabase
          .from('subsectors')
          .update({
            name: currentSubsector.name,
            description: currentSubsector.description
          })
          .eq('id', currentSubsector.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subsectors')
          .insert({
            name: currentSubsector.name,
            description: currentSubsector.description,
            sector_id: sectorId
          });

        if (error) throw error;
      }

      await onRefresh();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar subsetor:', error);
      alert('Erro ao salvar subsetor. Tente novamente.');
    }
  };

  const handleDeleteSubsector = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este subsetor?')) return;

    try {
      const { error } = await supabase
        .from('subsectors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await onRefresh();
    } catch (error) {
      console.error('Erro ao excluir subsetor:', error);
      alert('Erro ao excluir subsetor. Verifique se não há dados vinculados.');
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
                    onClick={() => handleDeleteSubsector(subsector.id)}
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
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}