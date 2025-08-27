'use client';

import { ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load do CollectionsProvider apenas quando necessário
const CollectionsProvider = dynamic(
  () => import('@/app/contexts/CollectionsContext').then(mod => ({ 
    default: mod.CollectionsProvider 
  })),
  { 
    ssr: false,
    loading: () => null // Sem loading visual pois o conteúdo já está renderizado
  }
);

// Lazy load do AlertProvider - só necessário em páginas admin
const AlertProvider = dynamic(
  () => import('@/app/components/alerts/AlertProvider').then(mod => ({ 
    default: mod.AlertProvider 
  })),
  { 
    ssr: false,
    loading: () => null
  }
);

interface ConditionalProvidersProps {
  children: ReactNode;
}

export function ConditionalProviders({ children }: ConditionalProvidersProps) {
  const pathname = usePathname();
  
  // Collections apenas onde realmente é usado
  const needsCollections = 
    pathname.includes('/collections') || 
    pathname.includes('/gallery');
  
  // Alerts apenas em áreas admin
  const needsAlerts = 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/admin-setor') ||
    pathname.startsWith('/admin-subsetor');
  
  // Se não precisa de nenhum provider condicional, retorna children direto
  if (!needsCollections && !needsAlerts) {
    return <>{children}</>;
  }
  
  // Aplicar providers conforme necessário
  return (
    <>
      {needsAlerts ? (
        <Suspense fallback={children}>
          <AlertProvider>
            {needsCollections ? (
              <Suspense fallback={children}>
                <CollectionsProvider>
                  {children}
                </CollectionsProvider>
              </Suspense>
            ) : (
              children
            )}
          </AlertProvider>
        </Suspense>
      ) : needsCollections ? (
        <Suspense fallback={children}>
          <CollectionsProvider>
            {children}
          </CollectionsProvider>
        </Suspense>
      ) : (
        children
      )}
    </>
  );
}