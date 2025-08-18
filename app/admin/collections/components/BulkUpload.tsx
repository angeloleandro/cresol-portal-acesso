'use client';

// Bulk Upload Component
// Upload múltiplo de arquivos com drag & drop e progress tracking - Portal Cresol

import { useState, useCallback, useRef, useEffect } from 'react';
import { Collection } from '@/lib/types/collections';
import CollectionLoading from '@/app/components/Collections/Collection.Loading';
import { cn } from '@/lib/utils/cn';
import Icon from '@/app/components/icons/Icon';
import { createClient } from '@/lib/supabase/client';
import VideoUploadAdvanced from './VideoUploadAdvanced';

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
  itemId?: string; // Database ID from upload response
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
  useEffect(() => {
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
      // Get current session for authentication
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Sessão não encontrada. Faça login novamente.');
      }

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
                    upload_type: response.upload_type || 'direct',
                  };

              updateFile(uploadFile.id, {
                status: 'completed',
                progress: 100,
                url: uploadFile.type === 'image' ? response.image_url : response.video_url,
                thumbnail_url: uploadFile.type === 'video' ? response.thumbnail_url : undefined,
                itemId: response.id, // Store the actual database ID
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
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              const errorMsg = errorResponse.error || 'Erro no upload';
              updateFile(uploadFile.id, {
                status: 'error',
                error: errorMsg,
              });
              reject(new Error(errorMsg));
            } catch {
              updateFile(uploadFile.id, {
                status: 'error',
                error: `Erro ${xhr.status}: ${xhr.statusText}`,
              });
              reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          updateFile(uploadFile.id, {
            status: 'error',
            error: 'Falha na conexão',
          });
          reject(new Error('Falha na conexão'));
        });

        // Set up request with authentication
        xhr.open('POST', endpoint);
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
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
      // Send requests directly to collection items API
      const supabase = createClient();
      const addPromises = completedFiles.map(async (file, index) => {
        const response = await fetch(`/api/collections/${collection.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            item_id: file.itemId, // Use the actual database ID from upload response
            item_type: file.type, // 'image' or 'video'
            order_index: index + 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao adicionar item à coleção');
        }

        return response.json();
      });

      await Promise.all(addPromises);
      
      // Close modal and trigger refresh
      onClose();
      
      // Optional: Call callback if provided (for backward compatibility)
      if (onFilesUploaded) {
        const items = completedFiles.map(file => ({
          type: file.type,
          data: {
            item_id: file.itemId,
            title: file.name.replace(/\.[^/.]+$/, ''),
            ...(file.type === 'image' 
              ? { image_url: file.url }
              : { 
                  video_url: file.url,
                  thumbnail_url: file.thumbnail_url,
                  upload_type: 'direct' 
                }
            )
          }
        }));
        
        await onFilesUploaded(items);
      }
      
    } catch (error: any) {
      // Keep modal open to allow retry
      updateFile(completedFiles[0]?.id, {
        status: 'error',
        error: error.message || 'Erro ao adicionar à coleção',
      });
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
      <div className="fixed inset-0 bg-gray-900/50 transition-opacity" />
      
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
            <div className="bg-info-50 border border-info-200 rounded-md p-3 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-info-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-info-800">
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

            {/* Advanced Video Upload Section */}
            {(collection.type === 'videos' || collection.type === 'mixed') && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">Upload de Vídeos YouTube</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Para vídeos do YouTube com geração de thumbnail personalizada
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="bg-white px-2 py-1 rounded border border-gray-200">YouTube</span>
                      <span className="bg-white px-2 py-1 rounded border border-gray-200">Thumbnail personalizada</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <VideoUploadAdvanced
                      collection={collection}
                      onVideoAdded={(videoData) => {
                        // Opcional: callback para atualizar lista local
                        console.log('Vídeo adicionado via upload avançado:', videoData);
                        // Aqui poderia atualizar o estado local se necessário
                        onClose(); // Fechar modal após sucesso
                      }}
                      buttonText="YouTube"
                      className="shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Separator */}
            {(collection.type === 'videos' || collection.type === 'mixed') && (
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-600">ou faça upload direto de arquivos</span>
                </div>
              </div>
            )}

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
                <div className="text-gray-500">
                  {isDragOver ? (
                    <Icon name="arrow-down" className="w-12 h-12" />
                  ) : (
                    <Icon name="folder" className="w-12 h-12" />
                  )}
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui'}
                  </h4>
                  <p className="text-gray-700 mb-4">
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
                    <div className="text-2xl font-bold text-info">{files.filter(f => f.status === 'pending').length}</div>
                    <div className="text-xs text-gray-600">Pendentes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{uploadStats.completed}</div>
                    <div className="text-xs text-gray-600">Concluídos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-error">{uploadStats.failed}</div>
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
                    className="text-error hover:text-error-700 text-sm font-medium disabled:opacity-50"
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
                        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-gray-600">
                          {file.type === 'image' ? (
                            <Icon name="image" className="w-6 h-6" />
                          ) : (
                            <Icon name="video" className="w-6 h-6" />
                          )}
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
                            file.status === 'completed' && 'text-success',
                            file.status === 'error' && 'text-error',
                            file.status === 'uploading' && 'text-info',
                            file.status === 'processing' && 'text-warning'
                          )}>
                            {file.status === 'pending' && 'Pendente'}
                            {file.status === 'uploading' && 'Enviando...'}
                            {file.status === 'processing' && 'Processando...'}
                            {file.status === 'completed' && 'Concluído'}
                            {file.status === 'error' && 'Erro'}
                          </span>
                        </div>
                        
                        {file.error && (
                          <p className="text-xs text-error mt-1">{file.error}</p>
                        )}
                      </div>

                      {/* Progress/Actions */}
                      <div className="flex-shrink-0">
                        {file.status === 'pending' && (
                          <button
                            onClick={() => removeFile(file.id)}
                            disabled={isUploading}
                            className="text-error hover:text-error-700 p-1 disabled:opacity-50"
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
                          <div className="text-success">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        
                        {file.status === 'error' && (
                          <div className="text-error">
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
            <div className="text-sm text-gray-700">
              {files.length > 0 && `${files.length} arquivo${files.length !== 1 ? 's' : ''} selecionado${files.length !== 1 ? 's' : ''}`}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadStats.completed > 0 ? 'Fechar' : 'Cancelar'}
              </button>
              
              {files.some(f => f.status === 'pending') && !isUploading && (
                <button
                  onClick={startUpload}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Iniciar Upload
                </button>
              )}
              
              {uploadStats.completed > 0 && !isUploading && (
                <button
                  onClick={addToCollection}
                  className="px-4 py-2 text-sm font-medium text-white bg-success hover:bg-success-600 rounded-md focus:ring-2 focus:ring-success focus:ring-offset-2 transition-colors"
                >
                  Adicionar à Coleção ({uploadStats.completed})
                </button>
              )}
              
              {isUploading && (
                <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
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