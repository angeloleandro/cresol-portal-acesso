'use client';

// Collections Admin Manager
// Interface administrativa principal para coleções - Portal Cresol

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import CollectionList from '@/app/components/Collections/Collection.List';
import CollectionModal from './CollectionModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Collection } from '@/lib/types/collections';
import { useCollections } from '@/app/components/Collections/Collection.hooks';

const CollectionsManager: React.FC = () => {
  // State management
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Collections hook
  const {
    collections,
    loading,
    error,
    stats,
    actions: {
      refresh,
      createCollection,
      updateCollection,
      deleteCollection,
      toggleCollectionStatus,
    }
  } = useCollections();

  // Handle create collection
  const handleCreateClick = () => {
    setSelectedCollection(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  // Handle edit collection
  const handleEditCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  // Handle delete collection
  const handleDeleteCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsDeleteModalOpen(true);
  };

  // Handle toggle status
  const handleToggleStatus = async (collection: Collection) => {
    try {
      await toggleCollectionStatus(collection.id, !collection.is_active);
      toast.success(`Coleção ${!collection.is_active ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status da coleção');
      console.error(error);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    try {
      if (formMode === 'create') {
        await createCollection(data);
        toast.success('Coleção criada com sucesso!');
      } else {
        await updateCollection(selectedCollection!.id, data);
        toast.success('Coleção atualizada com sucesso!');
      }
      setIsFormModalOpen(false);
      setSelectedCollection(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar coleção');
      throw error; // Re-throw to keep modal open
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedCollection) return;

    try {
      await deleteCollection(selectedCollection.id);
      toast.success('Coleção excluída com sucesso!');
      setIsDeleteModalOpen(false);
      setSelectedCollection(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir coleção');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Coleções
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Organize e gerencie coleções de imagens e vídeos do portal
              </p>
            </div>
            
            <button
              onClick={handleCreateClick}
              className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Coleção
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600">Ativas</p>
                    <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-600">Inativas</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.inactive}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-600">Total de Itens</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.total_items}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collections List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <CollectionList
            showHeader={false}
            showFilters={true}
            showCreateButton={false}
            showStats={false}
            onCollectionClick={(collection) => {
              window.location.href = `/admin/collections/${collection.id}`;
            }}
          />
        </div>
      </div>

      {/* Collection Form Modal */}
      <CollectionModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCollection(null);
        }}
        collection={selectedCollection}
        mode={formMode}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCollection(null);
        }}
        collection={selectedCollection}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default CollectionsManager;