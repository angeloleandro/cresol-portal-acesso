'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import UnifiedLoadingSpinner from '../ui/UnifiedLoadingSpinner';
import { FormatDate } from '@/lib/utils/formatters';
import { Icon } from '../icons/Icon';

interface SectorDocument {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

interface SectorDocumentsProps {
  sectorId: string;
  compact?: boolean;
  limit?: number;
}

export default function SectorDocuments({ sectorId, compact = false, limit = 3 }: SectorDocumentsProps) {
  const [documents, setDocuments] = useState<SectorDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('sector_documents')
          .select('id, title, description, file_url, file_type, created_at')
          .eq('sector_id', sectorId)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          setDocuments([]);
          return;
        }
        
        setDocuments(data || []);
      } catch (error) {
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [sectorId, limit]);

  const getFileIcon = (fileType: string) => {
    if (fileType?.toLowerCase().includes('pdf')) {
      return <Icon name="file" className="h-4 w-4 text-red-600" />;
    }
    return <Icon name="file" className="h-4 w-4 text-blue-600" />;
  };

  if (isLoading) {
    return (
      <section className="bg-white rounded-md border border-cresol-gray-light">
        <div className="p-6">
          <UnifiedLoadingSpinner message="Carregando documentos..." />
        </div>
      </section>
    );
  }

  return (
    <section 
      className="bg-white rounded-md border border-cresol-gray-light"
      aria-labelledby="sector-documents-heading"
    >
      <div className="p-6 border-b border-cresol-gray-light">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Icon name="file" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
            <h2 id="sector-documents-heading" className="text-xl font-semibold text-cresol-gray-dark">
              Documentos
            </h2>
          </div>
          {documents.length > 0 && (
            <Link 
              href={`/setores/${sectorId}/documentos`}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Ver todos
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">
        {documents.length === 0 ? (
          <div className="text-center py-8" role="status">
            <p className="text-cresol-gray">
              Nenhum documento publicado ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Lista de documentos">
            {documents.map((document, index) => (
              <a
                key={document.id}
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-cresol-gray-light rounded-lg p-4 hover:border-card-hover transition-colors"
                role="listitem"
                aria-labelledby={`document-title-${index}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(document.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      id={`document-title-${index}`}
                      className="font-semibold text-cresol-gray-dark mb-1"
                    >
                      {document.title}
                    </h3>
                    {document.description && (
                      <p className="text-cresol-gray text-sm mb-2 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-cresol-gray">
                      <Icon name="clock" className="h-3 w-3 mr-1" aria-hidden="true" />
                      <time dateTime={document.created_at}>
                        {FormatDate(document.created_at)}
                      </time>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Icon name="download" className="h-4 w-4 text-cresol-gray" aria-hidden="true" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}