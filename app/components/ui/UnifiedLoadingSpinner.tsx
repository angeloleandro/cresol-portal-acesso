'use client';

import React from 'react';
import { Flex, Spin, ConfigProvider } from 'antd';
import type { SpinProps } from 'antd';

interface UnifiedLoadingSpinnerProps extends SpinProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Componente unificado de loading usando Ant Design
 * Segue exatamente o padrão do Ant Design com cor laranja Cresol
 */
const UnifiedLoadingSpinner: React.FC<UnifiedLoadingSpinnerProps> = ({
  message = 'Carregando...',
  fullScreen = false,
  size = 'default',
  ...props
}) => {
  // Configuração de tema com cor laranja Cresol
  const theme = {
    token: {
      colorPrimary: '#F58220', // Cor laranja Cresol
    },
  };

  const spinnerContent = (
    <ConfigProvider theme={theme}>
      <Flex align="center" gap="middle" vertical>
        <Spin size={size} {...props}>
          {/* O tip só funciona quando o Spin tem children (nested mode) */}
          <div style={{ padding: message ? 50 : 0 }}>
            {message && <div className="text-gray-600 mt-4">{message}</div>}
          </div>
        </Spin>
      </Flex>
    </ConfigProvider>
  );

  // Se for tela cheia, adiciona overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    );
  }

  // Renderização padrão centralizada
  return (
    <div className="flex items-center justify-center py-8">
      {spinnerContent}
    </div>
  );
};

export default UnifiedLoadingSpinner;