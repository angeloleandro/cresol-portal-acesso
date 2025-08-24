'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

import { Icon } from '@/app/components/icons/Icon';
import { VideoUploadFormRoot } from '@/app/components/VideoUploadForm/VideoUploadForm.Root';
import { createClient } from '@/lib/supabase/client';
import { Collection } from '@/lib/types/collections';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  onVideoAdded?: (videoData: any) => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  collection,
  onVideoAdded
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle video save - integrado com API que suporta coleções
  const handleVideoSave = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // O VideoUploadFormRoot salvou o vídeo automaticamente
      // Com a API modificada, se collection_id for passado no upload direto,
      // o vídeo já será adicionado à coleção automaticamente
      
      // Para YouTube, ainda precisamos adicionar manualmente
      // pois usa endpoint diferente
      
      const supabase = createClient();
      
      // Buscar último vídeo criado
      const { data: lastVideo, error: fetchError } = await supabase
        .from('dashboard_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        throw new Error('Erro ao buscar vídeo criado');
      }

      if (!lastVideo) {
        throw new Error('Nenhum vídeo encontrado');
      }

      // Se não foi um upload direto (YouTube), adicionar à coleção manualmente
      if (lastVideo.upload_type !== 'direct') {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.access_token) {
          throw new Error('Sessão não encontrada');
        }

        const response = await fetch(`/api/collections/${collection.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            item_id: lastVideo.id,
            item_type: 'video',
            order_index: 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao adicionar vídeo à coleção');
        }
      }

      // Callback para atualizar UI pai
      if (onVideoAdded) {
        onVideoAdded(lastVideo);
      }

      // Fechar modal
      onClose();
      
    } catch (error: any) {
      setError(error.message || 'Erro ao processar vídeo');
    } finally {
      setIsProcessing(false);
    }
  }, [collection.id, onClose, onVideoAdded]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (!isProcessing) {
      onClose();
    }
  }, [isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isProcessing) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-white rounded-md shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Adicionar Vídeo</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Adicionando vídeo à coleção &ldquo;{collection.name}&rdquo;
                </p>
              </div>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-1"
                title="Fechar"
              >
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 bg-error-50 border border-error-200 rounded-md p-4"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <Icon name="triangle-alert" className="w-5 h-5 text-error" />
                <div>
                  <h3 className="font-medium text-error-800">Erro</h3>
                  <p className="text-error-600 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-error-400 hover:text-error-600"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
              <div className="bg-white p-6 rounded-md shadow-lg border text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Adicionando vídeo à coleção...</p>
              </div>
            </div>
          )}

          {/* VideoUploadForm Integration */}
          <div className="flex-1 overflow-y-auto scrollbar-modal">
            <div className="p-6">
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <Icon name="folder" className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Destino: Coleção &ldquo;{collection.name}&rdquo;
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  O vídeo será automaticamente adicionado a esta coleção com suporte completo para geração de thumbnails
                </p>
              </div>
              
              <VideoUploadFormRoot
                onSave={handleVideoSave}
                onCancel={handleCancel}
                // Passar contexto de coleção através de uma prop customizada
                customContext={{
                  collectionId: collection.id,
                  collectionName: collection.name
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoUploadModal;