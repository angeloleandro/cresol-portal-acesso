'use client';

import React, { Component, ReactNode } from 'react';

import { StandardizedButton } from '@/app/components/admin';
import { Icon } from '@/app/components/icons/Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error para produção
    if (process.env.NODE_ENV === 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
      // Aqui você pode integrar com serviços de monitoramento como Sentry
    } else {
      console.error('Development Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Callback customizado para reportar erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              {/* Ícone de erro */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <Icon name="alert-circle" className="h-8 w-8 text-red-600" />
              </div>

              {/* Título e descrição */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Algo deu errado
              </h2>
              <p className="text-gray-600 mb-6">
                Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
              </p>

              {/* Detalhes do erro em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 rounded p-4 mb-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Detalhes do erro (apenas em desenvolvimento)
                  </summary>
                  <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-all">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        Stack trace:
                        <pre className="mt-1 text-xs">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3">
                <StandardizedButton
                  variant="primary"
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  <Icon name="refresh" className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </StandardizedButton>
                <StandardizedButton
                  variant="secondary"
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <Icon name="house" className="h-4 w-4 mr-2" />
                  Recarregar Página
                </StandardizedButton>
              </div>

              {/* Link para suporte */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Se o problema persistir, entre em contato com o{' '}
                  <a 
                    href="/admin" 
                    className="text-primary hover:text-primary-dark underline"
                  >
                    suporte técnico
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para facilitar o uso
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Error Boundary específico para páginas administrativas
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log específico para páginas admin
    console.error('[ADMIN-ERROR]', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

// Error Boundary específico para rotas públicas
export function PublicErrorBoundary({ children }: { children: ReactNode }) {
  const fallback = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <Icon name="alert-circle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Página Indisponível
        </h2>
        <p className="text-gray-600 mb-6">
          Esta página está temporariamente indisponível. Tente novamente em alguns minutos.
        </p>
        <StandardizedButton
          variant="primary"
          onClick={() => window.location.href = '/'}
        >
          <Icon name="house" className="h-4 w-4 mr-2" />
          Voltar ao Início
        </StandardizedButton>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}