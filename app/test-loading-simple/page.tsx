'use client';

import React, { useState } from 'react';
import { Flex, Button } from 'antd';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

/**
 * Página de teste simples para o componente de loading padronizado
 * Exatamente como o exemplo do Ant Design, mas com cor laranja Cresol
 */
export default function TestLoadingSimplePage() {
  const [showFullScreen, setShowFullScreen] = useState(false);

  const handleFullScreenTest = () => {
    setShowFullScreen(true);
    setTimeout(() => setShowFullScreen(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Teste Loading Padrão Ant Design - Cor Laranja Cresol
        </h1>

        {/* Loading Fullscreen */}
        {showFullScreen && (
          <UnifiedLoadingSpinner
            fullScreen
            size="large"
            message={LOADING_MESSAGES.dashboard}
          />
        )}

        {/* Seção 1: Diferentes tamanhos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Tamanhos Disponíveis (Todos em Laranja #F58220)
          </h2>
          
          <Flex align="center" gap="large">
            <UnifiedLoadingSpinner size="small" message="Pequeno" />
            <UnifiedLoadingSpinner size="default" message="Padrão" />
            <UnifiedLoadingSpinner size="large" message="Grande" />
          </Flex>
        </div>

        {/* Seção 2: Diferentes mensagens */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Mensagens Padronizadas
          </h2>
          
          <div className="space-y-4">
            <UnifiedLoadingSpinner message={LOADING_MESSAGES.dashboard} />
            <UnifiedLoadingSpinner message={LOADING_MESSAGES.videos} />
            <UnifiedLoadingSpinner message={LOADING_MESSAGES.processing} />
          </div>
        </div>

        {/* Seção 3: Teste Fullscreen */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Teste Loading Fullscreen
          </h2>
          
          <Button 
            type="primary"
            size="large"
            onClick={handleFullScreenTest}
            style={{ backgroundColor: '#F58220', borderColor: '#F58220' }}
          >
            Testar Loading em Tela Cheia
          </Button>
        </div>

        {/* Seção 4: Exemplo de uso em página */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Exemplo de Uso em Página
          </h2>
          
          <div className="border border-gray-200 rounded p-4">
            <pre className="text-sm text-gray-700">
{`// Importar o componente
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

// Usar no loading da página
if (loading) {
  return (
    <UnifiedLoadingSpinner 
      fullScreen
      size="large" 
      message={LOADING_MESSAGES.dashboard}
    />
  );
}

// Ou inline no conteúdo
<UnifiedLoadingSpinner 
  size="default" 
  message="Carregando dados..."
/>`}
            </pre>
          </div>
        </div>

        {/* Validação visual */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold mb-2">
            ✓ Checklist de Validação:
          </h3>
          <ul className="text-green-700 space-y-1">
            <li>✓ Spinner padrão do Ant Design (pontos animados)</li>
            <li>✓ Cor laranja Cresol (#F58220)</li>
            <li>✓ Texto aparece abaixo do spinner</li>
            <li>✓ Sem duplicação de texto</li>
            <li>✓ Suporte para fullscreen com overlay</li>
            <li>✓ Três tamanhos disponíveis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}