"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback, useState } from 'react';
import { Input } from '@chakra-ui/react';
import Cropper from 'react-easy-crop';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/icons/Icon';
import { createClient } from '@/lib/supabase/client';
import { getCroppedImg } from '@/lib/utils/imageProcessing';
import OptimizedImage from './OptimizedImage';

const supabase = createClient();

interface Banner {
  id?: string;
  title?: string | null;
  image_url?: string;
  link?: string | null;
  is_active?: boolean;
  order_index?: number;
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  banner?: Banner | null;
}

export default function BannerModal({ isOpen, onClose, onSave, banner }: BannerModalProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [orderIndex, setOrderIndex] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  // Loading and error state
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with banner data
  useEffect(() => {
    if (isOpen) {
      if (banner) {
        setTitle(banner.title || '');
        setLink(banner.link || '');
        setIsActive(banner.is_active ?? true);
        setOrderIndex(banner.order_index || 0);
        setImagePreview(banner.image_url || null);
      } else {
        // Reset form for new banner
        setTitle('');
        setLink('');
        setIsActive(true);
        setOrderIndex(0);
        setImagePreview(null);
      }
      setError(null);
    }
  }, [isOpen, banner]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validações básicas
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

      if (file.size > maxSize) {
        setError('Arquivo muito grande. Máximo 10MB.');
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.');
        return;
      }

      setError(null);
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setOriginalImage(url);
      setIsCropping(true);
    }
  };

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleApplyCrop = async () => {
    if (!originalImage || !croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const { file, url } = await getCroppedImg(originalImage, croppedAreaPixels, rotation);
      setImageFile(new File([file], 'cropped-banner.jpg', { type: 'image/jpeg' }));
      setImagePreview(url);
      setIsCropping(false);
    } catch (err: any) {
      setError('Erro ao recortar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageFile(null);
    setImagePreview(null);
    setOriginalImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);
    let imageUrl = banner?.image_url || "";

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `banner-${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;
        
        // Converter File para ArrayBuffer (seguindo padrão da galeria)
        const fileBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(fileBuffer);
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, uint8Array, { 
            contentType: imageFile.type,
            cacheControl: '3600',
            upsert: true 
          });
        if (uploadError) {
          console.error('Erro no upload do banner:', uploadError);
          throw uploadError;
        }
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      // Lógica de posição automática (como nos vídeos)
      let finalOrderIndex = orderIndex;
      
      if (!banner?.id && (finalOrderIndex === 0 || finalOrderIndex === null || finalOrderIndex === undefined)) {
        // Buscar próxima posição disponível para novos banners
        const { data: maxOrderData } = await supabase
          .from('banners')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1);

        finalOrderIndex = maxOrderData && maxOrderData.length > 0 
          ? maxOrderData[0].order_index + 1 
          : 0;
      }

      // Usar APIs em vez de Supabase direto para evitar race condition
      if (banner?.id) {
        // Update via API
        const response = await fetch('/api/admin/banners', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: banner.id,
            title,
            image_url: imageUrl,
            link,
            is_active: isActive,
            order_index: finalOrderIndex
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Erro ao atualizar banner:', error);
          throw new Error(error.error || 'Erro ao atualizar banner');
        }
      } else {
        // Create via API - deixar a API determinar order_index
        const response = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            image_url: imageUrl,
            link,
            is_active: isActive,
            order_index: finalOrderIndex
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Erro ao criar banner:', error);
          throw new Error(error.error || 'Erro ao criar banner');
        }
        
        // A API retorna o banner criado com order_index correto
        const result = await response.json();
        console.log('Banner criado com sucesso:', result.data);
      }
      
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Erro detalhado ao salvar banner:', err);
      const errorMessage = err.message || 'Erro ao salvar banner';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div
        className="fixed inset-0 flex items-center justify-center animate-in fade-in duration-200 z-50"
        onClick={handleBackdropClick}
      >
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
          exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.15 } }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            maxWidth: 'calc(100vw - 32px)',
            margin: '16px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {banner?.id ? 'Editar Banner' : 'Novo Banner'}
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                icon="x"
                className="!p-2 !min-w-0"
              />
            </div>
          </div>
          
          {/* Body - Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <form id="banner-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do banner"
                  required
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (opcional)
                </label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://exemplo.com"
                  type="url"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                
                {isCropping && originalImage && (
                  <div className="mt-4 space-y-4">
                    <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                      <Cropper
                        image={originalImage}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={16/4}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Zoom:</label>
                        <input 
                          type="range" 
                          min={1} 
                          max={3} 
                          step={0.01} 
                          value={zoom} 
                          onChange={e => setZoom(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Rotação:</label>
                        <input 
                          type="range" 
                          min={0} 
                          max={360} 
                          step={1} 
                          value={rotation} 
                          onChange={e => setRotation(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancelCrop}
                        disabled={isUploading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleApplyCrop}
                        disabled={isUploading}
                      >
                        Aplicar Recorte
                      </Button>
                    </div>
                  </div>
                )}
                
                {imagePreview && !isCropping && (
                  <div className="mt-4 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <OptimizedImage 
                      src={imagePreview} 
                      alt="Preview" 
                      fill 
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={80}
                      fallbackText="Preview do banner"
                    />
                  </div>
                )}
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Ativo
                </label>
              </div>

              {/* Position (Order Index) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posição do Banner
                </label>
                <Input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  min="0"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe 0 para posição automática
                </p>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUploading}
              form="banner-form"
            >
              {isUploading ? 'Salvando...' : 'Salvar Banner'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}