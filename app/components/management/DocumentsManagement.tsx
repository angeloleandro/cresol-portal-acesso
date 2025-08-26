// Componente genérico de gerenciamento de documentos
// Unifica sector/subsector documents management com parâmetros configuráveis

import React, { useState, useMemo } from 'react';

import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import { ChakraSelect, ChakraSelectOption } from '@/app/components/forms';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useModal } from '@/hooks/useModal';
import { FormatDate, FormatFileSize } from '@/lib/utils/formatters';
import { UPLOAD_LIMITS } from '@/lib/constants/limits';
import { FILE_TYPES, ALLOWED_FILE_TYPES } from '@/lib/constants/files';

// Generic document item interface
export interface BaseDocument {
  id: string;
  title: string;
  description?: string | null;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

// Configuration interface for different contexts
export interface DocumentConfig {
  entityType: 'sector' | 'subsector';
  apiEndpoint: string;
  entityIdField: string;
  useAlerts: boolean;
  requestStructure: 'admin' | 'subsector';
}

interface DocumentsManagementProps<T extends BaseDocument> {
  entityId: string;
  documents: T[];
  showDrafts: boolean;
  totalDraftDocumentsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  config: DocumentConfig;
}

export function DocumentsManagement<T extends BaseDocument>({
  entityId,
  documents,
  showDrafts,
  totalDraftDocumentsCount,
  onToggleDrafts,
  onRefresh,
  onDelete,
  config
}: DocumentsManagementProps<T>) {
  
  const modal = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Partial<T>>({
    title: '',
    description: '',
    file_url: '',
    file_type: '',
    file_size: null,
    is_featured: false,
    is_published: true
  } as Partial<T>);

  const [inputType, setInputType] = useState<'url' | 'upload'>('url');
  const { showError } = useAlert();
  
  // Use custom file upload hook
  const {
    file: documentFile,
    isUploading,
    handleFileChange,
    removeFile,
    uploadFile,
    validateFile
  } = useFileUpload({
    maxSize: UPLOAD_LIMITS.IMAGE.MAX_SIZE,
    allowedTypes: ALLOWED_FILE_TYPES,
    bucket: 'images',
    folder: 'uploads'
  });

  const deleteModal = useDeleteModal('documento');

  // File type options para o ChakraSelect
  const fileTypeOptions = useMemo((): ChakraSelectOption[] => [
    { value: '', label: 'Selecione o tipo' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'xls', label: 'XLS' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'ppt', label: 'PPT' },
    { value: 'pptx', label: 'PPTX' },
    { value: 'txt', label: 'TXT' },
    { value: 'zip', label: 'ZIP' },
    { value: 'rar', label: 'RAR' }
  ], []);

  const handleOpenModal = (documentItem?: T) => {
    if (documentItem) {
      setCurrentDocument(documentItem);
      setIsEditing(true);
      setInputType('url');
    } else {
      setCurrentDocument({
        title: '',
        description: '',
        file_url: '',
        file_type: '',
        file_size: null,
        is_featured: false,
        is_published: true
      } as Partial<T>);
      setIsEditing(false);
      setInputType('url');
    }
    removeFile();
    modal.open();
  };

  const handleCloseModal = () => {
    modal.close();
    setCurrentDocument({
      title: '',
      description: '',
      file_url: '',
      file_type: '',
      file_size: null,
      is_featured: false,
      is_published: true
    } as Partial<T>);
    removeFile();
    setInputType('url');
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaveError(null);

    // Validação
    const validationErrors: string[] = [];
    
    if (!currentDocument.title?.trim()) {
      validationErrors.push('Título é obrigatório');
    } else if (currentDocument.title.length < 3) {
      validationErrors.push('Título deve ter pelo menos 3 caracteres');
    } else if (currentDocument.title.length > 255) {
      validationErrors.push('Título deve ter no máximo 255 caracteres');
    }
    
    if (inputType === 'url') {
      if (!currentDocument.file_url?.trim()) {
        validationErrors.push('URL do arquivo é obrigatória');
      }
    } else {
      if (!isEditing && !documentFile) {
        validationErrors.push('Arquivo é obrigatório');
      }
    }
    
    if (currentDocument.description && currentDocument.description.length > 1000) {
      validationErrors.push('Descrição deve ter no máximo 1.000 caracteres');
    }
    
    if (validationErrors.length > 0) {
      setSaveError('Erros de validação:\n\n' + validationErrors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      // Upload file if needed
      let finalFileUrl: string | null = currentDocument.file_url || null;
      if (inputType === 'upload' && documentFile) {
        const uploadResult = await uploadFile();
        if (uploadResult) {
          finalFileUrl = uploadResult;
        }
      }

      if (!finalFileUrl) {
        setSaveError('URL do arquivo é obrigatória');
        return;
      }

      const method = isEditing ? 'PUT' : 'POST';
      
      const requestData = {
        type: 'documents',
        [config.entityIdField]: entityId,
        data: {
          ...currentDocument,
          [`${config.entityType}_id`]: entityId,
          title: currentDocument.title?.trim(),
          description: currentDocument.description?.trim() || null,
          file_url: finalFileUrl,
          file_size: documentFile?.size || currentDocument.file_size
        }
      };
      
      const response = await fetch(config.apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = 'Erro ao salvar documento';
        
        if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }
        
        throw new Error(errorMessage);
      }
      
      handleCloseModal();
      await onRefresh();
      
    } catch (error: any) {
      const userMessage = error.message.includes('fetch')
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro desconhecido ao salvar documento. Tente novamente.';
        
      setSaveError(userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (documentItem: T) => {
    deleteModal.openDeleteModal(documentItem, documentItem.title);
  };

  const handleDeleteDocument = async (documentItem: T) => {
    try {
      await onDelete(documentItem.id);
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  };

  const handleFileChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      handleFileChange(e);
      setCurrentDocument(prev => ({ 
        ...prev, 
        file_type: file.type,
        file_size: file.size
      }));
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Documentos</h2>
          <ToggleDraftsButton
            showDrafts={showDrafts}
            onToggle={onToggleDrafts}
            draftCount={totalDraftDocumentsCount}
            type="documents"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Novo Documento
        </button>
      </div>

      {/* Lista de documentos */}
      <div className="grid gap-4">
        {documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts 
                ? 'Nenhum rascunho de documento encontrado'
                : 'Nenhum documento publicado ainda'
              }
            </p>
          </div>
        ) : (
          documents.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    {item.is_featured && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Destaque
                      </span>
                    )}
                    {!item.is_published && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Rascunho
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{FormatDate(item.created_at)}</span>
                    {item.file_type && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {item.file_type.toUpperCase()}
                      </span>
                    )}
                    {item.file_size && (
                      <span>{FormatFileSize(item.file_size)}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Baixar
                  </a>
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação/edição */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? 'Editar Documento' : 'Novo Documento'}
              </h2>
              
              {/* Error display */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-800 whitespace-pre-line">{saveError}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={() => setSaveError(null)}
                        className="inline-flex text-red-400 hover:text-red-600"
                      >
                        <span className="sr-only">Fechar</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSaveDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentDocument.title?.length || 0}/255)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={currentDocument.title || ''}
                    onChange={(e) => setCurrentDocument({ ...currentDocument, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Digite o título do documento..."
                    maxLength={255}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentDocument.description?.length || 0}/1000)
                    </span>
                  </label>
                  <textarea
                    value={currentDocument.description || ''}
                    onChange={(e) => setCurrentDocument({ ...currentDocument, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Digite uma descrição para o documento (opcional)..."
                    maxLength={1000}
                  />
                </div>

                {/* Tipo de Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="inputType"
                        value="url"
                        checked={inputType === 'url'}
                        onChange={(e) => setInputType(e.target.value as 'url')}
                        className="mr-2"
                        disabled={isSaving}
                      />
                      <span>Link do Google Drive</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="inputType"
                        value="upload"
                        checked={inputType === 'upload'}
                        onChange={(e) => setInputType(e.target.value as 'upload')}
                        className="mr-2"
                        disabled={isSaving}
                      />
                      <span>Upload de Arquivo</span>
                    </label>
                  </div>
                </div>

                {/* Campo de Arquivo Condicional */}
                {inputType === 'url' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link do Google Drive <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={currentDocument.file_url || ''}
                      onChange={(e) => setCurrentDocument({ ...currentDocument, file_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="https://drive.google.com/file/d/..."
                      required
                      disabled={isSaving}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arquivo <span className="text-red-500">*</span>
                    </label>
                    
                    {documentFile ? (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white rounded">
                                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{documentFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {FormatFileSize(documentFile.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remover arquivo"
                              disabled={isSaving}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept={ALLOWED_FILE_TYPES.join(',')}
                          onChange={handleFileChangeWrapper}
                          disabled={isSaving}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          required={!isEditing}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tipos permitidos: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR (máximo {UPLOAD_LIMITS.IMAGE.MAX_SIZE_TEXT})
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <ChakraSelect
                    label="Tipo do Arquivo"
                    options={fileTypeOptions}
                    value={currentDocument.file_type || ''}
                    onChange={(value) => setCurrentDocument({ ...currentDocument, file_type: value as string })}
                    placeholder="Selecione o tipo"
                    size="md"
                    variant="outline"
                    fullWidth
                  />
                </div>

                <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Opções de Publicação</h3>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentDocument.is_featured || false}
                      onChange={(e) => setCurrentDocument({ ...currentDocument, is_featured: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destacar documento</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentDocument.is_published !== false}
                      onChange={(e) => setCurrentDocument({ ...currentDocument, is_published: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {currentDocument.is_published !== false ? 'Publicar imediatamente' : 'Salvar como rascunho'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {(isSaving || isUploading) ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>{isUploading ? 'Enviando arquivo...' : 'Salvando...'}</span>
                      </>
                    ) : (
                      <span>Salvar</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteDocument)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}