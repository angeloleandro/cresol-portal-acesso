'use client';

import { Flex, Spin, ConfigProvider } from 'antd';

import { CRESOL_COLORS } from '@/lib/design-tokens/design-tokens';

import type { SpinProps } from 'antd';

interface UnifiedLoadingSpinnerProps extends SpinProps {
  message?: string;
  fullScreen?: boolean;
}

const UnifiedLoadingSpinner: React.FC<UnifiedLoadingSpinnerProps> = ({
  message = 'Carregando...',
  fullScreen = false,
  size = 'default',
  ...props
}) => {
  // Configuração de tema com cor laranja Cresol
  const theme = {
    token: {
      colorPrimary: CRESOL_COLORS.primary.DEFAULT, // Cor laranja Cresol
    },
  };

  const spinnerContent = (
    <ConfigProvider theme={theme}>
      <Flex align="center" gap="middle" vertical>
        <Spin size={size} {...props} />
        {message && (
          <div className="text-gray-600 text-sm mt-2 text-center">
            {message}
          </div>
        )}
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