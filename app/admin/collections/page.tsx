// Admin Collections Page
// Página administrativa para gerenciamento de coleções - Portal Cresol

import { Metadata } from 'next';
import CollectionsManager from './components/CollectionsManager';

export const metadata: Metadata = {
  title: 'Gerenciar Coleções | Portal Cresol',
  description: 'Interface administrativa para gerenciamento de coleções de imagens e vídeos',
};

export default function AdminCollectionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollectionsManager />
      </div>
    </div>
  );
}