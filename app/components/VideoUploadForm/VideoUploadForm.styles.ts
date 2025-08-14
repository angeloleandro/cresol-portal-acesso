/**
 * VideoUploadForm Design System Styles
 * Consistent CSS classes using design tokens and mobile-first responsive design
 */

import { cn } from '@/lib/utils/cn'
import { videoSystemTokens, videoComponentTokens } from '@/lib/design-tokens/video-system'

export const videoUploadStyles = {
  // Container styles - Enterprise Professional Modal
  container: cn(
    'bg-white rounded-lg border border-slate-200 p-0 max-w-3xl mx-auto',
    'shadow-lg shadow-slate-900/10 backdrop-blur-sm',
    'overflow-hidden max-h-[85vh] flex flex-col',
    'scrollbar-modal' // Apply professional scrollbar
  ),
  
  // Header styles - Professional Modal Header
  header: {
    container: cn(
      'px-6 py-5 border-b border-slate-200 bg-slate-50/50',
      'flex items-center justify-between flex-shrink-0'
    ),
    
    title: cn(
      'text-xl font-semibold text-slate-900',
      'sm:text-2xl font-medium tracking-tight'
    ),
    
    subtitle: cn(
      'text-sm text-slate-600 mt-1',
      'sm:text-base'
    ),
    
    badge: cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      'bg-orange-100 text-orange-800 border border-orange-200'
    ),
  },
  
  // Form layout - Enterprise Professional
  form: {
    root: cn(
      'flex-1 overflow-y-auto scrollbar-modal px-6 py-6',
      'space-y-8 min-h-0' // Ensure flex-child can shrink
    ),
    
    section: cn(
      'space-y-4 p-4 rounded-lg border border-slate-100 bg-slate-50/30',
      'hover:border-slate-200 transition-colors duration-200'
    ),
    
    sectionTitle: cn(
      'text-base font-medium text-slate-800 mb-3',
      'flex items-center gap-2'
    ),
    
    fieldGroup: cn(
      'grid gap-4',
      'grid-cols-1',
      'sm:grid-cols-2'
    ),
    
    field: 'space-y-2',
    
    label: cn(
      'block text-sm font-medium text-slate-700',
      'flex items-center gap-1'
    ),
    
    required: 'text-orange-500 text-sm',
    
    helpText: cn(
      'text-xs text-slate-500',
      'sm:text-sm leading-relaxed'
    ),
  },
  
  // Input styles - Modern Professional
  input: {
    base: cn(
      'w-full border border-slate-300 rounded-lg px-4 py-3',
      'text-sm placeholder-slate-400 bg-white',
      'focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500',
      'hover:border-slate-400 transition-all duration-200',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50',
      'shadow-sm'
    ),
    
    error: cn(
      'border-red-400 focus:border-red-500 focus:ring-red-500/20',
      'bg-red-50/50'
    ),
    
    success: cn(
      'border-green-400 focus:border-green-500 focus:ring-green-500/20',
      'bg-green-50/50'
    ),
  },
  
  // Radio and checkbox styles - Professional Design
  radioGroup: {
    container: 'flex gap-6',
    
    option: cn(
      'flex items-center gap-3 cursor-pointer p-3 rounded-lg',
      'border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50',
      'transition-all duration-200 text-sm font-medium',
      'checked:border-orange-300 checked:bg-orange-50/50'
    ),
    
    input: cn(
      'w-4 h-4 text-orange-500 border-slate-300 rounded-full',
      'focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2',
      'transition-all duration-200'
    ),
    
    label: 'text-slate-700 font-medium',
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
  
  // Button styles - Enterprise Professional
  button: {
    primary: cn(
      'px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold',
      'hover:bg-orange-600 active:bg-orange-700',
      'focus:outline-none focus:ring-3 focus:ring-orange-500/30 focus:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'transition-all duration-200 shadow-sm hover:shadow-md',
      'inline-flex items-center gap-2 min-h-[44px]'
    ),
    
    secondary: cn(
      'px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold',
      'hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
      'focus:outline-none focus:ring-3 focus:ring-slate-300/30 focus:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'transition-all duration-200 shadow-sm hover:shadow-md',
      'inline-flex items-center gap-2 min-h-[44px]'
    ),
    
    danger: cn(
      'px-6 py-3 bg-red-500 text-white rounded-lg font-semibold',
      'hover:bg-red-600 active:bg-red-700',
      'focus:outline-none focus:ring-3 focus:ring-red-500/30 focus:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'transition-all duration-200 shadow-sm hover:shadow-md',
      'inline-flex items-center gap-2 min-h-[44px]'
    ),
    
    ghost: cn(
      'px-6 py-3 text-slate-600 rounded-lg font-semibold',
      'hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200',
      'focus:outline-none focus:ring-3 focus:ring-slate-300/30 focus:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'transition-all duration-200',
      'inline-flex items-center gap-2 min-h-[44px]'
    ),
  },
  
  // Loading and status indicators
  loading: {
    spinner: cn(
      'w-4 h-4', // Use UnifiedLoadingSpinner component instead
      'sm:w-5 sm:h-5'
    ),
    
    container: 'flex items-center gap-2',
  },
  
  // Alert and message styles
  alert: {
    base: cn(
      'p-4 rounded-lg border text-sm',
      'sm:p-5 sm:text-base'
    ),
    
    error: cn(
      'bg-red-50 border-red-200 text-red-800',
      'dark:bg-red-900/10 dark:border-red-800 dark:text-red-300'
    ),
    
    success: cn(
      'bg-green-50 border-green-200 text-green-800',
      'dark:bg-green-900/10 dark:border-green-800 dark:text-green-300'
    ),
    
    warning: cn(
      'bg-amber-50 border-amber-200 text-amber-800',
      'dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-300'
    ),
    
    info: cn(
      'bg-blue-50 border-blue-200 text-blue-800',
      'dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-300'
    ),
    
    icon: 'w-5 h-5 flex-shrink-0 text-current',
    
    content: 'flex items-start gap-3',
    
    title: 'font-semibold text-base mb-1',
    
    description: 'text-sm leading-relaxed',
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
  
  // Form actions - Professional Footer
  actions: {
    container: cn(
      'flex gap-3 justify-end px-6 py-4 border-t border-slate-200',
      'bg-slate-50/50 flex-shrink-0'
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