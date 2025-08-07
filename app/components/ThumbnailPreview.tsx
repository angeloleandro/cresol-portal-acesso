"use client";

import { useState, useEffect, useRef } from "react";
import OptimizedImage from "./OptimizedImage";
import ThumbnailFallback from "./ThumbnailFallback";
import { ThumbnailResult } from "@/lib/thumbnail-generator";
import Icon from '@/app/components/icons/Icon';

interface ThumbnailPreviewProps {
  thumbnailResult: ThumbnailResult | null;
  videoFile: File | null;
  onThumbnailChange: (result: ThumbnailResult) => void;
  onRegenerateAt: (timeSeconds: number) => void;
  onManualUpload?: (file: File) => void;
  isGenerating: boolean;
  error?: string | null;
  showFallback?: boolean;
}

export default function ThumbnailPreview({
  thumbnailResult,
  videoFile,
  onThumbnailChange,
  onRegenerateAt,
  onManualUpload,
  isGenerating,
  error,
  showFallback = false
}: ThumbnailPreviewProps) {
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [showTimeline, setShowTimeline] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoFile && videoRef.current) {
      const video = videoRef.current;
      const url = URL.createObjectURL(videoFile);
      
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setSelectedTime(thumbnailResult?.timestamp || Math.min(5, video.duration * 0.25));
      };
      
      video.src = url;
      video.load();
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoFile, thumbnailResult]);

  const handleRegenerateClick = () => {
    setShowTimeline(!showTimeline);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setSelectedTime(time);
  };

  const handleRegenerateConfirm = () => {
    onRegenerateAt(selectedTime);
    setShowTimeline(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!thumbnailResult && !isGenerating && !showFallback && !error) {
    return null;
  }
  
  // Show fallback when there's an error or explicitly requested
  if ((error || showFallback) && !thumbnailResult && !isGenerating) {
    return (
      <ThumbnailFallback 
        videoFileName={videoFile?.name}
        onManualUpload={onManualUpload}
        isUploading={false}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden video element for duration calculation */}
      {videoFile && (
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          muted
          preload="metadata"
        />
      )}

      {/* Thumbnail Preview */}
      <div className="relative">
        <div className="relative w-full h-48 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-gray-600">Gerando thumbnail...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-red-600 font-medium">Erro ao gerar thumbnail</p>
              <p className="text-xs text-gray-500 mt-1">{error}</p>
              
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-left">
                <p className="text-sm text-yellow-800 font-medium mb-2 flex items-center gap-2">
                  <Icon name="Info" className="h-4 w-4" />
                  Possíveis soluções:
                </p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Verifique o console do navegador (F12) para detalhes</li>
                  <li>• Tente outro formato de vídeo (MP4 recomendado)</li>
                  <li>• Verifique se o arquivo não está corrompido</li>
                  <li>• Use o upload manual de thumbnail abaixo</li>
                </ul>
              </div>
            </div>
          ) : thumbnailResult ? (
            <>
              <OptimizedImage
                src={thumbnailResult.url}
                alt="Thumbnail do vídeo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
                fallbackText="Thumbnail"
              />
              
              {/* Timestamp overlay */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatTime(thumbnailResult.timestamp)}
              </div>
            </>
          ) : null}
        </div>

        {/* Controls */}
        {thumbnailResult && !isGenerating && (
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-600">
              Dimensões: {thumbnailResult.width}x{thumbnailResult.height}
            </div>
            <button
              type="button"
              onClick={handleRegenerateClick}
              className="flex items-center gap-2 px-3 py-1 text-sm text-primary border border-primary rounded hover:bg-primary/5 transition-colors"
              disabled={isGenerating}
            >
              <Icon name="refresh" className="w-4 h-4" />
              Gerar em outro momento
            </button>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      {showTimeline && videoDuration > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Escolher momento:
              </label>
              <span className="text-sm text-gray-600">
                {formatTime(selectedTime)} / {formatTime(videoDuration)}
              </span>
            </div>
            
            <input
              type="range"
              min={0}
              max={videoDuration}
              step={0.1}
              value={selectedTime}
              onChange={handleTimeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTimeline(false)}
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegenerateConfirm}
                className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={isGenerating}
              >
                Gerar Thumbnail
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #F58220;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #F58220;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}