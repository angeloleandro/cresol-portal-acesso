// Componente da aba de sistemas

import OptimizedImage from '@/app/components/OptimizedImage';
import { System } from '../../types/subsector.types';

interface SystemsTabProps {
  systems: System[];
  onNewSystem: () => void;
}

export function SystemsTab({ systems, onNewSystem }: SystemsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-cresol-gray">Sistemas do Sub-setor</h3>
        <button
          onClick={onNewSystem}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Novo Sistema
        </button>
      </div>

      {systems.length === 0 ? (
        <div className="bg-white rounded-lg  p-8 text-center">
          <div className="text-6xl text-gray-300 mb-4">🖥️</div>
          <h4 className="text-lg font-semibold text-cresol-gray mb-2">
            Nenhum sistema encontrado
          </h4>
          <p className="text-cresol-gray">
            Adicione o primeiro sistema para este sub-setor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <div key={system.id} className="bg-white rounded-lg  p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-cresol-gray">
                  {system.name}
                </h4>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  {system.icon ? (
                    <OptimizedImage
                      src={system.icon}
                      alt={system.name}
                      width={24}
                      height={24}
                    />
                  ) : (
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </div>
              
              {system.description && (
                <p className="text-sm text-gray-600 mb-4">{system.description}</p>
              )}

              <a
                href={system.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
              >
                Acessar Sistema
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}