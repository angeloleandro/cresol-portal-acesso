'use client';

// Collections Admin Manager
// Interface administrativa principal para coleções - Portal Cresol

import { useState, useEffect } from 'react';

import { useAlert } from '@/app/components/alerts';
import CollectionList from '@/app/components/Collections/Collection.List';
import { useCollections } from '@/app/contexts/CollectionsContext';
import { Collection } from '@/lib/types/collections';

import CollectionModal from './CollectionModal';
import DeleteConfirmModal from './DeleteConfirmModal';

import type React from 'react';

interface CollectionsManagerProps {
  showCreateCollection?: boolean;
  onCreateCollectionClose?: () => void;
}

const CollectionsManager: React.FC<CollectionsManagerProps> = ({
  showCreateCollection = false,
  onCreateCollectionClose,
}) => {
  // State management
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Hooks
  const alert = useAlert();
  const {
    collections: _collections,
    loading: _loading,
    error: _error,
    stats: _stats,
    actions: {
      refresh: _refresh,
      createCollection,
      updateCollection,
      deleteCollection,
      toggleCollectionStatus,
    }
  } = useCollections();

  // Handle showCreateCollection prop
  useEffect(() => {
    if (showCreateCollection) {
      handleCreateClick();
    }
  }, [showCreateCollection]);

  // Handle create collection
  const handleCreateClick = () => {
    setSelectedCollection(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  // Handle edit collection
  const _handleEditCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  // Handle delete collection
  const _handleDeleteCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsDeleteModalOpen(true);
  };

  // Handle toggle status
  const _handleToggleStatus = async (collection: Collection) => {
    try {
      await toggleCollectionStatus(collection.id, !collection.is_active);
      alert.collections.statusChanged(!collection.is_active);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      alert.showError('Erro ao alterar status da coleção', errorMessage);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    try {
      if (formMode === 'create') {
        await createCollection(data);
        alert.collections.created();
      } else {
        await updateCollection(selectedCollection!.id, data);
        alert.collections.updated();
      }
      setIsFormModalOpen(false);
      setSelectedCollection(null);
      if (onCreateCollectionClose) {
        onCreateCollectionClose();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao salvar coleção';
      alert.showError('Erro ao salvar coleção', errorMessage);
      throw error; // Re-throw to keep modal open
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedCollection) return;

    try {
      await deleteCollection(selectedCollection.id);
      alert.collections.deleted();
      setIsDeleteModalOpen(false);
      setSelectedCollection(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao excluir coleção';
      alert.showError('Erro ao excluir coleção', errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Collections List */}
      <CollectionList
        showHeader={false}
        showFilters={true}
        showCreateButton={false}
        showStats={false}
        onCollectionClick={(collection) => {
          window.location.href = `/admin/collections/${collection.id}`;
        }}
      />

      {/* Collection Form Modal */}
      <CollectionModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCollection(null);
          if (onCreateCollectionClose) {
            onCreateCollectionClose();
          }
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