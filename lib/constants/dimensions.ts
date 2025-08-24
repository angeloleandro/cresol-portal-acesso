

// === MODAL & DIALOG SIZES ===
export const MODAL_DIMENSIONS = {
  small: {
    width: 400, // 400px
    maxWidth: 'max-w-md',
    classes: 'w-full max-w-md'
  },
  
  medium: {
    width: 600, // 600px
    maxWidth: 'max-w-lg',
    classes: 'w-full max-w-lg'
  },
  
  large: {
    width: 800, // 800px
    maxWidth: 'max-w-2xl',
    classes: 'w-full max-w-2xl'
  },
  
  xlarge: {
    width: 1000, // 1000px
    maxWidth: 'max-w-4xl',
    classes: 'w-full max-w-4xl'
  },
  
  fullwidth: {
    width: '90vw',
    maxWidth: 'max-w-[90vw]',
    classes: 'w-full max-w-[90vw]'
  }
} as const;

// === CONTAINER MIN-HEIGHTS ===
export const MIN_HEIGHTS = {
  /** Containers pequenos */
  small: {
    pixels: 300, // 300px
    class: 'min-h-[300px]'
  },
  
  /** Containers médios */
  medium: {
    pixels: 400, // 400px
    class: 'min-h-[400px]'
  },
  
  /** Containers grandes */
  large: {
    pixels: 500, // 500px
    class: 'min-h-[500px]'
  },
  
  /** Containers extra grandes */
  xlarge: {
    pixels: 600, // 600px
    class: 'min-h-[600px]'
  },
  
  /** Para galleries e listas */
  gallery: {
    pixels: 500,
    class: 'min-h-[500px]'
  },
  
  /** Para video players */
  videoPlayer: {
    pixels: 600,
    class: 'min-h-[600px]'
  }
} as const;

// === DROPDOWN & MENU SIZES ===
export const DROPDOWN_DIMENSIONS = {
  /** Dropdowns pequenos (filtros) */
  small: {
    minWidth: 200, // 200px
    maxWidth: 250, // 250px
    maxHeight: 200, // 200px
    classes: 'min-w-[200px] max-w-[250px] max-h-[200px]'
  },
  
  /** Dropdowns médios (navegação) */
  medium: {
    minWidth: 250, // 250px
    maxWidth: 300, // 300px
    maxHeight: 300, // 300px
    classes: 'min-w-[250px] max-w-[300px] max-h-[300px]'
  },
  
  /** Dropdowns grandes (seletores complexos) */
  large: {
    minWidth: 300, // 300px
    maxWidth: 400, // 400px
    maxHeight: 400, // 400px
    classes: 'min-w-[300px] max-w-[400px] max-h-[400px]'
  },
  
  /** Dropdowns para usuários/setores */
  userSelect: {
    minWidth: 350, // 350px
    maxWidth: 400, // 400px
    maxHeight: 300, // 300px
    classes: 'min-w-[350px] max-w-[400px] max-h-[300px]'
  },
  
  /** Navbar dropdowns */
  navbar: {
    minWidth: 200, // 200px
    maxWidth: 250, // 250px
    maxHeight: 400, // 400px (para viewport pequeno seria 60vh)
    classes: 'min-w-[200px] max-w-[250px] max-h-[400px] md:max-h-[60vh]'
  }
} as const;

// === FILE UPLOAD LIMITS ===
export const FILE_LIMITS = {
  /** Imagens padrão (10MB) */
  image: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    maxSizeMB: 10,
    label: '10MB'
  },
  
  /** Vídeos (50MB) */
  video: {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    maxSizeMB: 50,
    label: '50MB'
  },
  
  /** Documentos (10MB) */
  document: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    maxSizeMB: 10,
    label: '10MB'
  },
  
  /** Arquivos genéricos (5MB) */
  generic: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    maxSizeMB: 5,
    label: '5MB'
  },
  
  /** Avatar (2MB) */
  avatar: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    maxSizeMB: 2,
    label: '2MB'
  }
} as const;

// === VIDEO & MEDIA DIMENSIONS ===
export const MEDIA_DIMENSIONS = {
  /** Thumbnail padrão */
  thumbnail: {
    width: 150,
    height: 150,
    classes: 'w-[150px] h-[150px]'
  },
  
  /** Video placeholder */
  videoPlaceholder: {
    width: 320,
    height: 180,
    classes: 'w-[320px] h-[180px]'
  },
  
  /** Resolução padrão para screenshots */
  screenshot: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9'
  },
  
  /** Avatar sizes */
  avatar: {
    small: {
      width: 32,
      height: 32,
      classes: 'w-8 h-8'
    },
    medium: {
      width: 48,
      height: 48,
      classes: 'w-12 h-12'
    },
    large: {
      width: 64,
      height: 64,
      classes: 'w-16 h-16'
    }
  }
} as const;

