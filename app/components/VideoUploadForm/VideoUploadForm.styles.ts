/**
 * VideoUploadForm Design System Styles
 * Consistent CSS classes using design tokens and mobile-first responsive design
 */

import { cn } from '@/lib/utils/cn'
import { videoSystemTokens, videoComponentTokens } from '@/lib/design-tokens/video-system'

export const videoUploadStyles = {
  // Container styles
  container: cn(
    'bg-white rounded-lg border border-neutral-200 p-4 max-w-2xl mx-auto',
    'shadow-sm hover:shadow-md transition-shadow duration-200',
    'sm:p-6 lg:p-8 lg:max-w-4xl xl:max-w-6xl'
  ),
  
  // Header styles
  header: {
    title: cn(
      'text-lg font-semibold text-neutral-900 mb-4',
      'sm:text-xl sm:mb-6'
    ),
    
    subtitle: cn(
      'text-sm text-neutral-600 mb-2',
      'sm:text-base'
    ),
  },
  
  // Form layout
  form: {
    root: 'space-y-4 sm:space-y-6',
    
    section: 'space-y-3',
    
    fieldGroup: cn(
      'grid gap-4',
      'grid-cols-1',
      'sm:grid-cols-2', 
      'lg:grid-cols-3'
    ),
    
    label: cn(
      'block text-sm font-medium text-neutral-700 mb-2',
      'sm:text-base'
    ),
    
    required: 'text-red-500 ml-1',
    
    helpText: cn(
      'text-xs text-neutral-500 mt-1',
      'sm:text-sm'
    ),
  },
  
  // Input styles
  input: {
    base: cn(
      'w-full border border-neutral-300 rounded-md px-3 py-2',
      'text-sm placeholder-neutral-400',
      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50',
      'transition-colors duration-150',
      'sm:text-base sm:px-4 sm:py-3'
    ),
    
    error: cn(
      'border-error focus:border-error focus:ring-error/20'
    ),
    
    success: cn(
      'border-success focus:border-success focus:ring-success/20'
    ),
  },
  
  // Radio and checkbox styles
  radioGroup: {
    container: 'flex gap-4 sm:gap-6',
    
    option: cn(
      'flex items-center gap-2 cursor-pointer',
      'text-sm sm:text-base'
    ),
    
    input: cn(
      'w-4 h-4 text-primary border-neutral-300',
      'focus:ring-2 focus:ring-primary/20',
      'sm:w-5 sm:h-5'
    ),
  },
  
  checkbox: {
    container: 'flex items-center gap-2 cursor-pointer',
    
    input: cn(
      'w-4 h-4 text-primary border-neutral-300 rounded',
      'focus:ring-2 focus:ring-primary/20',
      'sm:w-5 sm:h-5'
    ),
    
    label: 'text-sm font-medium text-neutral-700 sm:text-base',
  },
  
  // Upload area styles
  uploadArea: {
    base: cn(
      'relative border-2 border-dashed rounded-lg p-6 text-center',
      'border-neutral-300 bg-neutral-50',
      'transition-all duration-200 ease-out',
      'sm:p-8'
    ),
    
    active: cn(
      'border-primary bg-primary/5',
      'hover:border-primary/70 hover:bg-primary/10'
    ),
    
    content: 'flex flex-col items-center gap-3',
    
    icon: 'w-10 h-10 text-neutral-400 sm:w-12 sm:h-12',
    
    text: 'text-sm text-neutral-600 sm:text-base',
    
    highlight: 'text-primary font-medium cursor-pointer hover:text-primary-hover',
    
    helpText: 'text-xs text-neutral-500 sm:text-sm',
    
    input: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
  },
  
  // File preview styles
  filePreview: {
    container: cn(
      'border border-neutral-200 rounded-lg p-4',
      'bg-white shadow-sm'
    ),
    
    header: 'flex items-center justify-between mb-2',
    
    info: 'flex items-center gap-3',
    
    icon: 'w-8 h-8 text-primary flex-shrink-0',
    
    details: 'min-w-0',
    
    name: cn(
      'font-medium text-neutral-900 truncate',
      'text-sm sm:text-base'
    ),
    
    size: cn(
      'text-xs text-neutral-500',
      'sm:text-sm'
    ),
    
    removeButton: cn(
      'text-neutral-400 hover:text-error transition-colors',
      'focus:outline-none focus:text-error',
      'p-1 -m-1'
    ),
  },
  
  // Progress bar styles
  progressBar: {
    container: 'mt-3',
    
    track: 'bg-neutral-200 rounded-full h-2',
    
    fill: cn(
      'bg-primary h-2 rounded-full transition-all duration-300',
      'relative overflow-hidden'
    ),
    
    label: 'text-sm text-neutral-600 mt-1 sm:text-base',
    
    // Animation for indeterminate progress
    indeterminate: cn(
      'bg-gradient-to-r from-primary via-primary-hover to-primary',
      'animate-pulse'
    ),
  },
  
  // Thumbnail styles
  thumbnail: {
    container: cn(
      'relative w-full h-32 border border-neutral-200 rounded-md overflow-hidden',
      'sm:h-40 lg:h-48'
    ),
    
    image: 'object-cover w-full h-full',
    
    placeholder: cn(
      'flex items-center justify-center w-full h-full',
      'bg-neutral-100 text-neutral-400'
    ),
    
    overlay: cn(
      'absolute inset-0 bg-black/50 flex items-center justify-center',
      'opacity-0 hover:opacity-100 transition-opacity duration-200'
    ),
  },
  
  // Cropper styles
  cropper: {
    container: cn(
      'mt-4 bg-neutral-50 p-4 rounded-lg',
      'sm:p-6'
    ),
    
    viewport: cn(
      'relative w-full h-40 bg-neutral-100 rounded',
      'sm:h-48 lg:h-56'
    ),
    
    controls: 'flex flex-col gap-3 mt-4',
    
    controlGroup: 'space-y-2',
    
    controlLabel: 'text-xs text-neutral-600 font-medium',
    
    slider: cn(
      'w-full h-2 bg-neutral-200 rounded-lg appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-primary/20',
      '[&::-webkit-slider-thumb]:appearance-none',
      '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
      '[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full',
      '[&::-webkit-slider-thumb]:cursor-pointer'
    ),
    
    actions: 'flex gap-2 mt-4 justify-end',
  },
  
  // Button styles
  button: {
    primary: cn(
      'px-4 py-2 bg-primary text-white rounded-lg font-medium',
      'hover:bg-primary-hover active:bg-primary-active',
      'focus:outline-none focus:ring-2 focus:ring-primary/20',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-150',
      'sm:px-6 sm:py-3'
    ),
    
    secondary: cn(
      'px-4 py-2 bg-white text-neutral-700 border border-neutral-300 rounded-lg font-medium',
      'hover:bg-neutral-50 active:bg-neutral-100',
      'focus:outline-none focus:ring-2 focus:ring-neutral-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-150',
      'sm:px-6 sm:py-3'
    ),
    
    danger: cn(
      'px-4 py-2 bg-error text-white rounded-lg font-medium',
      'hover:bg-error-dark active:bg-error-dark',
      'focus:outline-none focus:ring-2 focus:ring-error/20',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-150',
      'sm:px-6 sm:py-3'
    ),
    
    ghost: cn(
      'px-4 py-2 text-neutral-600 rounded-lg font-medium',
      'hover:bg-neutral-100 active:bg-neutral-200',
      'focus:outline-none focus:ring-2 focus:ring-neutral-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-150',
      'sm:px-6 sm:py-3'
    ),
  },
  
  // Loading and status indicators
  loading: {
    spinner: cn(
      'animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full',
      'sm:w-5 sm:h-5'
    ),
    
    container: 'flex items-center gap-2',
  },
  
  // Alert and message styles
  alert: {
    base: cn(
      'p-3 rounded-lg border text-sm',
      'sm:p-4 sm:text-base'
    ),
    
    error: cn(
      'bg-error-light border-error text-error-dark',
      'dark:bg-error-dark/10 dark:border-error dark:text-error-light'
    ),
    
    success: cn(
      'bg-success-light border-success text-success-dark',
      'dark:bg-success-dark/10 dark:border-success dark:text-success-light'
    ),
    
    warning: cn(
      'bg-warning-light border-warning text-warning-dark',
      'dark:bg-warning-dark/10 dark:border-warning dark:text-warning-light'
    ),
    
    info: cn(
      'bg-info-light border-info text-info-dark',
      'dark:bg-info-dark/10 dark:border-info dark:text-info-light'
    ),
    
    icon: 'w-5 h-5 flex-shrink-0 mt-0.5',
    
    content: 'flex items-start gap-3',
    
    title: 'font-medium mb-1',
    
    description: 'text-sm opacity-90',
  },
  
  // YouTube embed styles
  embed: {
    container: cn(
      'mt-3 relative w-full rounded-md overflow-hidden',
      'border border-neutral-200'
    ),
    
    iframe: cn(
      'w-full h-48 border-0',
      'sm:h-56 lg:h-64'
    ),
  },
  
  // Form actions
  actions: {
    container: cn(
      'flex gap-3 justify-end pt-4',
      'border-t border-neutral-200',
      'sm:pt-6'
    ),
  },
  
  // Responsive utilities
  responsive: {
    hideOnMobile: 'hidden sm:block',
    hideOnDesktop: 'block sm:hidden',
    stackOnMobile: 'flex flex-col sm:flex-row',
    fullWidthOnMobile: 'w-full sm:w-auto',
  },
} as const

export type VideoUploadStyles = typeof videoUploadStyles