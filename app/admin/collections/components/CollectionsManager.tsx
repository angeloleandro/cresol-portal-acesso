'use client';

// Collections Admin Manager
// Interface administrativa principal para coleções - Portal Cresol

import type React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CollectionList from '@/app/components/Collections/Collection.List';
import CollectionModal from './CollectionModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Collection } from '@/lib/types/collections';
import { useCollections } from '@/app/components/Collections/Collection.hooks';

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
      if (onCreateCollectionClose) {
        onCreateCollectionClose();
      }
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