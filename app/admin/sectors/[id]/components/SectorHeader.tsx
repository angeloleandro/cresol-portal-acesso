// Componente de cabeçalho do setor com breadcrumb e ações

import Link from 'next/link';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Sector } from '../types/sector.types';

interface SectorHeaderProps {
  sector: Sector | null;
  onLogout: () => Promise<void>;
}

export function SectorHeader({ sector, onLogout }: SectorHeaderProps) {
  const breadcrumbItems = sector ? [
    { label: 'Admin', href: '/admin' },
    { label: 'Setores', href: '/admin/sectors' },
    { label: sector.name, href: '#' }
  ] : [];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-6">
            <Breadcrumb items={breadcrumbItems} />
            {sector && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{sector.name}</h1>
                {sector.description && (
                  <p className="text-sm text-gray-600 mt-1">{sector.description}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              href="/home"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Voltar ao Portal
            </Link>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}