'use client';

// Bulk Upload Component
// Upload múltiplo de arquivos com drag & drop e progress tracking - Portal Cresol

import React, { useState, useRef, useCallback } from 'react';
import { Collection } from '@/lib/types/collections';
import CollectionLoading from '@/app/components/Collections/Collection.Loading';
import { cn } from '@/lib/utils/collections';

// Supported file types
const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Utility functions moved outside component for stability
const getFileType = (file: File): 'image' | 'video' | null => {
  if (imageTypes.includes(file.type)) return 'image';
  if (videoTypes.includes(file.type)) return 'video';
  return null;
};

const validateFile = (file: File, collectionType: string): string | null => {
  const fileType = getFileType(file);
  
  if (!fileType) {
    return 'Tipo de arquivo não suportado';
  }

  // Check collection type restrictions
  if (collectionType === 'images' && fileType !== 'image') {
    return 'Esta coleção aceita apenas imagens';
  }
  
  if (collectionType === 'videos' && fileType !== 'video') {
    return 'Esta coleção aceita apenas vídeos';
  }

  // Check file size
  const maxSize = fileType === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `Arquivo muito grande. Máximo ${maxSizeMB}MB para ${fileType === 'image' ? 'imagens' : 'vídeos'}`;
  }

  return null;
};

interface UploadFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: 'image' | 'video';
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  url?: string;
  thumbnail_url?: string;
}

interface BulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  onFilesUploaded: (files: { type: 'image' | 'video'; data: any }[]) => Promise<void>;
}

