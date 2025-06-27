'use client';

import Link from 'next/link';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  onRetry?: () => void;
  showHomeLink?: boolean;
  fullScreen?: boolean;
  className?: string;
  onClose?: () => void;
}

const typeStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
    button: 'bg-red-600 hover:bg-red-700 text-white'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700 text-white'
  }
};

export default function ErrorMessage({
  title,
  message,
  type = 'error',
  showRetry = false,
  onRetry,
  showHomeLink = true,
  fullScreen = false,
  className = '',
  onClose
}: ErrorMessageProps) {
  const styles = typeStyles[type];
  
  const errorContent = (
    <div className={`${styles.container} border rounded-lg p-6 max-w-md ${className}`}>
      <div className="flex items-start space-x-3">
        <svg 
          className={`h-6 w-6 ${styles.icon} flex-shrink-0 mt-0.5`} 
          aria-hidden="true" 
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          {title && (
            <h2 className={`text-lg font-semibold ${styles.title} mb-2`}>
              {title}
            </h2>
          )}
          <p className={`${styles.message} mb-4`}>
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className={`
                  flex items-center justify-center px-4 py-2 rounded-lg 
                  ${styles.button} transition-colors text-sm font-medium
                `}
                aria-label="Tentar novamente"
              >
                <svg className="h-4 w-4 mr-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tentar Novamente
              </button>
            )}
            
            {showHomeLink && (
              <Link
                href="/home"
                className={`
                  flex items-center justify-center px-4 py-2 rounded-lg 
                  border border-current transition-colors text-sm font-medium
                  ${type === 'error' ? 'text-red-600 hover:bg-red-50' : 
                    type === 'warning' ? 'text-yellow-600 hover:bg-yellow-50' : 
                    'text-blue-600 hover:bg-blue-50'}
                `}
                aria-label="Voltar para a página inicial"
              >
                <svg className="h-4 w-4 mr-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Voltar para Home
              </Link>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cresol-gray-light/30 px-4">
        <div role="alert" aria-live="assertive">
          {errorContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div role="alert" aria-live="assertive">
        {errorContent}
      </div>
    </div>
  );
} 