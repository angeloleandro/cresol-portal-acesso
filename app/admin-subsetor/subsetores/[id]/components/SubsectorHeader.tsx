// Componente de cabeçalho do subsetor

import Link from 'next/link';

import { Profile, Subsector } from '../types/subsector.types';

interface SubsectorHeaderProps {
  subsector: Subsector | null;
  profile: Profile | null;
  onLogout?: () => void;
}

/**
 * SubsectorHeader function
 * @todo Add proper documentation
 */
export function SubsectorHeader({ subsector, profile, onLogout }: SubsectorHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-6">
            <Link 
              href="/admin-subsetor" 
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{subsector?.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Setor: {subsector?.sector_name} • {subsector?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {profile?.full_name || profile?.email}
            </span>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-50"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}