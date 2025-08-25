// Componente para gerenciar documentos do setor

'use client';

import { useState } from 'react';

import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

import type { SectorDocument } from '../types/sector.types';

interface DocumentsManagementProps {
  sectorId: string;
  documents: SectorDocument[];
  showDrafts: boolean;
  totalDraftDocumentsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DocumentsManagement({
  sectorId,
  documents,
  showDrafts,
  totalDraftDocumentsCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: DocumentsManagementProps) {
  const { showError, showSuccess } = useAlert();
  const supabase = useSupabaseClient();
  const deleteModal = useDeleteModal('documento');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SectorDocument>>({
    title: '',
    description: '',
    is_published: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar tamanho do arquivo (limite de 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('Arquivo muito grande', 'O arquivo deve ter menos de 10MB.');
        return;
      }
      
      setDocumentFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!documentFile) return null;
    
    try {
      const fileExt = documentFile.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `sector-documents/${sectorId}/${timestamp}_${randomSuffix}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, documentFile, {
          cacheControl: '31536000',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      return {
        url: publicUrl,
        size: documentFile.size,
        type: documentFile.type
      };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId && !documentFile) {
      showError('Documento obrigatório', 'Selecione um arquivo para enviar.');
      return;
    }
    
    setUploading(true);
    
    try {
      let fileData = null;
      if (documentFile) {
        fileData = await uploadDocument();
      }
      
      const documentData: any = {
        sector_id: sectorId,
        title: formData.title,
        description: formData.description,
        is_published: formData.is_published
      };
      
      if (fileData) {
        documentData.file_url = fileData.url;
        documentData.file_size = fileData.size;
        documentData.file_type = fileData.type;
      }

      const url = '/api/admin/sector-content';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { type: 'sector_documents', id: editingId, data: documentData }
        : { type: 'sector_documents', data: documentData };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar documento');
      }

      showSuccess(editingId ? 'Documento atualizado' : 'Documento criado', 'O documento foi salvo com sucesso.');
      setShowForm(false);
      setFormData({ title: '', description: '', is_published: true });
      setDocumentFile(null);
      setEditingId(null);
      await onRefresh();
    } catch (error) {
      showError('Erro ao salvar documento', 'Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (document: SectorDocument) => {
    setFormData({
      title: document.title,
      description: document.description,
      is_published: document.is_published
    });
    setEditingId(document.id);
    setShowForm(true);
  };

  const handleDeleteClick = (document: SectorDocument) => {
    deleteModal.openDeleteModal(document, document.title);
  };

  const handleDelete = async (document: SectorDocument) => {
    try {
      await onDelete(document.id);
      showSuccess('Documento excluído', 'O documento foi removido com sucesso.');
    } catch (error) {
      showError('Erro ao excluir documento', 'Tente novamente.');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word') || fileType.includes('doc')) return '📘';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📗';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📙';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Documentos do Setor</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleDrafts}
            className="flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
          >
            <span>{showDrafts ? 'Ocultar Rascunhos' : 'Mostrar Rascunhos'}</span>
            <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded font-medium">
              {totalDraftDocumentsCount} {totalDraftDocumentsCount === 1 ? 'rascunho' : 'rascunhos'}
            </span>
          </button>
          <button
            onClick={() => {
              setFormData({ title: '', description: '', is_published: true });
              setDocumentFile(null);
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
          >
            Adicionar Documento
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
          <h4 className="text-lg font-medium mb-3">
            {editingId ? 'Editar Documento' : 'Novo Documento'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                placeholder="Breve descrição do documento"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo {!editingId && '*'}
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX até 10MB</p>
                    {documentFile && (
                      <p className="mt-2 text-sm text-gray-700">
                        Arquivo selecionado: {documentFile.name}
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {editingId && (
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para manter o arquivo atual
                </p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Publicar imediatamente
                </label>
                {!formData.is_published && (
                  <span className="text-xs text-yellow-600 ml-2">
                    (Será salvo como rascunho)
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setDocumentFile(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Enviando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
          <p className="text-gray-500">Nenhum documento cadastrado para este setor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <div key={document.id} className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getFileIcon(document.file_type)}</span>
                  <h3 className="text-lg font-medium flex-1 truncate">{document.title}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(document)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(document)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{document.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatFileSize(document.file_size)}</span>
                <span>{new Date(document.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Download →
                </a>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  document.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {document.is_published ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDelete)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}