const BulkUpload: React.FC<BulkUploadProps> = ({
  isOpen,
  onClose,
  collection,
  onFilesUploaded,
}) => {
  // State management
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    completed: 0,
    failed: 0,
    total: 0,
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // All supported file types for input accept attribute
  const allSupportedTypes = [...imageTypes, ...videoTypes];

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setIsUploading(false);
      setUploadStats({ completed: 0, failed: 0, total: 0 });
      setIsDragOver(false);
      dragCounterRef.current = 0;
    }
  }, [isOpen]);

  // Generate unique file ID
  const generateFileId = () => Math.random().toString(36).substring(2, 15);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add files to upload queue
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadFile[] = [];
    
    newFiles.forEach(file => {
      const error = validateFile(file, collection.type);
      const fileType = getFileType(file);
      
      if (!error && fileType) {
        validFiles.push({
          file,
          id: generateFileId(),
          name: file.name,
          size: file.size,
          type: fileType,
          status: 'pending',
          progress: 0,
        });
      }
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setUploadStats(prev => ({ ...prev, total: prev.total + validFiles.length }));
    }
  }, [collection.type]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  // Remove file from queue
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      const removedFile = prev.find(f => f.id === fileId);
      
      if (removedFile && removedFile.status === 'pending') {
        setUploadStats(prevStats => ({ ...prevStats, total: prevStats.total - 1 }));
      }
      
      return newFiles;
    });
  };

  // Update file status
  const updateFile = (fileId: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  // Upload single file
  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    updateFile(uploadFile.id, { status: 'uploading', progress: 0 });

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', uploadFile.file);

      // Determine upload endpoint based on file type
      const endpoint = uploadFile.type === 'image' 
        ? '/api/admin/gallery/upload'
        : '/api/admin/videos/upload';

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 80); // 80% for upload
            updateFile(uploadFile.id, { progress });
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              updateFile(uploadFile.id, { status: 'processing', progress: 90 });
              
              const response = JSON.parse(xhr.responseText);
              
              // Extract relevant data based on file type
              const fileData = uploadFile.type === 'image' 
                ? {
                    item_id: response.id,
                    title: uploadFile.name.replace(/\.[^/.]+$/, ''), // Remove extension
                    image_url: response.image_url,
                    description: '',
                  }
                : {
                    item_id: response.id,
                    title: response.title || uploadFile.name.replace(/\.[^/.]+$/, ''),
                    video_url: response.video_url,
                    thumbnail_url: response.thumbnail_url,
                    upload_type: response.upload_type || 'file',
                  };

              updateFile(uploadFile.id, {
                status: 'completed',
                progress: 100,
                url: uploadFile.type === 'image' ? response.image_url : response.video_url,
                thumbnail_url: uploadFile.type === 'video' ? response.thumbnail_url : undefined,
              });

              resolve();
            } catch (error) {
              updateFile(uploadFile.id, {
                status: 'error',
                error: 'Erro ao processar resposta do servidor',
              });
              reject(error);
            }
          } else {
            const errorMsg = xhr.responseText ? JSON.parse(xhr.responseText).error : 'Erro no upload';
            updateFile(uploadFile.id, {
              status: 'error',
              error: errorMsg,
            });
            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener('error', () => {
          updateFile(uploadFile.id, {
            status: 'error',
            error: 'Falha na conexão',
          });
          reject(new Error('Falha na conexão'));
        });

        xhr.open('POST', endpoint);
        xhr.send(formData);
      });

    } catch (error: any) {
      updateFile(uploadFile.id, {
        status: 'error',
        error: error.message || 'Erro desconhecido',
      });
      throw error;
    }
  };

  // Start bulk upload
  const startUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadStats(prev => ({ ...prev, completed: 0, failed: 0 }));

    // Upload files in batches of 3 for better performance
    const batchSize = 3;
    const batches = [];
    
    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      batches.push(pendingFiles.slice(i, i + batchSize));
    }

    try {
      for (const batch of batches) {
        await Promise.allSettled(
          batch.map(async (file) => {
            try {
              await uploadFile(file);
              setUploadStats(prev => ({ ...prev, completed: prev.completed + 1 }));
            } catch (error) {
              setUploadStats(prev => ({ ...prev, failed: prev.failed + 1 }));
            }
          })
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Add completed files to collection
  const addToCollection = async () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    
    if (completedFiles.length === 0) {
      return;
    }

    try {
      const items = completedFiles.map(file => ({
        type: file.type,
        data: file.type === 'image' 
          ? {
              item_id: file.id,
              title: file.name.replace(/\.[^/.]+$/, ''),
              image_url: file.url,
              description: '',
            }
          : {
              item_id: file.id,
              title: file.name.replace(/\.[^/.]+$/, ''),
              video_url: file.url,
              thumbnail_url: file.thumbnail_url,
              upload_type: 'file',
            }
      }));

      await onFilesUploaded(items);
      onClose();
      
    } catch (error: any) {
      console.error('Error adding files to collection:', error);
      // Keep modal open to allow retry
    }
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    setUploadStats({ completed: 0, failed: 0, total: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Múltiplo de Arquivos
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Faça upload de múltiplos arquivos para a coleção &quot;{collection.name}&quot;
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isUploading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            
            {/* File Type Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Tipos de arquivo aceitos nesta coleção:</p>
                  <div className="mt-1">
                    {collection.type === 'mixed' && (
                      <p>• <strong>Imagens:</strong> JPG, PNG, WebP, GIF (máx. 10MB)</p>
                    )}
                    {collection.type === 'images' && (
                      <p>• <strong>Imagens:</strong> JPG, PNG, WebP, GIF (máx. 10MB)</p>
                    )}
                    {collection.type === 'mixed' && (
                      <p>• <strong>Vídeos:</strong> MP4, WebM, MOV, AVI (máx. 100MB)</p>
                    )}
                    {collection.type === 'videos' && (
                      <p>• <strong>Vídeos:</strong> MP4, WebM, MOV, AVI (máx. 100MB)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="text-4xl">
                  {isDragOver ? '⬇️' : '📁'}
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui'}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    ou clique no botão abaixo para selecionar arquivos
                  </p>
                </div>

                <div className="flex justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={allSupportedTypes.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selecionar Arquivos
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Stats */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Progresso do Upload</h4>
                  <div className="text-sm text-gray-600">
                    {uploadStats.completed + uploadStats.failed} de {uploadStats.total}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{files.filter(f => f.status === 'pending').length}</div>
                    <div className="text-xs text-gray-600">Pendentes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{uploadStats.completed}</div>
                    <div className="text-xs text-gray-600">Concluídos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{uploadStats.failed}</div>
                    <div className="text-xs text-gray-600">Falharam</div>
                  </div>
                </div>
              </div>
            )}

            {/* Files List */}
            {files.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Arquivos ({files.length})
                  </h4>
                  <button
                    onClick={clearFiles}
                    disabled={isUploading}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    Limpar Todos
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          {file.type === 'image' ? '🖼️' : '🎥'}
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span className="capitalize">{file.type}</span>
                          <span>•</span>
                          <span className={cn(
                            "font-medium",
                            file.status === 'completed' && 'text-green-600',
                            file.status === 'error' && 'text-red-600',
                            file.status === 'uploading' && 'text-blue-600',
                            file.status === 'processing' && 'text-yellow-600'
                          )}>
                            {file.status === 'pending' && 'Pendente'}
                            {file.status === 'uploading' && 'Enviando...'}
                            {file.status === 'processing' && 'Processando...'}
                            {file.status === 'completed' && 'Concluído'}
                            {file.status === 'error' && 'Erro'}
                          </span>
                        </div>
                        
                        {file.error && (
                          <p className="text-xs text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>

                      {/* Progress/Actions */}
                      <div className="flex-shrink-0">
                        {file.status === 'pending' && (
                          <button
                            onClick={() => removeFile(file.id)}
                            disabled={isUploading}
                            className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        
                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <div className="w-16">
                            <CollectionLoading.Progress
                              progress={file.progress}
                              className="h-2"
                            />
                          </div>
                        )}
                        
                        {file.status === 'completed' && (
                          <div className="text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        
                        {file.status === 'error' && (
                          <div className="text-red-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {files.length > 0 && `${files.length} arquivo${files.length !== 1 ? 's' : ''} selecionado${files.length !== 1 ? 's' : ''}`}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadStats.completed > 0 ? 'Fechar' : 'Cancelar'}
              </button>
              
              {files.some(f => f.status === 'pending') && !isUploading && (
                <button
                  onClick={startUpload}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Iniciar Upload
                </button>
              )}
              
              {uploadStats.completed > 0 && !isUploading && (
                <button
                  onClick={addToCollection}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Adicionar à Coleção ({uploadStats.completed})
                </button>
              )}
              
              {isUploading && (
                <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Fazendo Upload...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;