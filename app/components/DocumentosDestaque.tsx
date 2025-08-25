'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';

import { FormatDate } from '@/lib/utils/formatters';
interface DocumentItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  created_at: string;
  sector_id?: string;
  subsector_id?: string;
  sector_name?: string;
  subsector_name?: string;
}

interface DocumentosDestaqueProps {
  compact?: boolean;
  limit?: number;
}

export default function DocumentosDestaque({ compact = false, limit = 4 }: DocumentosDestaqueProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      
      try {
        // Buscar documentos de setores
        const { data: sectorDocuments, error: sectorError } = await supabase
          .from('sector_documents')
          .select(`
            id,
            title,
            description,
            file_url,
            file_type,
            created_at,
            sector_id,
            sectors (name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Buscar documentos de subsetores
        const { data: subsectorDocuments, error: subsectorError } = await supabase
          .from('subsector_documents')
          .select(`
            id,
            title,
            description,
            file_url,
            file_type,
            created_at,
            subsector_id,
            subsectors (name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Combinar e formatar documentos
        let allDocuments: DocumentItem[] = [];
        
        if (sectorDocuments && !sectorError) {
          const formattedSectorDocuments = sectorDocuments.map((doc: any) => ({
            ...doc,
            sector_name: doc.sectors?.name,
            type: 'sector'
          }));
          allDocuments = [...allDocuments, ...formattedSectorDocuments];
        }

        if (subsectorDocuments && !subsectorError) {
          const formattedSubsectorDocuments = subsectorDocuments.map((doc: any) => ({
            ...doc,
            subsector_name: doc.subsectors?.name,
            type: 'subsector'
          }));
          allDocuments = [...allDocuments, ...formattedSubsectorDocuments];
        }

        // Ordenar por data e limitar
        allDocuments.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setDocuments(allDocuments.slice(0, limit));
      } catch (error) {

        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [limit]);

  // Formatador de data

  // Formatador de tipo de arquivo
  const getFileIcon = (fileType: string) => {
    if (fileType?.toLowerCase().includes('pdf')) {
      return (
        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="card">
        <UnifiedLoadingSpinner message="Carregando documentos..." />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="card p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="heading-4 text-title">Documentos</h2>
          </div>
          <Link 
            href="/documentos" 
            className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
          >
            Ver todos
            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {documents.length === 0 ? (
          <div className="text-center py-4">
            <p className="body-text-small text-muted">Nenhum documento disponível</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((document) => (
              <a
                key={document.id}
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2.5 border-b border-cresol-gray-light/30 last:border-b-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    {getFileIcon(document.file_type)}
                    <h3 className="body-text-bold text-title line-clamp-1">{document.title}</h3>
                  </div>
                  {document.description && (
                    <p className="body-text-small text-muted line-clamp-2 mt-1">{document.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted">
                      {FormatDate(document.created_at)}
                    </span>
                    {(document.sector_name || document.subsector_name) && (
                      <span className="text-xs text-primary">
                        {document.sector_name || document.subsector_name}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="heading-3 text-title">Documentos Recentes</h2>
          <p className="body-text-small text-muted mt-1">Documentos e arquivos importantes</p>
        </div>
        <Link 
          href="/documentos" 
          className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
        >
          Ver todos
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {documents.length === 0 ? (
        <div className="p-8 text-center">
          <p className="body-text text-muted">Nenhum documento disponível no momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <a
              key={document.id}
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200/60 hover:border-gray-200 rounded-md transition-colors duration-150 p-4"
            >
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Documento
                    </span>
                    {getFileIcon(document.file_type)}
                  </div>
                  <span className="text-xs text-muted">
                    {FormatDate(document.created_at)}
                  </span>
                </div>
                
                <h3 className="heading-4 text-title mb-2 leading-tight">{document.title}</h3>
                
                {document.description && (
                  <p className="body-text-small text-body mb-3 line-clamp-2">{document.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">
                    {document.sector_name || document.subsector_name || 'Administração'}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    Abrir documento →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}