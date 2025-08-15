// Componente de upload e recorte de imagens

import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { CropArea } from '../types/sector.types';

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
  onCropComplete: (croppedArea: CropArea, croppedAreaPixels: CropArea) => void;
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
  
  // Se há uma imagem original para recortar
  if (originalImage) {
    return (
      <div className="mt-4">
        <div className="relative w-full h-64 border rounded-md overflow-hidden">
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
        
        <div className="mt-4 flex flex-col space-y-4">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 w-20">Zoom:</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 w-20">Rotação:</label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => onRotationChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="ml-2 text-sm text-gray-600">{rotation}°</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div>
            <button
              type="button"
              onClick={onCancelCrop}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
          <button
            type="button"
            onClick={onCropImage}
            disabled={uploadingImage}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploadingImage ? 'Processando...' : 'Recortar e Usar'}
          </button>
        </div>
      </div>
    );
  }
  
  // Se há uma imagem preview já processada
  if (imagePreview) {
    return (
      <div className="mt-2 relative">
        <div className="relative h-40 w-full md:w-64 border rounded-md overflow-hidden">
          <Image 
            src={imagePreview} 
            alt="Preview" 
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 256px"
          />
        </div>
        <button
          type="button"
          onClick={onRemoveImage}
          className="mt-2 text-sm text-red-600 hover:text-red-700"
        >
          Remover imagem
        </button>
      </div>
    );
  }
  
  // Input de arquivo padrão
  return (
    <div className="mt-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-primary/10 file:text-primary
          hover:file:bg-primary/20 transition-colors"
      />
      <p className="mt-1 text-xs text-gray-500">
        Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
      </p>
    </div>
  );
}