'use client';

// Collection Detail Edit Page Component
// Interface completa para visualizar e editar coleções individuais

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Breadcrumb from '@/app/components/Breadcrumb';
import Icon from '@/app/components/icons/Icon';
import CollectionForm, { CollectionFormData } from '../../components/CollectionForm';
import ItemSelector from '../../components/ItemSelector';
import BulkUpload from '../../components/BulkUpload';
import VideoUploadModal from '../../components/VideoUploadModal';
import CollectionDetail from '@/app/components/Collections/Collection.Detail';
import { Collection, CollectionWithItems, CollectionItem } from '@/lib/types/collections';
import { useCollectionItems } from '@/app/components/Collections/Collection.hooks';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import DeleteModal from '@/app/components/ui/DeleteModal';
import clsx from 'clsx';

interface CollectionDetailEditPageProps {
  collectionId: string;
}

const CollectionDetailEditPage: React.FC<CollectionDetailEditPageProps> = ({
  collectionId,
}) => {
  const router = useRouter();
  
  // State
  const [collection, setCollection] = useState<CollectionWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
  
  // Modal de exclusão
  const deleteModal = useDeleteModal('coleção');

  const loadCollection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/collections/${collectionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Coleção não encontrada');
          return;
        }
        throw new Error('Erro ao carregar coleção');
      }
      
      const data = await response.json();
      setCollection(data.collection);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar coleção');
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  // Load collection data
  useEffect(() => {
    loadCollection();
  }, [collectionId, loadCollection]);

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditErrors({});
  };

  // Handle form submission
  const handleSubmit = async (formData: CollectionFormData) => {
    setIsSubmitting(true);
    setEditErrors({});
    
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar coleção');
      }
      
      const data = await response.json();
      setCollection(data.collection);
      setIsEditing(false);
      toast.success('Coleção atualizada com sucesso!');
      
    } catch (error: any) {
      setEditErrors({ submit: error.message });
      toast.error(error.message || 'Erro ao salvar coleção');
      throw error; // Keep form open
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle collection deletion click
  const handleDeleteClick = () => {
    if (!collection) return;
    deleteModal.openDeleteModal(collection, collection.name);
  };

  // Handle collection deletion
  const handleDelete = async (collection: CollectionWithItems) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao excluir coleção');
      }
      
      toast.success('Coleção excluída com sucesso!');
      router.push('/admin/collections');
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir coleção');
    }
  };

  // Handle item addition
  const handleItemAdd = (collection: Collection) => {
    setIsItemSelectorOpen(true);
  };

  // Handle bulk upload
  const handleBulkUpload = (collection: Collection) => {
    setIsBulkUploadOpen(true);
  };

  // Handle advanced video upload
  const handleVideoUpload = (collection: Collection) => {
    setIsVideoUploadOpen(true);
  };

  // Handle video added through advanced upload
  const handleVideoAdded = async (videoData: any) => {
    try {
      await loadCollection(); // Reload collection to show new video
      toast.success(`Vídeo "${videoData.title}" adicionado com sucesso!`);
      setIsVideoUploadOpen(false);
    } catch (error) {
      toast.error('Erro ao recarregar coleção');
    }
  };

  // Handle items selected from selector
  const handleItemsSelected = async (items: { type: 'image' | 'video'; data: any }[]) => {
    try {
      // Process items one by one since API expects individual items
      const results = [];
      
      for (const item of items) {
        const response = await fetch(`/api/collections/${collectionId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: item.data.item_id,
            item_type: item.type,
            order_index: 0, // Let API calculate the order
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao adicionar item');
        }
        
        const result = await response.json();
        results.push(result);
      }
      
      // Reload collection data to show new items
      await loadCollection();
      toast.success(`${items.length} ite${items.length !== 1 ? 'ns adicionados' : 'm adicionado'} com sucesso!`);
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar itens');
      throw error; // Let ItemSelector handle the error
    }
  };

  // Handle bulk uploaded files
  const handleBulkFilesUploaded = async (items: { type: 'image' | 'video'; data: any }[]) => {
    try {
      // Process items one by one since API expects individual items
      const results = [];
      
      for (const item of items) {
        const response = await fetch(`/api/collections/${collectionId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: item.data.item_id,
            item_type: item.type,
            order_index: 0, // Let API calculate the order
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao adicionar arquivo à coleção');
        }
        
        const result = await response.json();
        results.push(result);
      }
      
      // Reload collection data to show new items
      await loadCollection();
      toast.success(`${items.length} arquivo${items.length !== 1 ? 's adicionados' : ' adicionado'} à coleção com sucesso!`);
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar arquivos à coleção');
      throw error; // Let BulkUpload handle the error
    }
  };

  // Handle item removal
  const handleItemRemove = async (item: CollectionItem) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items/${item.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao remover item');
      }
      
      // Reload collection data to reflect removal
      await loadCollection();
      toast.success('Item removido com sucesso!');
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover item');
    }
  };

  // Handle item reordering
  const handleItemsReorder = async (collectionId: string, items: CollectionItem[]) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            order_index: item.order_index,
          })),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao reordenar itens');
      }
      
      // Reload collection data to reflect new order
      await loadCollection();
      toast.success('Ordem dos itens atualizada com sucesso!');
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reordenar itens');
      throw error; // Re-throw so component can handle appropriately
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-80 animate-pulse" />
        
        {/* Header Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-80 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/40 p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Coleções', href: '/admin/collections' },
              { label: 'Erro' }
            ]} 
          />
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200/40 p-6"
        >
          <div className="text-center py-12">
            <Icon name="triangle-alert" className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar coleção</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadCollection}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Tentar Novamente
              </motion.button>
              <Link
                href="/admin/collections"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Voltar às Coleções
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/home', icon: 'house' },
            { label: 'Administração', href: '/admin' },
            { label: 'Coleções', href: '/admin/collections' },
            { label: collection.name }
          ]} 
        />
      </motion.div>

      {/* Header interno + Ações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">
              {isEditing ? 'Editar Coleção' : 'Detalhes da Coleção'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Modifique os detalhes da coleção' : `Visualize e gerencie a coleção "${collection.name}"`}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap sm:justify-end">
            {!isEditing && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEditToggle}
                  className={clsx(
                    'inline-flex items-center gap-2 px-5 py-2.5',
                    'bg-primary text-white rounded-md font-medium',
                    'hover:bg-primary/90 transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'shadow-sm'
                  )}
                >
                  <Icon name="pencil" className="h-5 w-5" />
                  Editar
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/admin/gallery')}
                  className={clsx(
                    'inline-flex items-center gap-2 px-5 py-2.5',
                    'bg-gray-100 text-gray-700 rounded-md font-medium',
                    'hover:bg-gray-200 transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-gray-300/20',
                    'shadow-sm'
                  )}
                >
                  <Icon name="image" className="h-5 w-5" />
                  Galeria
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/admin/videos')}
                  className={clsx(
                    'inline-flex items-center gap-2 px-5 py-2.5',
                    'bg-gray-100 text-gray-700 rounded-md font-medium',
                    'hover:bg-gray-200 transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-gray-300/20',
                    'shadow-sm'
                  )}
                >
                  <Icon name="video" className="h-5 w-5" />
                  Vídeos
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteClick}
                  className={clsx(
                    'inline-flex items-center gap-2 px-5 py-2.5',
                    'bg-red-500 text-white rounded-md font-medium',
                    'hover:bg-red-600 transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-red-500/20',
                    'shadow-sm'
                  )}
                >
                  <Icon name="trash" className="h-5 w-5" />
                  Excluir
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={clsx(
          'bg-white rounded-md shadow-sm border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150',
          'overflow-hidden'
        )}
      >
        <div className="p-6">
          {isEditing ? (
            /* Edit Mode - Show Form */
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Informações da Coleção
                </h2>
                <p className="text-sm text-gray-600">
                  Atualize as informações básicas da coleção
                </p>
              </div>
              
              <CollectionForm
                collection={collection}
                mode="edit"
                onSubmit={handleSubmit}
                onCancel={handleEditToggle}
                isSubmitting={isSubmitting}
                errors={editErrors}
                cancelButtonText="Cancelar Edição"
                submitButtonText="Salvar Alterações"
              />
            </div>
          ) : (
            /* View Mode - Show Details */
            <CollectionDetail
              collection={collection}
              showEditButton={false}
              showAddItemButton={true}
              showBulkUploadButton={true}
              showItemActions={true}
              isAdminView={true}
              enableReordering={true}
              onItemAdd={handleItemAdd}
              onBulkUpload={handleBulkUpload}
              onVideoUpload={handleVideoUpload}
              onItemRemove={handleItemRemove}
              onItemReorder={(items) => handleItemsReorder(collection.id, items)}
            />
          )}
        </div>
      </motion.div>

      {/* Item Selector Modal */}
      {collection && (
        <ItemSelector
          isOpen={isItemSelectorOpen}
          onClose={() => setIsItemSelectorOpen(false)}
          collection={collection}
          onItemsSelected={handleItemsSelected}
        />
      )}

      {/* Bulk Upload Modal */}
      {collection && (
        <BulkUpload
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          collection={collection}
          onFilesUploaded={handleBulkFilesUploaded}
        />
      )}

      {/* Video Upload Advanced Modal */}
      {collection && (
        <VideoUploadModal
          isOpen={isVideoUploadOpen}
          onClose={() => setIsVideoUploadOpen(false)}
          collection={collection}
          onVideoAdded={handleVideoAdded}
        />
      )}

      {/* Modal de Exclusão */}
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
};

export default CollectionDetailEditPage;