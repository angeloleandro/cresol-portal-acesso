'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const colorClasses = {
  primary: 'text-primary',
  white: 'text-white',
  gray: 'text-gray-500'
};

export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false, 
  className = '',
  color = 'primary'
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {message && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'} text-center max-w-xs`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center bg-cresol-gray-light/30"
        role="status"
        aria-live="polite"
        aria-label={message || 'Carregando conteúdo'}
      >
        {spinnerContent}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center py-8"
      role="status"
      aria-live="polite"
      aria-label={message || 'Carregando'}
    >
      {spinnerContent}
    </div>
  );
} 