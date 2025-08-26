'use client';

import { Flex, Spinner, Center } from '@chakra-ui/react';

import { CRESOL_COLORS } from '@/lib/design-tokens/design-tokens';

interface UnifiedLoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'default' | 'large';
}

const UnifiedLoadingSpinner: React.FC<UnifiedLoadingSpinnerProps> = ({
  message = 'Carregando...',
  fullScreen = false,
  size = 'md'
}) => {
  // Mapear tamanhos legacy para Chakra UI
  const getSpinnerSize = () => {
    switch (size) {
      case 'default': return 'md';
      case 'large': return 'lg';
      default: return size;
    }
  };

  const spinnerContent = (
    <Flex align="center" direction="column" gap={3}>
      <Spinner 
        size={getSpinnerSize()}
        color="orange.500"
      />
      {message && (
        <div className="text-gray-600 text-sm text-center">
          {message}
        </div>
      )}
    </Flex>
  );

  // Se for tela cheia, adiciona overlay
  if (fullScreen) {
    return (
      <Center
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        bg="whiteAlpha.800"
        backdropFilter="blur(4px)"
        zIndex="9999"
      >
        {spinnerContent}
      </Center>
    );
  }

  // Renderização padrão centralizada
  return (
    <Center py={8}>
      {spinnerContent}
    </Center>
  );
};

export default UnifiedLoadingSpinner;