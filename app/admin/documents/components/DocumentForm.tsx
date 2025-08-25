'use client';

import React, { useState, useEffect } from 'react';

import { StandardizedButton } from '@/app/components/admin';
import { useAlert } from '@/app/components/alerts';
import { FormSelect } from '@/app/components/forms';
import { Icon } from '@/app/components/icons/Icon';
import { FILE_LIMITS } from '@/lib/constants/dimensions';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
// Tipos e constantes movidos para inline (seguindo padrão)
const FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT: 'text/plain',
  CSV: 'text/csv',
} as const;

const FILE_TYPE_LABELS = {
  [FILE_TYPES.PDF]: 'PDF',
  [FILE_TYPES.DOC]: 'Word',
  [FILE_TYPES.DOCX]: 'Word',
  [FILE_TYPES.XLS]: 'Excel',
  [FILE_TYPES.XLSX]: 'Excel',
  [FILE_TYPES.PPT]: 'PowerPoint',
  [FILE_TYPES.PPTX]: 'PowerPoint',
  [FILE_TYPES.TXT]: 'Texto',
  [FILE_TYPES.CSV]: 'CSV',
} as const;

const ALLOWED_FILE_TYPES = Object.values(FILE_TYPES);
const MAX_FILE_SIZE = FILE_LIMITS.document.maxSizeBytes;
const MAX_FILE_SIZE_LABEL = FILE_LIMITS.document.label;

// Helper functions
function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileTypeLabel(mimeType?: string): string {
  if (!mimeType) return 'Arquivo';
  return FILE_TYPE_LABELS[mimeType as keyof typeof FILE_TYPE_LABELS] || 'Arquivo';
}

interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
  sector_id?: string;
  subsector_id?: string;
}

