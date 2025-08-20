// Componente de upload e recorte de imagem
// Baseado no padrão do setor para manter consistência

import React from 'react';
import Cropper from 'react-easy-crop';
import Image from 'next/image';
import { CropArea } from '../types/subsector.types';

interface ImageUploadCropperProps {
  originalImage: string | null;
  imagePreview: string | null;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  uploadingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: CropArea) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCropImage: () => Promise<void>;
  onCancelCrop: () => void;
  onRemoveImage: () => void;
}

export function ImageUploadCropper({
  originalImage,
  imagePreview,
  crop,
  zoom,
  rotation,
  uploadingImage,
  fileInputRef,
  onCropChange,
  onZoomChange,
  onRotationChange,
  onCropComplete,
  onFileChange,
  onCropImage,
  onCancelCrop,
  onRemoveImage
}: ImageUploadCropperProps) {
  
  if (originalImage) {
    return (
      <div className="space-y-4">
        <div className="relative h-64 bg-gray-100 rounded-md overflow-hidden">
          <Cropper
            image={originalImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={16 / 9}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropComplete}
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Rotação
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => onRotationChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCropImage}
            disabled={uploadingImage}
            className="flex-1 px-3 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {uploadingImage ? 'Processando...' : 'Confirmar Recorte'}
          </button>
          <button
            type="button"
            onClick={onCancelCrop}
            disabled={uploadingImage}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }
  
  if (imagePreview) {
    return (
      <div className="space-y-2">
        <div className="relative h-48 bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={imagePreview}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <button
          type="button"
          onClick={onRemoveImage}
          className="w-full px-3 py-2 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100"
        >
          Remover Imagem
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400"
      >
        Selecionar Imagem
      </button>
    </div>
  );
}