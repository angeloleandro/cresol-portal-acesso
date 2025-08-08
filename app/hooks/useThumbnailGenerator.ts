"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  generateVideoThumbnail, 
  generateVideoThumbnailSimple,
  uploadThumbnailToStorage, 
  checkThumbnailSupport,
  cleanupObjectUrls,
  ThumbnailResult,
  ThumbnailOptions 
} from "@/lib/thumbnail-generator";

interface UseThumbnailGeneratorProps {
  videoFile: File | null;
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

export function useThumbnailGenerator({
  videoFile,
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
    if (!videoFile || !state.isSupported) return;

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

      console.log('🎬 Tentando geração padrão de thumbnail...');
      let result: ThumbnailResult;
      
      try {
        result = await generateVideoThumbnail(videoFile, options);
      } catch (error) {
        console.warn('⚠️ Geração padrão falhou, tentando versão simples...', error);
        result = await generateVideoThumbnailSimple(videoFile, options);
        console.log('✅ Geração simples funcionou como fallback');
      }
      
      setCreatedUrls(prev => [...prev, result.url]);
      
      setState(prev => ({ 
        ...prev, 
        result,
        isGenerating: false 
      }));

      return result;
    } catch (error) {
      console.error('❌ Ambas as versões de geração falharam:', error);
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: error instanceof Error ? error.message : 'Erro ao gerar thumbnail - tente um arquivo diferente'
      }));
      return null;
    }
  }, [videoFile, defaultOptions, timestamp, state.isSupported]);

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
      console.error('Erro ao fazer upload da thumbnail:', error);
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

  // Auto-gerar thumbnail quando arquivo muda
  useEffect(() => {
    if (videoFile && autoGenerate && state.isSupported) {
      generateThumbnail();
    }
  }, [videoFile, autoGenerate, state.isSupported, generateThumbnail]);

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