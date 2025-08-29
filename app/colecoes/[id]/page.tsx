'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { CRESOL_COLORS } from '@/lib/design-tokens';
import { createClient } from '@/lib/supabase/client';
import { Collection, CollectionItem } from '@/lib/types/collections';

import ChakraNavbar from '../../components/ChakraNavbar';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';
import Icon from '../../components/icons/Icon';
import OptimizedImage from '../../components/OptimizedImage';
import { ImagePreviewWithGrid } from '../../components/ImagePreview';
import { BaseImage } from '../../components/ImagePreview/ImagePreview.types';
import { VideoPlayer } from '../../components/VideoGallery/VideoGallery.Player';

interface CollectionWithItems extends Collection {
  items?: CollectionItem[];
}

export default function CollectionDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Buscar coleção e seus itens
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados da coleção
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('id', params.id)
          .eq('is_active', true)
          .single();

        if (collectionError || !collectionData) {
          throw new Error('Coleção não encontrada');
        }

        // Buscar itens da coleção
        const { data: itemsData, error: itemsError } = await supabase
          .from('collection_items')
          .select(`
            *,
            gallery_images (
              id,
              title,
              description,
              image_url,
              is_active
            ),
            dashboard_videos (
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              upload_type,
              is_active
            )
          `)
          .eq('collection_id', params.id)
          .order('order_index', { ascending: true });

        if (itemsError) {
          console.error('Erro ao buscar itens:', itemsError);
        }

        // Filtrar apenas itens ativos
        const activeItems = itemsData?.filter(item => {
          if (item.item_type === 'image' && item.gallery_images) {
            return item.gallery_images.is_active;
          }
          if (item.item_type === 'video' && item.dashboard_videos) {
            return item.dashboard_videos.is_active;
          }
          return false;
        }) || [];

        setCollection({
          ...collectionData,
          items: activeItems
        });

        // Incrementar contador de visualizações
        await supabase
          .from('collections')
          .update({ view_count: (collectionData.view_count || 0) + 1 })
          .eq('id', params.id);

      } catch (err) {
        console.error('Erro ao buscar coleção:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar coleção');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [params.id, supabase]);

  // Preparar imagens para o preview
  const getPreviewImages = () => {
    if (!collection?.items) return [];

    return collection.items
      .filter(item => item.item_type === 'image' && (item as any).gallery_images)
      .map(item => {
        const galleryImage = (item as any).gallery_images;
        return {
          id: galleryImage.id,
          title: galleryImage.title || null,
          image_url: galleryImage.image_url,
          is_active: galleryImage.is_active,
          order_index: 0 // We don't need ordering for collection display
        };
      });
  };

  // Obter vídeos da coleção
  const getVideos = () => {
    if (!collection?.items) return [];

    return collection.items
      .filter(item => item.item_type === 'video' && (item as any).dashboard_videos)
      .map(item => (item as any).dashboard_videos);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/home' },
    { label: 'Coleções', href: '/colecoes' },
    { label: collection?.name || 'Carregando...', href: '#' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ChakraNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.collections} />
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ChakraNavbar />
        <main className="container py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Icon name="alert-circle" className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Coleção não encontrada'}
            </h3>
            <p className="text-gray-600 mb-6">
              A coleção que você está procurando não está disponível.
            </p>
            <Link
              href="/colecoes"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Icon name="arrow-left" className="h-5 w-5 mr-2" />
              Voltar para coleções
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const previewImages = getPreviewImages();
  const videos = getVideos();
  const hasContent = previewImages.length > 0 || videos.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <ChakraNavbar />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Collection Header */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          {/* Cover Image */}
          {collection.cover_image_url && (
            <div className="relative h-64 md:h-80 lg:h-96">
              <OptimizedImage
                src={collection.cover_image_url}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-lg text-white/90 max-w-3xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info without cover */}
          {!collection.cover_image_url && (
            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-lg text-gray-600 max-w-3xl">
                  {collection.description}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Icon name="folder" className="h-4 w-4 mr-2" />
                <span>
                  {collection.item_count || 0} {collection.item_count === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <div className="flex items-center">
                <Icon name="calendar" className="h-4 w-4 mr-2" />
                <span>
                  Criada em {new Date(collection.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center">
                <Icon name="eye" className="h-4 w-4 mr-2" />
                <span>
                  {String(collection?.view_count ?? 0)} visualizações
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <Icon 
                    name={collection?.type === 'images' ? 'image' : collection?.type === 'videos' ? 'video' : 'folder'} 
                    className="h-3 w-3 mr-1"
                  />
                  {collection?.type === 'images' && 'Coleção de Imagens'}
                  {collection?.type === 'videos' && 'Coleção de Vídeos'}
                  {collection?.type === 'mixed' && 'Coleção Mista'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Content */}
        {!hasContent ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Icon name="folder" className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Coleção vazia
            </h3>
            <p className="text-gray-600">
              Esta coleção ainda não possui conteúdo disponível.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Images Section */}
            {previewImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="image" className="h-6 w-6 mr-2" />
                  Imagens ({previewImages.length})
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <ImagePreviewWithGrid
                    images={previewImages}
                    columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 5 }}
                    aspectRatio="1:1"
                    showNavigation={true}
                    showInfo={true}
                    lazyLoading={true}
                  />
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="video" className="h-6 w-6 mr-2" />
                  Vídeos ({videos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <VideoPlayer
                        video={video}
                        className="aspect-video"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {video.title || 'Vídeo sem título'}
                        </h3>
                        {video.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/colecoes"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Icon name="arrow-left" className="h-5 w-5 mr-2" />
            Voltar para coleções
          </Link>
        </div>
      </main>


      <Footer />
    </div>
  );
}