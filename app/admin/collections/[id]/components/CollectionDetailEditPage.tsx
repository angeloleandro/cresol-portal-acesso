'use client';

// Collection Detail Edit Page Component
// Interface completa para visualizar e editar coleções individuais

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import CollectionForm, { CollectionFormData } from '../../components/CollectionForm';
import ItemSelector from '../../components/ItemSelector';
import BulkUpload from '../../components/BulkUpload';
import AdminCollectionDetail from '../../components/AdminCollectionDetail';
import { Collection, CollectionWithItems, CollectionItem } from '@/lib/types/collections';
import { useCollectionItems } from '@/app/components/Collections/Collection.hooks';

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
      setCollection(data);
      
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
      
      const updatedCollection = await response.json();
      setCollection(updatedCollection);
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

  // Handle collection deletion
  const handleDelete = async () => {
    if (!collection) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a coleção "${collection.name}"? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmed) return;
    
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

  // Handle items selected from selector
  const handleItemsSelected = async (items: { type: 'image' | 'video'; data: any }[]) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao adicionar itens');
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
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao adicionar arquivos à coleção');
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
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        
        {/* Content skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
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
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link
                href="/admin/collections"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                Coleções
              </Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-500">Erro</li>
          </ol>
        </nav>

        {/* Error message */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m21 12c0 7-7 7-7 7s-7 0-7-7 7-7 7-7 7 0 7 7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar coleção</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={loadCollection}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Tentar Novamente
              </button>
              <Link
                href="/admin/collections"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Voltar às Coleções
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link
              href="/admin/collections"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Coleções
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="text-gray-500 truncate max-w-xs">{collection.name}</li>
        </ol>
      </nav>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Coleção' : 'Detalhes da Coleção'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditing ? 'Modifique os detalhes da coleção' : 'Visualize e gerencie a coleção'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isEditing && (
            <>
              <button
                onClick={handleEditToggle}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
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
            <AdminCollectionDetail
              collection={collection}
              showEditButton={false}
              showAddItemButton={true}
              showBulkUploadButton={true}
              showItemActions={true}
              onItemAdd={handleItemAdd}
              onBulkUpload={handleBulkUpload}
              onItemRemove={handleItemRemove}
              onItemsReorder={handleItemsReorder}
            />
          )}
        </div>
      </div>

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
    </div>
  );
};

export default CollectionDetailEditPage;