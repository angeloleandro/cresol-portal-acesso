'use client';

import { usePathname } from 'next/navigation';
import StandardizedSpinner from './StandardizedSpinner';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  centered?: boolean;
  className?: string;
  color?: 'primary' | 'white' | 'gray' | string;
  variant?: 'home' | 'admin' | 'light' | 'dark';
  type?: 'chakra' | 'inline' | 'overlay';
  ariaLabel?: string;
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
  overlay = false,
  centered = true,
  className = '',
  color = 'primary',
  variant,
  type = 'chakra',
  ariaLabel
}: LoadingSpinnerProps) {
  const pathname = usePathname();
  
  // Smart context detection for automatic variant selection
  const getVariant = (): 'home' | 'admin' | 'light' | 'dark' => {
    // Explicit variant takes precedence
    if (variant) return variant;
    
    // Auto-detect based on path
    if (pathname?.startsWith('/admin')) return 'admin';
    if (pathname?.includes('/api/admin')) return 'admin';
    
    // Legacy color mapping for backward compatibility
    if (color === 'gray') return 'admin';
    if (color === 'white') return 'light';
    
    // Default to home variant
    return 'home';
  };

  // Convert legacy color prop to appropriate variant/color
  const getSpinnerColor = (): string | undefined => {
    if (typeof color === 'string' && !['primary', 'white', 'gray'].includes(color)) {
      return color; // Custom color
    }
    return undefined; // Use variant defaults
  };

  const selectedVariant = getVariant();
  const spinnerColor = getSpinnerColor();
  
  return (
    <StandardizedSpinner
      size={size}
      variant={selectedVariant}
      type={type}
      message={message}
      fullScreen={fullScreen}
      overlay={overlay}
      centered={centered}
      color={spinnerColor}
      className={className}
      ariaLabel={ariaLabel}
    />
  );
} 