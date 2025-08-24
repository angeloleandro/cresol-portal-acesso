import { ReactNode, Suspense } from 'react';

import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';

interface OptimizedSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  message?: string;
}

/**
 * OptimizedSuspense function
 * @todo Add proper documentation
 */
export function OptimizedSuspense({ 
  children, 
  fallback,
  message = 'Carregando...'
}: OptimizedSuspenseProps) {
  const defaultFallback = (
    <div className="min-h-[200px] flex items-center justify-center">
      <UnifiedLoadingSpinner message={message} />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

/**
 * Suspense específico para páginas com altura completa
 */
/**
 * PageSuspense function
 * @todo Add proper documentation
 */
export function PageSuspense({ 
  children,
  message = 'Carregando página...'
}: Omit<OptimizedSuspenseProps, 'fallback'>) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <UnifiedLoadingSpinner fullScreen message={message} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

/**
 * Suspense para componentes inline sem altura mínima
 */
/**
 * InlineSuspense function
 * @todo Add proper documentation
 */
export function InlineSuspense({ 
  children,
  message = 'Carregando...'
}: Omit<OptimizedSuspenseProps, 'fallback'>) {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center p-4">
          <UnifiedLoadingSpinner message={message} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}