/**
 * Local Thumbnail Preview Component
 * Allows thumbnail generation and time selection BEFORE uploading to server
 * Works with local video files for immediate feedback
 */

"use client";

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '../icons/Icon';
import { useThumbnailGenerator } from '@/app/hooks/useThumbnailGenerator';

interface LocalThumbnailPreviewProps {
  videoFile: File | null;
  onThumbnailGenerated?: (file: File, timestamp: number) => void;
  onTimestampChange?: (timestamp: number) => void;
  disabled?: boolean;
}

export const VideoUploadFormLocalThumbnailPreview = memo(({
  videoFile,
  onThumbnailGenerated,
  onTimestampChange,
  disabled = false
}: LocalThumbnailPreviewProps) => {
  
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(1.0);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    width: number;
    height: number;
  } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Hook de geração de thumbnail local
  const thumbnailState = useThumbnailGenerator({
    videoFile,
    autoGenerate: false, // Não gerar automaticamente
    timestamp: selectedTimestamp
  });

  console.log('🎬 [LOCAL_PREVIEW] Estado do componente:', {
    videoFile: videoFile?.name || 'null',
    selectedTimestamp,
    thumbnailState: {
      isGenerating: thumbnailState.isGenerating,
      hasError: thumbnailState.hasError,
      error: thumbnailState.error,
      thumbnailUrl: thumbnailState.thumbnail?.url || 'null'
    }
  });

  // Carregar metadados do vídeo quando arquivo for selecionado
  useEffect(() => {
    if (!videoFile) {
      console.log('📭 [LOCAL_PREVIEW] Limpando dados (sem arquivo)');
      setVideoMetadata(null);
      setIsVideoReady(false);
      return;
    }

    console.log('🔄 [LOCAL_PREVIEW] Carregando metadados do vídeo:', videoFile.name);
    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    
    video.onloadedmetadata = () => {
      console.log('✅ [LOCAL_PREVIEW] Metadados carregados:', {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
      
      setVideoMetadata({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
      setIsVideoReady(true);
      URL.revokeObjectURL(videoUrl);
    };
    
    video.onerror = (error) => {
      console.error('❌ [LOCAL_PREVIEW] Erro ao carregar metadados:', error);
      setVideoMetadata(null);
      setIsVideoReady(false);
      URL.revokeObjectURL(videoUrl);
    };
    
    video.src = videoUrl;

    // Cleanup
    return () => {
      if (video.src) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoFile]);

  // Handler para mudança de timestamp
  const handleTimestampChange = useCallback((newTimestamp: number) => {
    console.log('⏰ [LOCAL_PREVIEW] Mudança de timestamp:', newTimestamp);
    setSelectedTimestamp(newTimestamp);
    onTimestampChange?.(newTimestamp);
  }, [onTimestampChange]);

  // Handler para gerar thumbnail com timestamp atual
  const handleGenerateThumbnail = useCallback(async () => {
    if (!videoFile || !isVideoReady) {
      console.warn('⚠️ [LOCAL_PREVIEW] Não é possível gerar: vídeo não carregado');
      return;
    }

    console.log('🎯 [LOCAL_PREVIEW] Gerando thumbnail no timestamp:', selectedTimestamp);
    
    try {
      const result = await thumbnailState.generateThumbnail(selectedTimestamp);
      
      if (result && result.blob) {
        console.log('✅ [LOCAL_PREVIEW] Thumbnail gerada com sucesso');
        
        // Criar File a partir do blob
        const thumbnailFile = new File(
          [result.blob], 
          `thumbnail_${selectedTimestamp}s.jpg`, 
          { type: 'image/jpeg' }
        );
        
        onThumbnailGenerated?.(thumbnailFile, selectedTimestamp);
      }
    } catch (error) {
      console.error('❌ [LOCAL_PREVIEW] Erro na geração de thumbnail:', error);
    }
  }, [videoFile, isVideoReady, selectedTimestamp, thumbnailState, onThumbnailGenerated]);

  // Quick jump handlers
  const handleQuickJump = useCallback((position: 'start' | 'quarter' | 'half' | 'three-quarters' | 'end') => {
    if (!videoMetadata) return;
    
    const positions = {
      start: 0.1,
      quarter: videoMetadata.duration * 0.25,
      half: videoMetadata.duration * 0.5,
      'three-quarters': videoMetadata.duration * 0.75,
      end: Math.max(videoMetadata.duration - 0.5, 0.1)
    };
    
    handleTimestampChange(positions[position]);
  }, [videoMetadata, handleTimestampChange]);

  // Não renderizar se não há arquivo
  if (!videoFile) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-neutral-800">Preview da Thumbnail</h4>
        <div className="text-xs text-neutral-500">
          <span>Preview local (não enviado ainda)</span>
        </div>
      </div>

      {/* Video Metadata */}
      {videoMetadata && (
        <div className="text-xs text-neutral-600 bg-white p-2 rounded border">
          <div className="grid grid-cols-3 gap-2">
            <div>Duração: {Math.round(videoMetadata.duration)}s</div>
            <div>Resolução: {videoMetadata.width}×{videoMetadata.height}</div>
            <div>Timestamp: {selectedTimestamp.toFixed(1)}s</div>
          </div>
        </div>
      )}

      {/* Timeline Controls */}
      {isVideoReady && videoMetadata && (
        <div className="space-y-3">
          {/* Slider */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-700">Selecionar Momento:</label>
            <input
              type="range"
              min={0.1}
              max={Math.max(videoMetadata.duration - 0.1, 1)}
              step={0.1}
              value={selectedTimestamp}
              onChange={(e) => handleTimestampChange(parseFloat(e.target.value))}
              disabled={disabled || thumbnailState.isGenerating}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Quick Jump Buttons */}
          <div className="flex gap-1 text-xs">
            {[
              { key: 'start', label: 'Início', icon: 'skip-back' },
              { key: 'quarter', label: '25%', icon: 'gauge' },
              { key: 'half', label: '50%', icon: 'gauge' },
              { key: 'three-quarters', label: '75%', icon: 'gauge' },
              { key: 'end', label: 'Final', icon: 'skip-forward' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleQuickJump(key as any)}
                disabled={disabled || thumbnailState.isGenerating}
                className="flex-1 px-2 py-1 bg-white border border-neutral-300 rounded text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-1">
                  <Icon name={icon as any} className="w-3 h-3" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Thumbnail Preview */}
      <div className="space-y-3">
        {thumbnailState.thumbnail && (
          <div className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden">
            <Image
              src={thumbnailState.thumbnail.url}
              alt={`Preview no momento ${selectedTimestamp}s`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {selectedTimestamp.toFixed(1)}s
            </div>
          </div>
        )}

        {thumbnailState.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <Icon name="triangle-alert" className="w-4 h-4" />
              <span>{thumbnailState.error}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-neutral-600">
            {thumbnailState.isGenerating ? 'Gerando preview...' : 'Escolha o momento e gere o preview'}
          </div>
          
          <button
            type="button"
            onClick={handleGenerateThumbnail}
            disabled={disabled || !isVideoReady || thumbnailState.isGenerating}
            className="
              px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium
              hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            "
          >
            {thumbnailState.isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icon name="image" className="w-4 h-4" />
                <span>Gerar Preview</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

VideoUploadFormLocalThumbnailPreview.displayName = 'VideoUploadFormLocalThumbnailPreview';