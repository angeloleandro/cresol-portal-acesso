import { Suspense } from "react";

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { processSupabaseImageUrl, debugImageUrl } from "@/lib/imageUtils";
import { CreateClient } from '@/lib/supabase/server';

import Breadcrumb from "../components/Breadcrumb";
import { CollectionSection } from "../components/Collections/CollectionSection";
import Footer from "../components/Footer";
import { Icon } from "../components/icons/Icon";
import { ImagePreviewWithGrid } from "../components/ImagePreview";
import { BaseImage, baseImageToGalleryImage } from "../components/ImagePreview/ImagePreview.types";
// import Navbar from "../components/Navbar"; // NextUI version
import ChakraNavbar from '../components/ChakraNavbar'; // Chakra UI version

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

async function GalleryContent({ 
  searchParams 
}: { 
  searchParams: { collection?: string } 
}) {
  const collectionId = searchParams.collection;
  let images: GalleryImage[] = [];
  let collection: Collection | null = null;

  try {
    const supabase = CreateClient();
    
    if (collectionId) {
      // Fetch collection details
      const { data: collectionData } = await supabase
        .from("collections")
        .select("id, name, description")
        .eq("id", collectionId)
        .single();
      
      collection = collectionData;

      // Fetch collection items
      const { data: itemsData } = await supabase
        .from("collection_items")
        .select(`
          order_index,
          gallery_images!inner(id, title, image_url, is_active, order_index)
        `)
        .eq("collection_id", collectionId)
        .eq("item_type", "image")
        .order("order_index", { ascending: true });

      const collectionImages = itemsData?.map((item: any) => item.gallery_images) || [];
      images = collectionImages.filter((img: any) => img.is_active);
    } else {
      // Fetch all images if no collection specified
      const { data } = await supabase
        .from("gallery_images")
        .select("id, title, image_url, is_active, order_index")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      images = data || [];
    }
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
  }

  // Process images for the ImagePreview component
  const previewImages: BaseImage[] = images.map(img => {
    const processedUrl = processSupabaseImageUrl(img.image_url) || img.image_url;
    
    // Debug URLs in development
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ChakraNavbar />
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
          {images.length === 0 ? (
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

export default function GalleryPage({
  searchParams,
}: {
  searchParams: { collection?: string }
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <ChakraNavbar />
        <main className="container py-8">
          <div className="flex items-center justify-center py-16">
            <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.gallery} fullScreen={false} />
          </div>
        </main>
        <Footer />
      </div>
    }>
      <GalleryContent searchParams={searchParams} />
    </Suspense>
  );
} 