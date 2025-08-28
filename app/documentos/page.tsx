'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import { ChakraSelect, ChakraSelectOption } from '@/app/components/forms';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
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
import Icon from '../components/icons/Icon';


import { FormatDate } from '@/lib/utils/formatters';
interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
  sector_id?: string;
  subsector_id?: string;
  sectors?: { name: string };
  subsectors?: { name: string; sectors?: { id: string; name: string } };
  type: 'sector' | 'subsector';
}

function DocumentosContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentsData = async () => {

      try {
        // Carregar documentos de setores
        const { data: sectorDocs } = await supabase
          .from('sector_documents')
          .select(`
            *,
            sectors:sector_id (name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        // Carregar documentos de subsetores
        const { data: subsectorDocs } = await supabase
          .from('subsector_documents')
          .select(`
            *,
            subsectors:subsector_id (name, sectors!inner(id, name))
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        // Carregar lista de setores
        const { data: sectorsData } = await supabase
          .from('sectors')
          .select('id, name')
          .order('name');

        setSectors(sectorsData || []);

        // Combinar documentos
        const allDocuments: DocumentItem[] = [
          ...(sectorDocs || []).map(doc => ({ ...doc, type: 'sector' as const })),
          ...(subsectorDocs || []).map(doc => ({ ...doc, type: 'subsector' as const }))
        ];

        // Ordenar por data de criação
        allDocuments.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setDocuments(allDocuments);
        setFilteredDocuments(allDocuments);
      } catch (err) {
        
        setDocuments([]);
        setFilteredDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentsData();
  }, [router]);

  useEffect(() => {
    // Aplicar filtros
    let filtered = documents;

    // Filtro por setor
    if (selectedSector !== 'all') {
      filtered = filtered.filter(doc => {
        if (doc.type === 'sector') {
          return doc.sector_id === selectedSector;
        } else {
          // For subsector documents, compare the parent sector id
          return doc.subsectors?.sectors?.id === selectedSector;
        }
      });
    }

    // Filtro por tipo de arquivo
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.file_type === selectedType);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  }, [selectedSector, selectedType, searchTerm, documents, sectors]);

  // Formatador de data

  // Obter tipos únicos de arquivo
  const fileTypes = Array.from(new Set(documents.map(doc => doc.file_type).filter(Boolean)));

  // Opções para o select de setores (ChakraSelect)
  const sectorOptions = useMemo((): ChakraSelectOption[] => [
    { value: 'all', label: 'Todos os setores' },
    ...sectors.map(sector => ({
      value: sector.id,
      label: sector.name
    }))
  ], [sectors]);

  // Opções para o select de tipos de arquivo (ChakraSelect)
  const fileTypeOptions = useMemo((): ChakraSelectOption[] => [
    { value: 'all', label: 'Todos os tipos' },
    ...fileTypes.filter(type => type !== undefined).map(type => ({
      value: type as string,
      label: getFileTypeLabel(type)
    }))
  ], [fileTypes]);

  // Função para baixar documento
  const handleDownload = async (document: DocumentItem) => {
    try {
      window.open(document.file_url, '_blank');
    } catch (error) {
      
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/home', icon: 'house' },
          { label: 'Documentos' }
        ]} 
      />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-2 text-gray-600">
            Acesse todos os documentos disponíveis da organização
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 space-y-4 rounded-lg bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cresol-green focus:outline-none focus:ring-1 focus:ring-cresol-green"
              />
            </div>

            {/* Filtro por Setor */}
            <div>
              <ChakraSelect
                label="Setor"
                options={sectorOptions}
                value={selectedSector}
                onChange={(value) => setSelectedSector(value as string)}
                placeholder="Todos os setores"
                size="md"
                variant="outline"
                fullWidth
              />
            </div>

            {/* Filtro por Tipo */}
            <div>
              <ChakraSelect
                label="Tipo de Arquivo"
                options={fileTypeOptions}
                value={selectedType}
                onChange={(value) => setSelectedType(value as string)}
                placeholder="Todos os tipos"
                size="md"
                variant="outline"
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Lista de Documentos */}
        {filteredDocuments.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <Icon name="file-text" className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Nenhum documento encontrado
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || selectedSector !== 'all' || selectedType !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Não há documentos publicados no momento.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="group relative rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
              >
                {/* Ícone do tipo de arquivo */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="file" className="h-8 w-8 text-cresol-green" />
                    <span className="text-sm font-medium text-gray-500">
                      {getFileTypeLabel(document.file_type)}
                    </span>
                  </div>
                  {document.file_size && (
                    <span className="text-sm text-gray-500">
                      {formatFileSize(document.file_size)}
                    </span>
                  )}
                </div>

                {/* Título e Descrição */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                  {document.title}
                </h3>
                {document.description && (
                  <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                    {document.description}
                  </p>
                )}

                {/* Metadados */}
                <div className="mb-4 space-y-1 text-xs text-gray-500">
                  <div>
                    {document.type === 'sector' 
                      ? document.sectors?.name 
                      : `${document.subsectors?.sectors?.name} - ${document.subsectors?.name}`}
                  </div>
                  <div>{FormatDate(document.created_at)}</div>
                </div>

                {/* Ações */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDownload(document)}
                    className="flex flex-1 items-center justify-center rounded-md bg-cresol-green px-4 py-2 text-sm font-medium text-white hover:bg-cresol-green/90 focus:outline-none focus:ring-2 focus:ring-cresol-green focus:ring-offset-2"
                  >
                    <Icon name="download" className="mr-2 h-4 w-4" />
                    Baixar
                  </button>
                  <Link
                    href={`/documentos/${document.id}`}
                    className="flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cresol-green focus:ring-offset-2"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function DocumentosPage() {
  return (
    <AuthGuard loadingMessage={LOADING_MESSAGES.loading}>
      <DocumentosContent />
    </AuthGuard>
  );
}