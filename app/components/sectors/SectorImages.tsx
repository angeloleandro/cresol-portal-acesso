'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { processSupabaseImageUrl, debugImageUrl } from '@/lib/imageUtils';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { Icon } from '../icons/Icon';
import { ImagePreviewWithGrid } from '../ImagePreview';
import { BaseImage, baseImageToGalleryImage } from '../ImagePreview/ImagePreview.types';
import UnifiedLoadingSpinner from '../ui/UnifiedLoadingSpinner';

interface SectorImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  created_at: string;
}

interface SectorImagesProps {
  sectorId: string;
  limit?: number;
}

export default function SectorImages({ sectorId, limit = 6 }: SectorImagesProps) {
  const [images, setImages] = useState<BaseImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('sector_images')
          .select('id, title, description, image_url, created_at')
          .eq('sector_id', sectorId)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) {
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
            debugImageUrl(img.image_url, `Sector Image: ${img.title}`)
          );
        }
        
        // Converter para formato do ImagePreview
        const previewImages: BaseImage[] = processedImages.map(img => ({
          id: img.id,
          url: img.image_url,
          title: img.title || "Imagem do setor",
          alt: img.title || "Imagem do setor"
        }));
        
        setImages(previewImages);
      } catch (error) {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [sectorId, limit]);

  if (loading) {
    return (
      <section className="bg-white rounded-md border border-cresol-gray-light">
        <div className="p-6">
          <UnifiedLoadingSpinner message="Carregando imagens..." />
        </div>
      </section>
    );
  }

  return (
    <section 
      className="bg-white rounded-md border border-cresol-gray-light"
      aria-labelledby="sector-images-heading"
    >
      <div className="p-6 border-b border-cresol-gray-light">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Icon name="image" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
            <h2 id="sector-images-heading" className="text-xl font-semibold text-cresol-gray-dark">
              Imagens
            </h2>
          </div>
          {images.length > 0 && (
            <Link 
              href={`/setores/${sectorId}/imagens`}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Ver todas
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">
        {images.length === 0 ? (
          <div className="text-center py-8" role="status">
            <p className="text-cresol-gray">
              Nenhuma imagem publicada ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden">
              <ImagePreviewWithGrid
                images={images.map(baseImageToGalleryImage)}
                columns={{
                  xs: 1,
                  sm: 2,
                  md: Math.min(3, images.length)
                }}
                aspectRatio="auto"
              />
            </div>
            {images.length > limit && (
              <div className="text-center pt-4 border-t border-cresol-gray-light">
                <Link 
                  href={`/setores/${sectorId}/imagens`}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Ver mais {images.length - limit} imagens
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}