// === CHART & ANALYTICS DIMENSIONS ===
export const CHART_DIMENSIONS = {
  small: {
    minHeight: 300,
    classes: 'min-h-[300px]'
  },
  
  medium: {
    minHeight: 400,
    classes: 'min-h-[400px]'
  },
  
  large: {
    minHeight: 500,
    classes: 'min-h-[500px]'
  },
  
  xlarge: {
    minHeight: 600,
    classes: 'min-h-[600px]'
  }
} as const;

// === ALERT DIMENSIONS ===
export const ALERT_DIMENSIONS = {
  maxWidth: 400, // 400px
  classes: 'max-w-[400px]'
} as const;

// === FORM INPUT DIMENSIONS ===
export const INPUT_DIMENSIONS = {
  /** Input heights padrão */
  height: {
    small: {
      pixels: 32,
      classes: 'h-8'
    },
    medium: {
      pixels: 40,
      classes: 'h-10'
    },
    large: {
      pixels: 48,
      classes: 'h-12'
    }
  },
  
  /** Textarea dimensions */
  textarea: {
    small: {
      rows: 3,
      minHeight: 80,
      classes: 'min-h-[80px]'
    },
    medium: {
      rows: 5,
      minHeight: 120,
      classes: 'min-h-[120px]'
    },
    large: {
      rows: 8,
      minHeight: 200,
      classes: 'min-h-[200px]'
    }
  }
} as const;

// === BREAKPOINT VALUES (for JS usage) ===
export const BREAKPOINT_VALUES = {
  sm: 640,   // 640px
  md: 768,   // 768px
  lg: 1024,  // 1024px
  xl: 1280,  // 1280px
  '2xl': 1536 // 1536px
} as const;

// === CONSOLIDATED EXPORT ===
export const DIMENSION_CONSTANTS = {
  modals: MODAL_DIMENSIONS,
  minHeights: MIN_HEIGHTS,
  dropdowns: DROPDOWN_DIMENSIONS,
  fileLimits: FILE_LIMITS,
  media: MEDIA_DIMENSIONS,
  charts: CHART_DIMENSIONS,
  alerts: ALERT_DIMENSIONS,
  inputs: INPUT_DIMENSIONS,
  breakpoints: BREAKPOINT_VALUES
} as const;

// === HELPER FUNCTIONS ===
export const DIMENSION_HELPERS = {
  /**
   * Convert MB to bytes
   */
  mbToBytes: (mb: number): number => mb * 1024 * 1024,
  
  /**
   * Convert bytes to MB
   */
  bytesToMb: (bytes: number): number => bytes / (1024 * 1024),
  
  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  /**
   * Check if file size is within limit
   */
  isFileSizeValid: (fileSize: number, limit: number): boolean => {
    return fileSize <= limit;
  },
  
  /**
   * Get responsive classes for different screen sizes
   */
  getResponsiveClasses: (
    mobile: string,
    tablet?: string,
    desktop?: string
  ): string => {
    let classes = mobile;
    if (tablet) classes += ` md:${tablet}`;
    if (desktop) classes += ` lg:${desktop}`;
    return classes;
  },
  
  /**
   * Calculate aspect ratio
   */
  calculateAspectRatio: (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  }
} as const;

// === TYPESCRIPT TYPES ===
export type ModalDimensions = typeof MODAL_DIMENSIONS;
export type MinHeights = typeof MIN_HEIGHTS;
export type DropdownDimensions = typeof DROPDOWN_DIMENSIONS;
export type FileLimits = typeof FILE_LIMITS;
export type MediaDimensions = typeof MEDIA_DIMENSIONS;
export type ChartDimensions = typeof CHART_DIMENSIONS;
export type AlertDimensions = typeof ALERT_DIMENSIONS;
export type InputDimensions = typeof INPUT_DIMENSIONS;
export type BreakpointValues = typeof BREAKPOINT_VALUES;
export type DimensionConstants = typeof DIMENSION_CONSTANTS;
export type DimensionHelpers = typeof DIMENSION_HELPERS;