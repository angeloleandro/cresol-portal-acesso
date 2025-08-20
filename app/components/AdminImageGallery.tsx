"use client";

import { useState, useEffect } from "react";
import { ImagePreviewGrid } from "./ImagePreview";
import { BaseImage, baseImageToGalleryImage } from "./ImagePreview/ImagePreview.types";
import OptimizedImage from "./OptimizedImage";
import { Icon } from "./icons/Icon";
import UnifiedLoadingSpinner from "./ui/UnifiedLoadingSpinner";
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { processSupabaseImageUrl, debugImageUrl } from "@/lib/imageUtils";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}

interface AdminImageGalleryProps {
  images: GalleryImage[];
  onEdit: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
  onAddToCollection: (image: GalleryImage) => void;
  loading?: boolean;
}

export default function AdminImageGallery({ 
  images, 
  onEdit, 
  onDelete, 
  onAddToCollection,
  loading = false 
}: AdminImageGalleryProps) {
  const [previewImages, setPreviewImages] = useState<BaseImage[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Processar imagens para o componente ImagePreview
  useEffect(() => {
    const processedImages = images.map(img => {
      const processedUrl = processSupabaseImageUrl(img.image_url) || img.image_url;
      
      // Debug das URLs em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        debugImageUrl(processedUrl, `Admin Gallery Image: ${img.title}`);
      }
      
      return {
        id: img.id,
        url: processedUrl,
        title: img.title || "Imagem da galeria",
        alt: img.title || "Imagem da galeria"
      };
    });
    
    setPreviewImages(processedImages);
  }, [images]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <UnifiedLoadingSpinner size="large" />
        <p className="mt-2 text-sm text-gray-500">Carregando imagens...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-cresol-gray text-center mt-12">
        <Icon name="image" className="mx-auto h-16 w-16 text-muted mb-4" />
        <p>Nenhuma imagem cadastrada ainda.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toggle para alternar entre view admin e preview */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              !showPreview 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon name="settings" className="h-4 w-4 mr-1 inline" />
            Admin
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              showPreview 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon name="Eye" className="h-4 w-4 mr-1 inline" />
            Preview
          </button>
        </div>
      </div>

      {showPreview ? (
        /* Modo Preview - usa o ImagePreviewGrid */
        <ImagePreviewGrid
          images={previewImages.map(baseImageToGalleryImage)}
          onImageClick={(image, index) => {
            // Preview mode - apenas visualização
            console.log('Imagem clicada no preview:', image, index);
          }}
          columns={{ xs: 2, sm: 3, md: 4, lg: 4, xl: 4 }}
          aspectRatio="4:3"
        />
      ) : (
        /* Modo Admin - grid original com ações */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-lg border border-gray-200/60 hover:border-gray-200 transition-colors duration-150 overflow-hidden flex flex-col">
              <div className="relative w-full h-48 bg-cresol-gray-light">
                {img.image_url ? (
                  <OptimizedImage 
                    src={processSupabaseImageUrl(img.image_url) || img.image_url} 
                    alt={img.title || "Imagem da galeria"} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={80}
                    fallbackText="Imagem indisponível"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-cresol-gray">Sem imagem</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-cresol-gray mb-1">
                  {img.title || "(Sem título)"}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Icon name="sort" className="h-4 w-4 mr-1" />
                  Ordem: {img.order_index}
                  {img.is_active ? (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="check" className="h-3 w-3 mr-1" />
                      Ativo
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      <Icon name="close" className="h-3 w-3 mr-1" />
                      Inativo
                    </span>
                  )}
                </div>
                <div className="mt-auto flex gap-2 pt-4 flex-wrap">
                  <button 
                    className="text-primary hover:underline rounded-md px-2 py-1 transition-colors hover:bg-primary/10"
                    onClick={() => onEdit(img)}
                  >
            <Icon name="pencil" className="h-4 w-4 mr-1 inline" />
                    Editar
                  </button>
                  <button 
                    className="text-blue-600 hover:underline rounded-md px-2 py-1 transition-colors hover:bg-blue/10"
                    onClick={() => onAddToCollection(img)}
                  >
                    <Icon name="folder" className="h-4 w-4 mr-1 inline" />
                    + Coleção
                  </button>
                  <button 
                    className="text-red-500 hover:underline rounded-md px-2 py-1 transition-colors hover:bg-red/10"
                    onClick={() => onDelete(img)}
                  >
                    <Icon name="trash" className="h-4 w-4 mr-1 inline" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}