interface DocumentFormProps {
  document?: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Sector {
  id: string;
  name: string;
}

interface Subsector {
  id: string;
  name: string;
  sector_id: string;
  sectors: { name: string } | null;
}

interface FormData {
  title: string;
  description: string;
  type: 'sector' | 'subsector';
  sector_id: string;
  subsector_id: string;
  file_url: string;
  file_type: string;
  file_size: number;
  is_featured: boolean;
  is_published: boolean;
}

/**
 * DocumentForm function
 * @todo Add proper documentation
 */
export function DocumentForm({ document, isOpen, onClose, onSuccess }: DocumentFormProps) {
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'sector',
    sector_id: '',
    subsector_id: '',
    file_url: '',
    file_type: '',
    file_size: 0,
    is_featured: false,
    is_published: false
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      
      if (document) {
        setFormData({
          title: document.title,
          description: document.description || '',
          type: document.type,
          sector_id: document.type === 'sector' ? 
            (document.sector_id || '') : '',
          subsector_id: document.type === 'subsector' ? 
            (document.subsector_id || '') : '',
          file_url: document.file_url,
          file_type: document.file_type || '',
          file_size: document.file_size || 0,
          is_featured: document.is_featured,
          is_published: document.is_published
        });
      } else {
        setFormData({
          title: '',
          description: '',
          type: 'sector',
          sector_id: '',
          subsector_id: '',
          file_url: '',
          file_type: '',
          file_size: 0,
          is_featured: false,
          is_published: false
        });
      }
      
      setDocumentFile(null);
    }
  }, [isOpen, document]);

  const loadInitialData = async () => {
    try {
      // Carregar setores
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');
      
      if (sectorsError) {
        throw sectorsError;
      }
      
      setSectors(sectorsData || []);

      // Carregar subsetores
      const { data: subsectorsData, error: subsectorsError } = await supabase
        .from('subsectors')
        .select('id, name, sector_id, sectors(name)')
        .order('name');
      
      if (subsectorsError) {
        throw subsectorsError;
      }
      
      setSubsectors((subsectorsData || []) as unknown as Subsector[]);
      
    } catch (error) {
      // Error loading subsectors - silent fail for now
    }
  };

  const getFilteredSubsectors = () => {
    if (!formData.sector_id) return subsectors;
    return subsectors.filter(sub => sub.sector_id === formData.sector_id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
        alert.showError('Arquivo inválido', 'Por favor, selecione um arquivo permitido (PDF, Word, Excel, PowerPoint, TXT, CSV)');
        return;
      }

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        alert.showError('Arquivo muito grande', `O arquivo deve ter no máximo ${MAX_FILE_SIZE_LABEL}`);
        return;
      }

      setDocumentFile(file);
      setFormData({ 
        ...formData, 
        file_type: file.type,
        file_size: file.size
      });
    }
  };

  const removeFile = () => {
    setDocumentFile(null);
    setFormData({ 
      ...formData, 
      file_url: '',
      file_type: '',
      file_size: 0
    });
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!documentFile) return formData.file_url || null;

    try {
      // Generate cryptographically unique identifier
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Extract and validate file extension
      const originalFileName = documentFile.name;
      const lastDotIndex = originalFileName.lastIndexOf('.');
      let extension = '';
      
      if (lastDotIndex > 0 && lastDotIndex < originalFileName.length - 1) {
        extension = originalFileName.substring(lastDotIndex + 1).toLowerCase();
        
        // Allowlist of safe extensions
        const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'csv'];
        
        if (!allowedExtensions.includes(extension)) {

          extension = 'bin';
        }
        
        // Remove any path traversal attempts
        extension = extension.replace(/[^a-z0-9]/gi, '');
      } else {
        extension = 'bin';
      }
      
      const fileName = `documents-${uniqueId}.${extension}`;
      const filePath = `uploads/${fileName}`;

      const { data: _uploadData, error } = await supabase.storage
        .from('images')
        .upload(filePath, documentFile, {
          upsert: false
        });

      if (error) {

        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      // Upload error - rethrow with generic message
      throw new Error('Erro ao fazer upload do arquivo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.title.trim()) {
      alert.showError('Campo obrigatório', 'Título é obrigatório');
      return;
    }
    
    if (formData.title.trim().length > 255) {
      alert.showError('Título muito longo', 'Título deve ter no máximo 255 caracteres');
      return;
    }

    if (formData.description.trim().length > 1000) {
      alert.showError('Descrição muito longa', 'Descrição deve ter no máximo 1.000 caracteres');
      return;
    }

    // Validar arquivo
    if (!document && !documentFile) {
      alert.showError('Campo obrigatório', 'Arquivo é obrigatório');
      return;
    }

    if (formData.type === 'sector' && !formData.sector_id) {
      alert.showError('Campo obrigatório', 'Setor é obrigatório para documentos de setor');
      return;
    }

    if (formData.type === 'subsector' && !formData.subsector_id) {
      alert.showError('Campo obrigatório', 'Subsetor é obrigatório para documentos de subsetor');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        alert.showError('Erro de autenticação', 'Erro ao verificar sessão');
        return;
      }
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      // Upload do arquivo se houver
      let finalFileUrl: string | null = formData.file_url;
      if (documentFile) {
        finalFileUrl = await uploadFile();
      }

      if (!finalFileUrl) {
        alert.showError('Erro', 'URL do arquivo é obrigatória');
        return;
      }

      // Preparar dados para envio
      const requestData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        file_url: finalFileUrl,
        file_type: formData.file_type,
        file_size: formData.file_size,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        ...(formData.type === 'sector' 
          ? { sector_id: formData.sector_id }
          : { subsector_id: formData.subsector_id }
        ),
      };

      const url = '/api/admin/documents';
      let method = 'POST';
      
      if (document) {
        // Editando documento existente
        method = 'PUT';
        requestData.id = document.id;
        requestData.type = document.type; // Manter tipo original
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: 'Erro desconhecido na API' };
        }

        throw new Error(errorData.error || 'Erro ao salvar documento');
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Erro ao processar resposta da API');
      }

      if (result.success) {
        alert.showSuccess(
          'Sucesso',
          document ? 'Documento atualizado com sucesso' : 'Documento criado com sucesso'
        );
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      alert.showError('Erro', error instanceof Error ? error.message : 'Erro ao salvar documento');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: 'sector' | 'subsector') => {
    setFormData({
      ...formData,
      type: newType,
      sector_id: '',
      subsector_id: ''
    });
  };

  const handleSectorChange = (sectorId: string) => {
    setFormData({
      ...formData,
      sector_id: sectorId,
      subsector_id: '' // Reset subsetor quando setor muda
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-2">
              {document ? 'Editar Documento' : 'Novo Documento'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Documento */}
            <div>
              <label className="label">Tipo de Documento</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="sector"
                    checked={formData.type === 'sector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'sector')}
                    disabled={loading || !!document} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Documento de Setor</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="subsector"
                    checked={formData.type === 'subsector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'subsector')}
                    disabled={loading || !!document} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Documento de Subsetor</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Setor */}
              <div>
                <label className="label">
                  Setor <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  value={formData.sector_id}
                  onChange={(e) => handleSectorChange(e.currentTarget.value)}
                  disabled={loading}
                  placeholder="Selecione um setor"
                  options={sectors.map(sector => ({
                    value: sector.id,
                    label: sector.name
                  }))}
                  required={formData.type === 'sector'}
                  fullWidth
                />
              </div>

              {/* Subsetor */}
              {formData.type === 'subsector' && (
                <div>
                  <label className="label">
                    Subsetor <span className="text-red-500">*</span>
                  </label>
                  <FormSelect
                    value={formData.subsector_id}
                    onChange={(e) => {
                      setFormData({ ...formData, subsector_id: e.currentTarget.value });
                    }}
                    disabled={loading || !formData.sector_id}
                    placeholder="Selecione um subsetor"
                    options={getFilteredSubsectors().map(subsector => ({
                      value: subsector.id,
                      label: subsector.name
                    }))}
                    required={formData.type === 'subsector'}
                    fullWidth
                  />
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="label">
                Título <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.title.length}/255)
                </span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
                className={`input ${
                  formData.title.length > 255 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Digite o título do documento..."
                required
                maxLength={255}
              />
              {formData.title.length > 255 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 255 caracteres</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="label">
                Descrição (Opcional)
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.description.length}/1000)
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={3}
                className={`input resize-y ${
                  formData.description.length > 1000 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Digite uma descrição do documento..."
                maxLength={1000}
              />
              {formData.description.length > 1000 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 1.000 caracteres</p>
              )}
            </div>

            {/* Arquivo */}
            <div>
              <label className="label">
                Arquivo <span className="text-red-500">*</span>
              </label>
              
              {formData.file_url || documentFile ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded">
                          <Icon name="file" className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {documentFile ? documentFile.name : (document?.title || 'Arquivo atual')}
                          </p>
                          {formData.file_type && (
                            <p className="text-xs text-gray-500">
                              {getFileTypeLabel(formData.file_type)}
                              {formData.file_size > 0 && ` • ${formatFileSize(formData.file_size)}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remover arquivo"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      accept={ALLOWED_FILE_TYPES.join(',')}
                      onChange={handleFileChange}
                      disabled={loading}
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Clique para alterar o arquivo (máximo {MAX_FILE_SIZE_LABEL})
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileChange}
                    disabled={loading}
                    className="input"
                    required={!document}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tipos permitidos: PDF, Word, Excel, PowerPoint, TXT, CSV (máximo {MAX_FILE_SIZE_LABEL})
                  </p>
                </div>
              )}
            </div>

            {/* Opções */}
            <div className="card p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Opções de Publicação</h3>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => {
                    setFormData({ ...formData, is_featured: e.target.checked });
                  }}
                  disabled={loading}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    Destacar documento
                  </span>
                  <p className="text-xs text-gray-500">
                    O documento aparecerá na seção de destaques
                  </p>
                </div>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => {
                    setFormData({ ...formData, is_published: e.target.checked });
                  }}
                  disabled={loading}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formData.is_published ? 'Publicar imediatamente' : 'Salvar como rascunho'}
                  </span>
                  <p className="text-xs text-gray-500">
                    {formData.is_published 
                      ? 'O documento ficará visível para os usuários imediatamente'
                      : 'O documento ficará salvo como rascunho e pode ser publicado depois'
                    }
                  </p>
                </div>
              </label>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <StandardizedButton
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </StandardizedButton>
              
              <StandardizedButton
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading 
                  ? 'Salvando...' 
                  : document 
                    ? 'Atualizar Documento' 
                    : 'Criar Documento'
                }
              </StandardizedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}