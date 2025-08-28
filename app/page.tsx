'use client';

import { useEffect } from 'react';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

/**
 * Página raiz simplificada - apenas mostra loading
 * O middleware.ts já cuida de todo o redirecionamento
 * Isso evita race conditions e verificações duplicadas
 */
export default function RootPage() {
  useEffect(() => {
  }, []);

  return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.checkingSession} fullScreen />;
}

