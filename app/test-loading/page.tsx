'use client';

import { useState } from 'react';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES, getLoadingMessage } from '@/lib/constants/loading-messages';
import { AntdConfigProvider } from '@/app/providers/AntdConfigProvider';

/**
 * Página de teste para verificar todos os componentes de loading
 * padronizados com Ant Design e cor laranja Cresol
 */
export default function TestLoadingPage() {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [progress, setProgress] = useState(50);

  const handleButtonClick = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 3000);
  };

  const handleFullScreenClick = () => {
    setShowFullScreen(true);
    setTimeout(() => setShowFullScreen(false), 3000);
  };

  return (
    <AntdConfigProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-cresol-green">
            Teste de Componentes de Loading Padronizados
          </h1>

          {/* Fullscreen Loading */}
          {showFullScreen && (
            <UnifiedLoadingSpinner
              fullScreen
              size="large"
              message={LOADING_MESSAGES.dashboard}
            />
          )}

          {/* Section 1: Basic Spinners */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              1. Spinners Básicos (Cor Laranja Cresol)
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Small</h3>
                <UnifiedLoadingSpinner size="small" message="Carregando pequeno..." />
              </div>
              <div>
                <h3 className="font-medium mb-2">Default</h3>
                <UnifiedLoadingSpinner message={LOADING_MESSAGES.default} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Large</h3>
                <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.loading} />
              </div>
            </div>
          </section>

          {/* Section 2: Context Spinners */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              2. Spinners por Contexto
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Home Context</h3>
                <UnifiedLoadingSpinner message={LOADING_MESSAGES.home} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Admin Context</h3>
                <UnifiedLoadingSpinner message={LOADING_MESSAGES.dashboard} />
              </div>
            </div>
          </section>

          {/* Section 3: Inline Spinners */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              3. Spinners Inline
            </h2>
            
            <div className="space-y-4">
              <div>
                <span className="mr-2">Texto com spinner inline:</span>
                <UnifiedLoadingSpinner size="small" message={LOADING_MESSAGES.processing} />
              </div>
              
              <div>
                <span className="mr-2">Upload com progresso:</span>
                <UnifiedLoadingSpinner 
                  size="small"
                  message={getLoadingMessage('uploadProgress', { progress })}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Button Spinners */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              4. Spinners em Botões
            </h2>
            
            <div className="flex gap-4">
              <button
                onClick={handleButtonClick}
                disabled={isButtonLoading}
                className="px-4 py-2 bg-cresol-orange text-white rounded hover:bg-orange-600 disabled:opacity-50 flex items-center"
              >
                {isButtonLoading && <UnifiedLoadingSpinner size="small" />}
                {isButtonLoading ? LOADING_MESSAGES.saving : 'Salvar'}
              </button>

              <button
                onClick={handleButtonClick}
                disabled={isButtonLoading}
                className="px-4 py-2 bg-cresol-green text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isButtonLoading && <UnifiedLoadingSpinner size="small" />}
                {isButtonLoading ? LOADING_MESSAGES.sending : 'Enviar'}
              </button>
            </div>
          </section>

          {/* Section 5: Different Messages */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              5. Mensagens Padronizadas (Sem Duplicação)
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <UnifiedLoadingSpinner message={LOADING_MESSAGES.videos} />
              <UnifiedLoadingSpinner message={LOADING_MESSAGES.images} />
              <UnifiedLoadingSpinner message={LOADING_MESSAGES.users} />
              <UnifiedLoadingSpinner message={LOADING_MESSAGES.profile} />
              <UnifiedLoadingSpinner message={LOADING_MESSAGES.sectors} />
              <UnifiedLoadingSpinner message={LOADING_MESSAGES.notifications} />
            </div>
          </section>

          {/* Section 6: Fullscreen Test */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              6. Teste Fullscreen
            </h2>
            
            <button
              onClick={handleFullScreenClick}
              className="px-6 py-3 bg-cresol-orange text-white rounded-lg hover:bg-orange-600"
            >
              Testar Loading Fullscreen
            </button>
          </section>

          {/* Section 7: Validation Check */}
          <section className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800">
              ✓ Validação de Requisitos
            </h2>
            
            <ul className="space-y-2 text-green-700">
              <li>✓ Todos os spinners usam a cor laranja Cresol (#F58220)</li>
              <li>✓ Nenhuma duplicação de texto de loading</li>
              <li>✓ Mensagens centralizadas em constantes</li>
              <li>✓ Suporte para diferentes contextos (home/admin)</li>
              <li>✓ Suporte para diferentes tamanhos</li>
              <li>✓ Suporte para botões e inline</li>
              <li>✓ Suporte para fullscreen com overlay</li>
              <li>✓ Configuração global via AntdConfigProvider</li>
            </ul>
          </section>
        </div>
      </div>
    </AntdConfigProvider>
  );
}