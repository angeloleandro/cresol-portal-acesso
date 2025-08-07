"use client";

import { useState } from "react";

interface ThumbnailFallbackProps {
  videoFileName?: string;
  onManualUpload?: (file: File) => void;
  isUploading?: boolean;
}

export default function ThumbnailFallback({
  videoFileName,
  onManualUpload,
  isUploading = false
}: ThumbnailFallbackProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onManualUpload) {
      onManualUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile && onManualUpload) {
      onManualUpload(imageFile);
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Thumbnail não disponível
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Não foi possível gerar automaticamente um thumbnail para este vídeo.
          {videoFileName && (
            <>
              <br />
              <span className="font-medium">{videoFileName}</span>
            </>
          )}
        </p>

        {onManualUpload && (
          <div 
            className={`relative border-2 border-dashed rounded-md p-4 transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            <div className="text-center">
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-600">Enviando...</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Clique ou arraste uma imagem aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou WebP • Máximo 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Dica: Use uma imagem representativa do conteúdo do vídeo</p>
        </div>
      </div>
    </div>
  );
}