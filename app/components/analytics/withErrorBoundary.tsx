'use client';

import { ComponentType, forwardRef } from 'react';
import { AnalyticsErrorBoundary } from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = forwardRef<any, P>((props, ref) => (
    <AnalyticsErrorBoundary 
      fallback={options.fallback} 
      onError={options.onError}
    >
      <Component {...(props as P)} ref={ref} />
    </AnalyticsErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default withErrorBoundary;