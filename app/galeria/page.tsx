"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from "react";

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { processSupabaseImageUrl, debugImageUrl } from "@/lib/imageUtils";
import { getSupabaseClient } from "@/lib/supabase";

import Breadcrumb from "../components/Breadcrumb";
import { CollectionSection } from "../components/Collections/CollectionSection";
import Footer from "../components/Footer";
import { Icon } from "../components/icons/Icon";
import { ImagePreviewWithGrid } from "../components/ImagePreview";
import { BaseImage, baseImageToGalleryImage } from "../components/ImagePreview/ImagePreview.types";
import Navbar from "../components/Navbar";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

function GalleryContent() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [previewImages, setPreviewImages] = useState<BaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<Collection | null>(null);
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection');

  useEffect(() => {
    // Só executar no lado do cliente
    if (typeof window === 'undefined') return;
    
    const fetchData = async () => {
      try {
        // If collection ID is provided, fetch collection details and its items
        if (collectionId) {
          // Fetch collection details
          const { data: collectionData } = await getSupabaseClient()
            .from("collections")
            .select("*")
            .eq("id", collectionId)
            .single();
          
          setCollection(collectionData);

          // Fetch collection items
          const { data: itemsData } = await getSupabaseClient()
            .from("collection_items")
            .select(`
              *,
              gallery_images!inner(*)
            `)
            .eq("collection_id", collectionId)
            .eq("item_type", "image")
            .order("order_index", { ascending: true });

          const collectionImages = itemsData?.map(item => item.gallery_images) || [];
          const activeImages = collectionImages.filter(img => img.is_active);
          setImages(activeImages);
        } else {
          // Fetch all images if no collection specified
          const { data } = await getSupabaseClient()
            .from("gallery_images")
            .select("*")
            .eq("is_active", true)
            .order("order_index", { ascending: true });
          setImages(data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar imagens:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [collectionId]);

  // Processar imagens para o componente ImagePreview
  useEffect(() => {
    const processedImages = images.map(img => {
      const processedUrl = processSupabaseImageUrl(img.image_url) || img.image_url;
      
      // Debug das URLs em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        debugImageUrl(processedUrl, `Gallery Image: ${img.title}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              ...(collection ? [{ label: 'Galeria', href: '/galeria' }] : []),
              { label: collection ? collection.name : 'Galeria' }
            ]} 
          />
        </div>

        <div className="mb-8">
          <h1 className="heading-1 text-title mb-2">
            {collection ? collection.name : 'Galeria de Imagens'}
          </h1>
          <p className="body-text text-muted">
            {collection ? collection.description : 'Explore nossa coleção de fotos e momentos especiais da Cresol.'}
          </p>
          
          {/* Back to collections button if viewing a collection */}
          {collection && (
            <a
              href="/galeria"
              className="inline-flex items-center mt-4 text-primary hover:text-primary-dark transition-colors"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" />
              Voltar para todas as galerias
            </a>
          )}
        </div>

        {/* Collections Section - only show when not viewing a specific collection */}
        {!collection && (
          <CollectionSection 
            type="images" 
            title="Coleções de Imagens"
            showEmptyState={false}
          />
        )}

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <UnifiedLoadingSpinner 
                size="default" 
                message={LOADING_MESSAGES.gallery}
              />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="image" className="mx-auto h-16 w-16 text-muted mb-4" />
              <h3 className="heading-3 text-title mb-2">Nenhuma imagem encontrada</h3>
              <p className="body-text text-muted">A galeria ainda não possui imagens disponíveis.</p>
            </div>
          ) : (
            <ImagePreviewWithGrid
              images={previewImages.map(baseImageToGalleryImage)}
              columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
              aspectRatio="4:3"
              showNavigation={true}
              showInfo={true}
            />
          )}
        </div>

      </main>
      
      <Footer />
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container py-8">
          <div className="flex items-center justify-center py-16">
            <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.gallery} fullScreen={false} />
          </div>
        </main>
        <Footer />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
} 