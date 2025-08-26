'use client';

import { usePathname } from 'next/navigation';

import UnifiedLoadingSpinner from './UnifiedLoadingSpinner';

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

export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false,
  overlay: _overlay = false,
  centered: _centered = true,
  className = '',
  color = 'primary',
  variant,
  type: _type = 'chakra',
  ariaLabel: _ariaLabel
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

  const _selectedVariant = getVariant();
  const _spinnerColor = getSpinnerColor();
  
  return (
    <UnifiedLoadingSpinner
      size={size === 'xs' ? 'sm' : size === 'sm' ? 'sm' : size === 'md' ? 'default' : size === 'lg' ? 'large' : 'large'}
      message={message}
      fullScreen={fullScreen}
    />
  );
} 