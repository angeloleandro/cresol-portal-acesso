"use client";

import { useEffect, useState } from "react";

import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import CollectionsManager from '@/app/admin/collections/components/CollectionsManager';
import { StandardizedButton } from "@/app/components/admin";
import AdminHeader from "@/app/components/AdminHeader";
import AdminImageGallery from '@/app/components/AdminImageGallery';
import Breadcrumb from "@/app/components/Breadcrumb";
import { useCollections } from '@/app/contexts/CollectionsContext';
import Icon from '@/app/components/icons/Icon';
import ImageUploadForm from "@/app/components/ImageUploadForm";
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
// (Você pode criar um ImageUploadForm.tsx depois, por enquanto use um placeholder)

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}

function AdminGalleryContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCollectionsManager, setShowCollectionsManager] = useState(false);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [selectedImageForCollection, setSelectedImageForCollection] = useState<GalleryImage | null>(null);

  // Collections hook
  const { collections } = useCollections();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setImages(data || []);
    setLoading(false);
  };

  const handleDeleteClick = (image: GalleryImage) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/gallery?id=${imageToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir imagem');
      }
      
      await fetchImages();
      setShowDeleteModal(false);
      setImageToDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const handleAddToCollection = (image: GalleryImage) => {
    setSelectedImageForCollection(image);
    setShowAddToCollectionModal(true);
  };

  const handleAddToCollectionSubmit = async (collectionId: string) => {
    if (!selectedImageForCollection) return;
    
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: selectedImageForCollection.id,
          item_type: 'image',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar à coleção');
      }
      
      setShowAddToCollectionModal(false);
      setSelectedImageForCollection(null);
      // You could show a success message here
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.gallery} />;
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <AdminHeader user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Galeria' }
            ]} 
          />
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Gerenciar Galeria de Imagens
            </h1>
            <p className="text-sm text-gray-600">Adicione, edite ou remova imagens exibidas na galeria do portal</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <StandardizedButton variant="primary" onClick={() => setShowForm(true)}>
            + Nova Imagem
          </StandardizedButton>
          <StandardizedButton variant="secondary" onClick={() => setShowCollectionsManager(true)}>
            <Icon name="folder" className="h-5 w-5 mr-2" />
            Gerenciar Coleções
          </StandardizedButton>
        </div>
        {showForm && !editImage && (
          <ImageUploadForm onSave={() => { setShowForm(false); fetchImages(); }} onCancel={() => setShowForm(false)} />
        )}
        {editImage && (
          <ImageUploadForm
            initialData={{
              id: editImage.id,
              title: editImage.title ?? undefined,
              image_url: editImage.image_url ?? undefined,
              is_active: editImage.is_active,
              order_index: editImage.order_index,
            }}
            onSave={() => { setEditImage(null); fetchImages(); }}
            onCancel={() => setEditImage(null)}
          />
        )}
        {error && <div className="text-red-500 mb-4">Erro: {error}</div>}
        
        <AdminImageGallery
          images={images}
          onEdit={setEditImage}
          onDelete={handleDeleteClick}
          onAddToCollection={handleAddToCollection}
          loading={loading && !showForm && !editImage}
        />
      </main>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a imagem <strong>"${imageToDelete?.title || '(Sem título)'}"</strong>?<br><br>Esta ação não pode ser desfeita e removerá a imagem permanentemente da galeria.`}
        isLoading={isDeleting}
        confirmButtonText="Excluir Imagem"
        cancelButtonText="Cancelar"
      />

      {/* Collections Manager Modal */}
      {showCollectionsManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCollectionsManager(false)} />
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gerenciar Coleções
                  </h3>
                  <button
                    onClick={() => setShowCollectionsManager(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                <CollectionsManager />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Collection Modal */}
      {showAddToCollectionModal && selectedImageForCollection && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddToCollectionModal(false)} />
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Adicionar à Coleção
                  </h3>
                  <button
                    onClick={() => setShowAddToCollectionModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione uma coleção para adicionar a imagem &quot;{selectedImageForCollection.title || '(Sem título)'}&quot;
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {collections?.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollectionSubmit(collection.id)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{collection.name}</div>
                      {collection.description && (
                        <div className="text-sm text-gray-600 mt-1">{collection.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Tipo: {collection.type === 'images' ? 'Imagens' : collection.type === 'videos' ? 'Vídeos' : 'Misto'}
                        {collection.type === 'videos' && (
                          <span className="text-red-500 ml-2">(Não compatível com imagens)</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {(!collections || collections.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <p>Nenhuma coleção encontrada.</p>
                    <button
                      onClick={() => {
                        setShowAddToCollectionModal(false);
                        setShowCollectionsManager(true);
                      }}
                      className="mt-2 text-primary hover:underline text-sm"
                    >
                      Criar nova coleção
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminGallery() {
  return (
    <AuthGuard requireRole="admin">
      <AdminGalleryContent />
    </AuthGuard>
  );
} 