'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';

import Breadcrumb from '@/app/components/Breadcrumb';
import Footer from '@/app/components/Footer';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
// Helper functions movidas para inline
function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

const FILE_TYPE_LABELS = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-powerpoint': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'text/plain': 'Texto',
  'text/csv': 'CSV',
} as const;

function getFileTypeLabel(mimeType?: string): string {
  if (!mimeType) return 'Arquivo';
  return FILE_TYPE_LABELS[mimeType as keyof typeof FILE_TYPE_LABELS] || 'Arquivo';
}
import Icon from '../../components/icons/Icon';

import { FormatDate } from '@/lib/utils/formatters';
interface DocumentDetail {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  sector_id?: string;
  subsector_id?: string;
  sectors?: { id: string; name: string };
  subsectors?: { id: string; name: string; sectors?: { id: string; name: string } };
  type: 'sector' | 'subsector';
}

interface RelatedDocument {
  id: string;
  title: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

function DocumentDetailPageContent({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<RelatedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      if (!user) return;

      try {
        // Tentar buscar em sector_documents
        const { data: sectorDoc, error: sectorError } = await supabase
          .from('sector_documents')
          .select(`
            *,
            sectors:sector_id (id, name)
          `)
          .eq('id', params.id)
          .eq('is_published', true)
          .single();

        let documentData: DocumentDetail | null = null;
        let relatedData: RelatedDocument[] = [];

        if (sectorDoc && !sectorError) {
          documentData = { ...sectorDoc, type: 'sector' as const };
          
          // Buscar documentos relacionados do mesmo setor
          const { data: related } = await supabase
            .from('sector_documents')
            .select('id, title, file_type, file_size, created_at')
            .eq('sector_id', sectorDoc.sector_id)
            .eq('is_published', true)
            .neq('id', params.id)
            .limit(5)
            .order('created_at', { ascending: false });
          
          relatedData = related || [];
        } else {
          // Tentar buscar em subsector_documents
          const { data: subsectorDoc, error: subsectorError } = await supabase
            .from('subsector_documents')
            .select(`
              *,
              subsectors:subsector_id (id, name, sectors!inner(id, name))
            `)
            .eq('id', params.id)
            .eq('is_published', true)
            .single();

          if (subsectorDoc && !subsectorError) {
            documentData = { ...subsectorDoc, type: 'subsector' as const };
            
            // Buscar documentos relacionados do mesmo subsetor
            const { data: related } = await supabase
              .from('subsector_documents')
              .select('id, title, file_type, file_size, created_at')
              .eq('subsector_id', subsectorDoc.subsector_id)
              .eq('is_published', true)
              .neq('id', params.id)
              .limit(5)
              .order('created_at', { ascending: false });
            
            relatedData = related || [];
          }
        }

        if (documentData) {
          setDocument(documentData);
          setRelatedDocuments(relatedData);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [params.id, user]);

  // Formatador de data

  // Função para baixar documento
  const handleDownload = () => {
    if (document?.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  // Função para verificar se é PDF
  const isPDF = document?.file_type === 'application/pdf';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <UnifiedLoadingSpinner 
            size="default" 
            message={LOADING_MESSAGES.loading}
          />
        </div>
      </div>
    );
  }

  if (notFound || !document) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icon name="file-text" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Documento não encontrado
          </h3>
          <p className="mt-2 text-gray-500">
            O documento que você está procurando não existe ou não está mais disponível.
          </p>
          <Link
            href="/documentos"
            className="mt-4 inline-flex items-center rounded-md bg-cresol-green px-4 py-2 text-sm font-medium text-white hover:bg-cresol-green/90"
          >
            <Icon name="arrow-left" className="mr-2 h-4 w-4" />
            Voltar aos Documentos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/home', icon: 'house' },
          { label: 'Documentos', href: '/documentos' },
          { label: document.title }
        ]} 
      />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navegação */}
        <div className="mb-6">
          <Link
            href="/documentos"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <Icon name="arrow-left" className="mr-2 h-4 w-4" />
            Voltar aos Documentos
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              {/* Header */}
              <div className="mb-6">
                <div className="mb-4 flex items-start justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {document.title}
                  </h1>
                  {document.is_featured && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                      Destaque
                    </span>
                  )}
                </div>
                
                {/* Metadados */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Icon name="calendar" className="mr-1 h-4 w-4" />
                    {FormatDate(document.created_at)}
                  </div>
                  <div className="flex items-center">
                    {document.type === 'sector' ? (
                      <>
                        <Icon name="building-1" className="mr-1 h-4 w-4" />
                        {document.sectors?.name}
                      </>
                    ) : (
                      <>
                        <Icon name="folder" className="mr-1 h-4 w-4" />
                        {document.subsectors?.sectors?.name} - {document.subsectors?.name}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {document.description && (
                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">
                    Descrição
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {document.description}
                  </p>
                </div>
              )}

              {/* Informações do Arquivo */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-medium text-gray-900">
                  Informações do Arquivo
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Tipo:</dt>
                    <dd className="font-medium text-gray-900">
                      {getFileTypeLabel(document.file_type)}
                    </dd>
                  </div>
                  {document.file_size && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tamanho:</dt>
                      <dd className="font-medium text-gray-900">
                        {formatFileSize(document.file_size)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Última atualização:</dt>
                    <dd className="font-medium text-gray-900">
                      {FormatDate(document.updated_at)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="flex flex-1 items-center justify-center rounded-md bg-cresol-green px-6 py-3 text-sm font-medium text-white hover:bg-cresol-green/90 focus:outline-none focus:ring-2 focus:ring-cresol-green focus:ring-offset-2"
                >
                  <Icon name="download" className="mr-2 h-5 w-5" />
                  Baixar Documento
                </button>
                <button
                  onClick={() => window.open(document.file_url, '_blank')}
                  className="flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cresol-green focus:ring-offset-2"
                >
                  <Icon name="external-link" className="mr-2 h-5 w-5" />
                  Abrir em Nova Aba
                </button>
              </div>

              {/* Preview de PDF */}
              {isPDF && (
                <div className="mt-8">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Visualização do Documento
                  </h2>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <iframe
                      src={`${document.file_url}#toolbar=0`}
                      className="h-[600px] w-full"
                      title={document.title}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Lateral */}
          <div className="lg:col-span-1">
            {/* Documentos Relacionados */}
            {relatedDocuments.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Documentos Relacionados
                </h2>
                <div className="space-y-3">
                  {relatedDocuments.map((related) => (
                    <Link
                      key={related.id}
                      href={`/documentos/${related.id}`}
                      className="block rounded-lg border border-gray-200 p-3 hover:border-cresol-green transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {related.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <span>{getFileTypeLabel(related.file_type)}</span>
                            {related.file_size && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(related.file_size)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Icon name="file-text" className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-6 rounded-lg bg-cresol-green/5 p-6">
              <h3 className="mb-2 font-semibold text-cresol-green">
                Precisa de ajuda?
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Se você tiver dúvidas sobre este documento ou precisar de assistência, entre em contato com o setor responsável.
              </p>
              <Link
                href={document.type === 'sector' ? `/setores/${document.sector_id}` : `/subsetores/${document.subsector_id}`}
                className="inline-flex items-center text-sm font-medium text-cresol-green hover:text-cresol-green/80"
              >
                Ver informações do setor
                <Icon name="arrow-right" className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <DocumentDetailPageContent params={params} />
    </AuthGuard>
  );
}