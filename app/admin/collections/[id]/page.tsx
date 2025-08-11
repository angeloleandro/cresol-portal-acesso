// Collection Detail/Edit Page
// Página individual de coleção com opções de edição - Portal Cresol

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CollectionDetailEditPage from './components/CollectionDetailEditPage';

export const metadata: Metadata = {
  title: 'Detalhes da Coleção | Portal Cresol',
  description: 'Visualizar e editar detalhes da coleção',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function CollectionDetailPage({ params }: PageProps) {
  const { id } = params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollectionDetailEditPage collectionId={id} />
      </div>
    </div>
  );
}