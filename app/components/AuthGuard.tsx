'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * Rota para redirecionar se não autenticado
   * @default '/login'
   */
  redirectTo?: string;
  /**
   * Se deve exigir role específica
   */
  requireRole?: 'admin' | 'sector_admin' | 'subsector_admin';
  /**
   * Mensagem customizada para o loading
   */
  loadingMessage?: string;
  /**
   * Se deve mostrar loading em tela cheia
   * @default true
   */
  fullScreenLoading?: boolean;
}

/**
 * AuthGuard Component
 * 
 * Componente wrapper que centraliza a verificação de autenticação.
 * Usa o AuthProvider context para evitar verificações duplicadas e race conditions.
 * 
 * @example
 * ```tsx
 * <AuthGuard requireRole="admin">
 *   <AdminContent />
 * </AuthGuard>
 * ```
 */
export default function AuthGuard({ 
  children, 
  redirectTo = '/login',
  requireRole,
  loadingMessage,
  fullScreenLoading = true
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, 
    profile, 
    loading, 
    initialized,
    isAuthenticated,
    isAdmin,
    isSectorAdmin
  } = useAuth();


  useEffect(() => {
    // Só fazer verificações após o AuthProvider estar inicializado
    if (!initialized) return;

    // Se não está autenticado, redirecionar
    if (!isAuthenticated) {
      // Construir URL de redirecionamento com query param
      const redirectUrl = new URL(redirectTo, window.location.origin);
      if (pathname !== '/' && pathname !== '/login') {
        redirectUrl.searchParams.set('redirectedFrom', pathname);
      }
      router.replace(redirectUrl.toString());
      return;
    }

    // Verificar roles específicas se necessário
    if (requireRole && profile) {
      const hasRequiredRole = () => {
        switch (requireRole) {
          case 'admin':
            return profile.role === 'admin';
          case 'sector_admin':
            return profile.role === 'admin' || profile.role === 'sector_admin';
          case 'subsector_admin':
            return profile.role === 'admin' || profile.role === 'sector_admin' || profile.role === 'subsector_admin';
          default:
            return true;
        }
      };

      if (!hasRequiredRole()) {
        // Redirecionar para home se não tem a role necessária
        router.replace('/home');
        return;
      }
    }
  }, [initialized, isAuthenticated, profile, requireRole, pathname, router, redirectTo]);

  // Mostrar loading enquanto verifica autenticação
  if (!initialized || loading) {
    // Determinar mensagem de loading baseada no contexto
    const message = loadingMessage || 
      (pathname.includes('/setores') ? LOADING_MESSAGES.sectors :
       pathname.includes('/subsetores') ? LOADING_MESSAGES.subsectors :
       pathname.includes('/admin') ? LOADING_MESSAGES.default :
       LOADING_MESSAGES.default);

    return (
      <UnifiedLoadingSpinner 
        fullScreen={fullScreenLoading}
        message={message}
        size="large"
      />
    );
  }

  // Se não está autenticado após inicialização, não renderizar nada
  // (o useEffect já vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  // Se precisa de role específica mas o useEffect já vai redirecionar
  // apenas aguardar (verificação já foi feita no useEffect)
  if (requireRole && profile) {
  }

  // Renderizar children se passou todas as verificações
  return <>{children}</>;
}