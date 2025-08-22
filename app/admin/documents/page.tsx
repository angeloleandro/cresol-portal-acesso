'use client';

import { useState, useEffect, useCallback } from 'react';

// [DEBUG] Component tracking
let documentsPageRenderCount = 0;
const documentsPageInstanceId = `documents-page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { useAlert } from '@/app/components/alerts';
import { FormSelect } from '@/app/components/forms';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { Icon } from '@/app/components/icons/Icon';
import { StandardizedButton } from '@/app/components/admin';
import { DocumentForm } from './components/DocumentForm';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { useAdminAuth, useAdminData } from '@/app/admin/hooks';

// Tipos definidos inline seguindo padrão do news
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

interface DocumentStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  bySector: { [key: string]: number };
  byType: { sector: number; subsector: number };
}

interface Filters {
  search: string;
  type: 'all' | 'sector' | 'subsector';
  status: 'all' | 'published' | 'draft';
  featured: 'all' | 'featured' | 'not_featured';
  sector_id: string;
  subsector_id: string;
}

// File type constants
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

export default function DocumentsAdminPage() {
  // [DEBUG] Component render tracking
  documentsPageRenderCount++;
  console.log(`[DEBUG-COMPONENT] DocumentsAdminPage - Render ${documentsPageRenderCount}:`, {
    instanceId: documentsPageInstanceId,
    renderCount: documentsPageRenderCount,
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack?.split('\n').slice(1, 4)
  });

  const alert = useAlert();
  const { user, loading: authLoading } = useAdminAuth();
  const { 
    data: documents, 
    loading, 
    stats, 
    pagination, 
    filters, 
    updateFilters, 
    updatePagination, 
    reload 
  } = useAdminData<Document>({
    endpoint: 'documents',
    initialFilters: {
      search: '',
      type: 'all',
      status: 'all',
      featured: 'all',
      sector_id: '',
      subsector_id: ''
    },
    debounceMs: 500
  });
  
  const [sectors, setSectors] = useState<any[]>([]);
  const [subsectors, setSubsectors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);


  const loadInitialData = useCallback(async () => {
    try {
      // Carregar setores
      const { data: sectorsData } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');
      
      setSectors(sectorsData || []);

      // Carregar subsetores
      const { data: subsectorsData } = await supabase
        .from('subsectors')
        .select('id, name, sector_id, sectors(name)')
        .order('name');
      
      setSubsectors(subsectorsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  }, []);


  // Carregar dados iniciais (setores e subsetores)
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);
  

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
  };

  const handleSuccess = () => {
    reload(); // Recarregar a lista
  };

  const handleAction = async (action: string, document: Document) => {
    try {
      setActionLoading(`${action}-${document.id}`);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      const response = await fetch(
        `/api/admin/documents?id=${document.id}&type=${document.type}&action=${action}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert.showSuccess('Sucesso', data.message);
        reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(`Erro na ação ${action}:`, error);
      alert.showError('Erro', error.message || `Erro ao executar ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteModal = useDeleteModal('documento');

  const handleDelete = async (document: Document) => {
    try {
      setActionLoading(`delete-${document.id}`);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        setActionLoading('');
        return;
      }

      const response = await fetch(
        `/api/admin/documents?id=${document.id}&type=${document.type}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert.showSuccess('Sucesso', 'Documento excluído com sucesso');
        reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      alert.showError('Erro', error.message || 'Erro ao excluir documento');
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredSubsectors = () => {
    if (!filters.sector_id) return subsectors;
    return subsectors.filter(sub => sub.sector_id === filters.sector_id);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleDownload = (doc: Document) => {
    if (!doc.file_url) return;
    
    try {
      // Validate URL
      const url = new URL(doc.file_url);
      
      // Check for allowed protocols
      if (!['https:', 'http:'].includes(url.protocol)) {
        console.error('Invalid URL protocol:', url.protocol);
        return;
      }
      
      // Create a safe anchor element for download
      const link = window.document.createElement('a');
      link.href = doc.file_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } catch (error) {
      console.error('Invalid URL:', doc.file_url, error);
      // Optionally show user-friendly error
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Overlay para autenticação */}
      {!user && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <UnifiedLoadingSpinner fullScreen={true} size="large" message="Verificando permissões..." />
        </div>
      )}
      
      <AdminHeader user={user} />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Início', href: '/home', icon: 'house' },
            { label: 'Administração', href: '/admin' },
            { label: 'Documentos' }
          ]}
        />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-1 mb-2">Gerenciamento de Documentos</h1>
            <p className="body-text text-muted">
              Gerencie documentos de setores e subsetores de forma centralizada
            </p>
          </div>
          <StandardizedButton
            variant="primary"
            onClick={handleCreate}
            className="flex items-center space-x-2"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Novo Documento</span>
          </StandardizedButton>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Icon name="file" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Total</p>
                <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Icon name="check-circle" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Publicados</p>
                <p className="text-2xl font-bold text-green-600">{stats?.published || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <Icon name="edit" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Rascunhos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.drafts || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Icon name="star" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Em Destaque</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.featured || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Busca */}
            <div className="xl:col-span-2">
              <label className="label">Buscar</label>
              <input
                type="text"
                placeholder="Título ou descrição..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="input"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="label">Tipo</label>
              <FormSelect
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value as any, sector_id: '', subsector_id: '' })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'sector', label: 'Setor' },
                  { value: 'subsector', label: 'Subsetor' }
                ]}
                placeholder="Selecione o tipo"
              />
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <FormSelect
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value as any })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'published', label: 'Publicados' },
                  { value: 'draft', label: 'Rascunhos' }
                ]}
                placeholder="Selecione o status"
              />
            </div>

            {/* Destaque */}
            <div>
              <label className="label">Destaque</label>
              <FormSelect
                value={filters.featured}
                onChange={(e) => updateFilters({ featured: e.target.value as any })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'featured', label: 'Em destaque' },
                  { value: 'not_featured', label: 'Sem destaque' }
                ]}
                placeholder="Selecione o destaque"
              />
            </div>

            {/* Setor */}
            <div>
              <label className="label">Setor</label>
              <FormSelect
                value={filters.sector_id}
                onChange={(e) => updateFilters({ sector_id: e.target.value, subsector_id: '' })}
                options={[
                  { value: '', label: 'Todos os setores' },
                  ...sectors.map(sector => ({
                    value: sector.id,
                    label: sector.name
                  }))
                ]}
                placeholder="Selecione o setor"
              />
            </div>
          </div>

          {/* Subsetor */}
          {filters.sector_id && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
              <div className="md:col-start-6">
                <label className="label">Subsetor</label>
                <FormSelect
                  value={filters.subsector_id}
                  onChange={(e) => updateFilters({ subsector_id: e.target.value })}
                  options={[
                    { value: '', label: 'Todos os subsetores' },
                    ...getFilteredSubsectors().map(subsector => ({
                      value: subsector.id,
                      label: subsector.name
                    }))
                  ]}
                  placeholder="Selecione o subsetor"
                />
              </div>
            </div>
          )}
        </div>

        {/* Lista de documentos */}
        {loading ? (
          <div className="card p-12 text-center">
            <UnifiedLoadingSpinner size="large" message="Carregando documentos..." />
          </div>
        ) : documents.length === 0 ? (
          <div className="card p-12 text-center">
            <Icon name="file" className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="heading-3 mb-2">Nenhum documento encontrado</h3>
            <p className="body-text text-muted mb-6">
              Não há documentos que correspondam aos filtros aplicados.
            </p>
            <StandardizedButton variant="primary" onClick={handleCreate}>
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Criar primeiro documento
            </StandardizedButton>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {documents.map((document) => (
                <div key={document.id} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Ícone do tipo de arquivo */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon name="file" className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Tags e metadata */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`badge ${document.type === 'sector' ? 'badge-primary' : 'badge-secondary'}`}>
                              {document.type === 'sector' ? 'Setor' : 'Subsetor'}
                            </span>
                            
                            <span className="badge badge-outline">
                              {document.location_name}
                            </span>

                            {document.file_type && (
                              <span className="badge badge-info">
                                {getFileTypeLabel(document.file_type)}
                              </span>
                            )}

                            {document.file_size && (
                              <span className="badge badge-outline">
                                {formatFileSize(document.file_size)}
                              </span>
                            )}

                            {document.is_featured && (
                              <span className="badge badge-warning">
                                <Icon name="star" className="h-3 w-3 mr-1" />
                                Destaque
                              </span>
                            )}

                            <span className={`badge ${document.is_published ? 'badge-success' : 'badge-outline'}`}>
                              {document.is_published ? 'Publicado' : 'Rascunho'}
                            </span>
                          </div>

                          {/* Título e descrição */}
                          <h3 className="heading-3 mb-2">{document.title}</h3>
                          {document.description && (
                            <p className="body-text text-muted mb-4">
                              {truncateText(document.description, 200)}
                            </p>
                          )}

                          {/* Dados do documento */}
                          <div className="flex items-center space-x-4 text-sm text-muted">
                            <span>Criado em {formatDate(document.created_at)}</span>
                            {document.updated_at !== document.created_at && (
                              <span>• Editado em {formatDate(document.updated_at)}</span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <StandardizedButton
                            variant="secondary"
                            size="sm"
                            icon={<Icon name="download" className="h-4 w-4" />}
                            onClick={() => handleDownload(document)}
                          >
                            Download
                          </StandardizedButton>

                          <StandardizedButton
                            variant="secondary"
                            size="sm"
                            icon={<Icon name="edit" className="h-4 w-4" />}
                            onClick={() => handleEdit(document)}
                            disabled={actionLoading === `edit-${document.id}`}
                          >
                            Editar
                          </StandardizedButton>

                          <StandardizedButton
                            variant={document.is_published ? "warning" : "success"}
                            size="sm"
                            icon={<Icon name={document.is_published ? "eye-slash" : "eye"} className="h-4 w-4" />}
                            onClick={() => handleAction(document.is_published ? 'unpublish' : 'publish', document)}
                            disabled={actionLoading === `${document.is_published ? 'unpublish' : 'publish'}-${document.id}`}
                            loading={actionLoading === `${document.is_published ? 'unpublish' : 'publish'}-${document.id}`}
                          >
                            {document.is_published ? 'Despublicar' : 'Publicar'}
                          </StandardizedButton>

                          <StandardizedButton
                            variant={document.is_featured ? "warning" : "secondary"}
                            size="sm"
                            icon={<Icon name="star" className="h-4 w-4" />}
                            onClick={() => handleAction(document.is_featured ? 'unfeature' : 'feature', document)}
                            disabled={actionLoading === `${document.is_featured ? 'unfeature' : 'feature'}-${document.id}`}
                          >
                            {document.is_featured ? 'Remover destaque' : 'Destacar'}
                          </StandardizedButton>

                          <StandardizedButton
                            variant="secondary"
                            size="sm"
                            icon={<Icon name="copy" className="h-4 w-4" />}
                            onClick={() => handleAction('duplicate', document)}
                            disabled={actionLoading === `duplicate-${document.id}`}
                          >
                            Duplicar
                          </StandardizedButton>

                          <StandardizedButton
                            variant="danger"
                            size="sm"
                            icon={<Icon name="trash" className="h-4 w-4" />}
                            onClick={() => deleteModal.openDeleteModal(document, document.title)}
                            disabled={actionLoading === `delete-${document.id}`}
                          >
                            Excluir
                          </StandardizedButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="body-small text-muted">
                  Mostrando {documents.length} de {pagination.totalCount} documentos
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updatePagination({ currentPage: pagination.currentPage - 1 })}
                    disabled={pagination.currentPage === 1}
                    className="btn btn-ghost btn-sm"
                  >
                    <Icon name="chevron-left" className="h-4 w-4" />
                  </button>
                  
                  <span className="body-small">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => updatePagination({ currentPage: pagination.currentPage + 1 })}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn btn-ghost btn-sm"
                  >
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de documento */}
      <DocumentForm
        document={editingDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {/* Modal de exclusão */}
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