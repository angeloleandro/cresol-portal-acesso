'use client';

import { usePathname } from 'next/navigation';
import StandardizedSpinner from './StandardizedSpinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  className?: string;
  color?: 'primary' | 'white' | 'gray';
  variant?: 'home' | 'admin'; // New optional explicit variant
}

/**
 * Smart Loading Spinner that automatically detects context
 * and applies appropriate styling (orange for home, gray for admin)
 * 
 * Maintains backward compatibility with existing color prop
 * while migrating to new standardized Chakra UI spinners
 */
export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false, 
  className = '',
  color = 'primary',
  variant
}: LoadingSpinnerProps) {
  const pathname = usePathname();
  
  // Smart context detection for automatic variant selection
  const getVariant = (): 'home' | 'admin' => {
    // Explicit variant takes precedence
    if (variant) return variant;
    
    // Auto-detect based on path
    if (pathname?.startsWith('/admin')) return 'admin';
    if (pathname?.includes('/api/admin')) return 'admin';
    
    // Legacy color mapping for backward compatibility
    if (color === 'gray') return 'admin';
    
    // Default to home variant
    return 'home';
  };

  const selectedVariant = getVariant();
  
  return (
    <StandardizedSpinner
      size={size}
      message={message}
      fullScreen={fullScreen}
      variant={selectedVariant}
      className={className}
    />
  );
} 