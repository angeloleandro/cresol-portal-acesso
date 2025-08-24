"use client";

import { useState, useCallback, useEffect } from "react";

import {
  VIDEO_THUMBNAIL_CONFIG,
  VIDEO_MESSAGES
} from '@/lib/constants/video-ui';
import { 
  generateVideoThumbnail, 
  generateVideoThumbnailSimple,
  uploadThumbnailToStorage, 
  CheckThumbnailSupport as checkThumbnailSupport,
  CleanupObjectUrls as cleanupObjectUrls,
  ThumbnailResult,
  ThumbnailOptions 
} from "@/lib/thumbnail-generator";

interface UseThumbnailGeneratorProps {
  videoFile: File | null;
  videoUrl?: string;
  autoGenerate?: boolean;
  defaultOptions?: ThumbnailOptions;
  timestamp?: number;
}

interface ThumbnailState {
  result: ThumbnailResult | null;
  isGenerating: boolean;
  error: string | null;
  isUploading: boolean;
  uploadedUrl: string | null;
  isSupported: boolean;
}

/**
 * useThumbnailGenerator function
 * @todo Add proper documentation
 */
export function useThumbnailGenerator({
  videoFile,
  videoUrl,
  autoGenerate = true,
  defaultOptions = {},
  timestamp
}: UseThumbnailGeneratorProps) {
  const [state, setState] = useState<ThumbnailState>({
    result: null,
    isGenerating: false,
    error: null,
    isUploading: false,
    uploadedUrl: null,
    isSupported: true
  });

  const [createdUrls, setCreatedUrls] = useState<string[]>([]);

  const generateThumbnail = useCallback(async (seekTime?: number) => {
    if ((!videoFile && !videoUrl) || !state.isSupported) return;

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null 
    }));

    try {
      const options = { ...defaultOptions };
      if (seekTime !== undefined) {
        options.seekTime = seekTime;
      } else if (timestamp !== undefined) {
        options.seekTime = timestamp;
      }

      let result: ThumbnailResult;
      
      if (videoFile) {
        try {
          result = await generateVideoThumbnail(videoFile, options);
        } catch (error) {
          result = await generateVideoThumbnailSimple(videoFile, options);
        }
      } else if (videoUrl) {
        // Para videoUrl, vamos criar um elemento video temporário para gerar o thumbnail
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.src = videoUrl;
        
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
        });
        
        video.currentTime = options.seekTime || VIDEO_THUMBNAIL_CONFIG.generation.defaultTimestamp;
        
        await new Promise(resolve => {
          video.onseeked = resolve;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
        });
        
        result = {
          blob,
          url: URL.createObjectURL(blob),
          timestamp: options.seekTime || VIDEO_THUMBNAIL_CONFIG.generation.defaultTimestamp,
          width: canvas.width,
          height: canvas.height
        };
      } else {
        throw new Error('Nem videoFile nem videoUrl fornecidos');
      }
      
      setCreatedUrls(prev => [...prev, result.url]);
      
      setState(prev => ({ 
        ...prev, 
        result,
        isGenerating: false 
      }));

      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: error instanceof Error ? error.message : VIDEO_MESSAGES.ERRORS.GENERATION_FAILED
      }));
      return null;
    }
  }, [videoFile, videoUrl, defaultOptions, timestamp, state.isSupported]);

  const uploadThumbnail = useCallback(async (): Promise<string | null> => {
    if (!state.result || !videoFile) {
      setState(prev => ({
        ...prev,
        error: 'Nenhuma thumbnail disponível para upload'
      }));
      return null;
    }

    setState(prev => ({ 
      ...prev, 
      isUploading: true, 
      error: null 
    }));

    try {
      const uploadedUrl = await uploadThumbnailToStorage(
        state.result.blob,
        videoFile.name
      );

      setState(prev => ({ 
        ...prev, 
        uploadedUrl,
        isUploading: false 
      }));

      return uploadedUrl;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        error: error instanceof Error ? error.message : 'Erro ao fazer upload da thumbnail'
      }));
      return null;
    }
  }, [state.result, videoFile]);

  const regenerateAt = useCallback(async (timeSeconds: number) => {
    return await generateThumbnail(timeSeconds);
  }, [generateThumbnail]);

  const clearThumbnail = useCallback(() => {
    if (state.result?.url) {
      setCreatedUrls(prev => prev.filter(url => url !== state.result?.url));
      cleanupObjectUrls([state.result.url]);
    }
    
    setState(prev => ({
      ...prev,
      result: null,
      error: null,
      uploadedUrl: null
    }));
  }, [state.result]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Verificar suporte do browser
  useEffect(() => {
    const support = checkThumbnailSupport();
    setState(prev => ({
      ...prev,
      isSupported: support.supported,
      error: support.supported ? null : support.reasons.join(', ')
    }));
  }, []);

  // Auto-gerar thumbnail quando arquivo ou URL muda
  useEffect(() => {
    if ((videoFile || videoUrl) && autoGenerate && state.isSupported) {
      generateThumbnail();
    }
  }, [videoFile, videoUrl, autoGenerate, state.isSupported, generateThumbnail]);

  // Cleanup URLs ao desmontar
  useEffect(() => {
    return () => {
      if (createdUrls.length > 0) {
        cleanupObjectUrls(createdUrls);
      }
    };
  }, [createdUrls]);

  return {
    // Estado
    thumbnail: state.result,
    isGenerating: state.isGenerating,
    isUploading: state.isUploading,
    error: state.error,
    uploadedUrl: state.uploadedUrl,
    isSupported: state.isSupported,
    
    // Ações
    generateThumbnail,
    regenerateAt,
    uploadThumbnail,
    clearThumbnail,
    clearError,
    
    // Estado computado
    hasError: !!state.error,
    isReady: !!state.result && !state.isGenerating,
    canUpload: !!state.result && !state.isUploading,
    isProcessing: state.isGenerating || state.isUploading
  };
}