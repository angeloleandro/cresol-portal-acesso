"use client";

import { useEffect, useState } from "react";

import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { processSupabaseImageUrl, debugImageUrl } from "@/lib/imageUtils";
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { Icon } from "./icons/Icon";
import { ImagePreviewWithGrid } from "./ImagePreview";
import { BaseImage, baseImageToGalleryImage } from "./ImagePreview/ImagePreview.types";
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';


interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}

interface ImageGalleryHomeProps {
  limit?: number;
}

export default function ImageGalleryHome({ limit = 6 }: ImageGalleryHomeProps) {
  const [images, setImages] = useState<BaseImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_images")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });
        
        if (error) {
          console.error('Erro ao buscar imagens da galeria:', error);
          setImages([]);
          return;
        }
        
        const processedImages = (data || []).map(img => ({
          ...img,
          image_url: processSupabaseImageUrl(img.image_url) || img.image_url
        }));
        
        // Debug das URLs em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          processedImages.forEach(img => 
            debugImageUrl(img.image_url, `Gallery Image: ${img.title}`)
          );
        }
        
        // Converter para formato do ImagePreview
        const previewImages: BaseImage[] = processedImages
          .slice(0, limit)
          .map(img => ({
            id: img.id,
            url: img.image_url,
            title: img.title || "Imagem da galeria",
            alt: img.title || "Imagem da galeria"
          }));
        
        setImages(previewImages);
      } catch (error) {
        console.error('Erro ao processar imagens da galeria:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [limit]);

  if (loading) {
    return (
      <section className="card">
        <div className="flex justify-center py-8">
          <UnifiedLoadingSpinner size="default" message={LOADING_MESSAGES.gallery} />
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="heading-3 text-title">Galeria de Imagens</h2>
            <p className="body-text-small text-muted mt-1">Explore nosso acervo visual</p>
          </div>
        </div>
        <div className="text-center py-8">
          <Icon name="image" className="mx-auto h-16 w-16 text-muted mb-4" />
          <p className="body-text text-muted">Nenhuma imagem disponível no momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="heading-3 text-title">Galeria de Imagens</h2>
          <p className="body-text-small text-muted mt-1">Explore nosso acervo visual</p>
        </div>
        <a 
          href="/galeria" 
          className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
        >
          Ver todas
          <Icon name="arrow-right" className="h-4 w-4 ml-1" />
        </a>
      </div>
      
      <ImagePreviewWithGrid
        images={images.map(baseImageToGalleryImage)}
        columns={{ xs: 2, sm: 3, md: 3, lg: 3, xl: 3 }}
        aspectRatio="4:3"
        showNavigation={true}
        showInfo={true}
      />
      
      <div className="flex justify-center mt-6">
        <a 
          href="/galeria" 
          className="text-white px-5 py-2.5 rounded-md text-xs font-medium transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: '#F38332' }}
        >
          Ver galeria completa
        </a>
      </div>
    </section>
  );
}