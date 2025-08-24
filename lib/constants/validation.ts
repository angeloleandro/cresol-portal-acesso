

// === TEXT LENGTH LIMITS ===
export const TEXT_LIMITS = {
  /** Títulos padrão */
  title: {
    min: 3,
    max: 255,
    default: 100
  },
  
  /** Descrições curtas */
  shortDescription: {
    min: 10,
    max: 500,
    default: 255
  },
  
  /** Descrições longas */
  longDescription: {
    min: 20,
    max: 2000,
    default: 1000
  },
  
  /** Conteúdo completo (notícias, etc.) */
  content: {
    min: 20,
    max: 10000,
    default: 5000
  },
  
  /** Nomes (usuários, setores, etc.) */
  name: {
    min: 2,
    max: 100,
    default: 50
  },
  
  /** URLs */
  url: {
    min: 10,
    max: 500,
    default: 255
  },
  
  /** Emails */
  email: {
    min: 5,
    max: 255,
    default: 100
  },
  
  /** Telefones */
  phone: {
    min: 10,
    max: 18,
    default: 15
  },
  
  /** Senhas */
  password: {
    min: 8,
    max: 128,
    default: 50
  },
  
  /** Comentários */
  comment: {
    min: 5,
    max: 1000,
    default: 500
  },
  
  /** Tags */
  tag: {
    min: 2,
    max: 30,
    default: 20
  },
  
  /** Slugs/IDs */
  slug: {
    min: 3,
    max: 100,
    default: 50
  },
  
  /** Codigos (codigos de setor, etc.) */
  code: {
    min: 2,
    max: 10,
    default: 5
  },
  
  /** Localizacao */
  location: {
    min: 3,
    max: 255,
    default: 100
  },
  
  /** Tipos de arquivo */
  fileType: {
    min: 2,
    max: 50,
    default: 20
  }
} as const;

// === NUMERIC LIMITS ===
export const NUMERIC_LIMITS = {
  /** IDs de banco de dados */
  id: {
    min: 1,
    max: 999999999
  },
  
  /** Ordering/Position */
  position: {
    min: 0,
    max: 9999
  },
  
  /** Percentuais */
  percentage: {
    min: 0,
    max: 100
  },
  
  /** Ratings/Scores */
  rating: {
    min: 1,
    max: 5
  },
  
  /** Prioridades */
  priority: {
    min: 1,
    max: 10
  },
  
  /** Peso/Weight */
  weight: {
    min: 0,
    max: 1000
  }
} as const;

// === PAGINATION LIMITS ===
export const PAGINATION_LIMITS = {
  /** Limite padrão por página */
  default: 10,
  
  /** Limite mínimo */
  min: 1,
  
  /** Limite máximo */
  max: 100,
  
  /** Opções comuns de items per page */
  options: [10, 20, 50, 100],
  
  /** Para listagens de home/preview */
  preview: {
    news: 4,
    events: 5,
    videos: 6,
    gallery: 8,
    messages: 3,
    documents: 3,
    systems: 6
  },
  
  /** Para listagens administrativas */
  admin: {
    users: 20,
    sectors: 50,
    content: 10,
    logs: 50
  },
  
  /** Para busca global */
  search: {
    systems: 3,
    events: 2,
    news: 2,
    documents: 1,
    sectors: 2,
    subsectors: 2,
    messages: 1,
    videos: 1
  }
} as const;

// === FILE VALIDATION ===
export const FILE_VALIDATION = {
  /** Tipos de arquivo permitidos */
  allowedTypes: {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
  },
  
  /** Extensões permitidas */
  allowedExtensions: {
    images: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    videos: ['.mp4', '.webm', '.ogg', '.avi', '.mov'],
    documents: ['.pdf', '.doc', '.docx', '.txt'],
    audio: ['.mp3', '.wav', '.ogg'],
    archives: ['.zip', '.rar', '.7z']
  }
} as const;

// === FORM VALIDATION PATTERNS ===
export const VALIDATION_PATTERNS = {
  /** Email regex */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  /** URL regex (http/https) */
  url: /^https?:\/\/.+$/,
  
  /** Phone regex (formato brasileiro) */
  phone: /^(\+55\s?)?\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/,
  
  /** CEP regex */
  cep: /^[0-9]{5}-?[0-9]{3}$/,
  
  /** CPF regex */
  cpf: /^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}$/,
  
  /** CNPJ regex */
  cnpj: /^[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}-?[0-9]{2}$/,
  
  /** Slug regex (URL-friendly) */
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  /** Username regex */
  username: /^[a-zA-Z0-9_.-]+$/,
  
  /** Password strength (pelo menos uma letra, um número, 8+ chars) */
  passwordStrong: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  
  /** Cor HEX */
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  /** YouTube URL */
  youtubeUrl: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
  
  /** Números apenas */
  numbersOnly: /^\d+$/,
  
  /** Letras apenas */
  lettersOnly: /^[A-Za-z\s]+$/,
  
  /** Alfanumérico */
  alphanumeric: /^[A-Za-z0-9]+$/
} as const;

// === VALIDATION ERROR MESSAGES ===
export const VALIDATION_ERROR_MESSAGES = {
  required: 'Este campo é obrigatório',
  
  length: {
    min: (min: number) => `Mínimo de ${min} caracteres`,
    max: (max: number) => `Máximo de ${max} caracteres`,
    exact: (length: number) => `Deve ter exatamente ${length} caracteres`
  },
  
  format: {
    email: 'Email inválido',
    url: 'URL inválida (deve começar com http:// ou https://)',
    phone: 'Telefone inválido',
    cep: 'CEP inválido (formato: 00000-000)',
    cpf: 'CPF inválido',
    cnpj: 'CNPJ inválido',
    password: 'Senha deve ter pelo menos 8 caracteres com letras e números',
    hexColor: 'Cor deve estar no formato #RRGGBB',
    slug: 'Apenas letras minúsculas, números e hífens'
  },
  
  file: {
    size: (maxSize: string) => `Arquivo muito grande. Máximo ${maxSize}`,
    type: (allowedTypes: string) => `Tipo não permitido. Permitidos: ${allowedTypes}`,
    required: 'Arquivo é obrigatório'
  },
  
  numeric: {
    min: (min: number) => `Valor mínimo: ${min}`,
    max: (max: number) => `Valor máximo: ${max}`,
    positive: 'Deve ser um número positivo',
    integer: 'Deve ser um número inteiro'
  },
  
  date: {
    invalid: 'Data inválida',
    future: 'Data deve estar no futuro',
    past: 'Data deve estar no passado'
  }
} as const;

// === INPUT CONSTRAINTS ===
export const INPUT_CONSTRAINTS = {
  textarea: {
    /** Número máximo de caracteres visível no textarea */
    maxLength: {
      short: 500,
      medium: 1000,
      long: 10000
    },
    
    /** Rows padrão para textareas */
    rows: {
      small: 3,
      medium: 5,
      large: 8
    }
  },
  
  select: {
    /** Limite de opções visíveis no dropdown */
    maxVisibleOptions: 10,
    
    /** Altura máxima do dropdown */
    maxHeight: 300 // pixels
  },
  
  multiselect: {
    /** Máximo de items selecionáveis */
    maxSelected: 50,
    
    /** Máximo de items visíveis */
    maxVisible: 100
  },
  
  search: {
    /** Mínimo de caracteres para começar busca */
    minChars: 2,
    
    /** Debounce delay para busca */
    debounceMs: 300
  }
} as const;

// === CONSOLIDATED EXPORT ===
export const VALIDATION_CONSTANTS = {
  text: TEXT_LIMITS,
  numeric: NUMERIC_LIMITS,
  pagination: PAGINATION_LIMITS,
  files: FILE_VALIDATION,
  patterns: VALIDATION_PATTERNS,
  messages: VALIDATION_ERROR_MESSAGES,
  inputs: INPUT_CONSTRAINTS
} as const;

// === VALIDATION HELPER FUNCTIONS ===
export const VALIDATION_HELPERS = {
  /**
   * Validate text length
   */
  validateTextLength: (
    text: string, 
    limits: { min: number; max: number }
  ): { isValid: boolean; error?: string } => {
    if (text.length < limits.min) {
      return { isValid: false, error: VALIDATION_ERROR_MESSAGES.length.min(limits.min) };
    }
    if (text.length > limits.max) {
      return { isValid: false, error: VALIDATION_ERROR_MESSAGES.length.max(limits.max) };
    }
    return { isValid: true };
  },
  
  /**
   * Validate email format
   */
  validateEmail: (email: string): boolean => {
    return VALIDATION_PATTERNS.email.test(email);
  },
  
  /**
   * Validate URL format
   */
  validateUrl: (url: string): boolean => {
    return VALIDATION_PATTERNS.url.test(url);
  },
  
  /**
   * Validate file type
   */
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
  
  /**
   * Validate file size
   */
  validateFileSize: (file: File, maxSizeBytes: number): boolean => {
    return file.size <= maxSizeBytes;
  },
  
  /**
   * Get file type category
   */
  getFileTypeCategory: (mimeType: string): string | null => {
    if (FILE_VALIDATION.allowedTypes.images.includes(mimeType as any)) return 'image';
    if (FILE_VALIDATION.allowedTypes.videos.includes(mimeType as any)) return 'video';
    if (FILE_VALIDATION.allowedTypes.documents.includes(mimeType as any)) return 'document';
    if (FILE_VALIDATION.allowedTypes.audio.includes(mimeType as any)) return 'audio';
    if (FILE_VALIDATION.allowedTypes.archives.includes(mimeType as any)) return 'archive';
    return null;
  },
  
  /**
   * Format validation error message
   */
  formatValidationError: (field: string, error: string): string => {
    return `${field}: ${error}`;
  },
  
  /**
   * Validate YouTube URL and extract video ID
   */
  extractYouTubeId: (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  },
  
  /**
   * Sanitize string for slug
   */
  sanitizeSlug: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
} as const;

// === TYPESCRIPT TYPES ===
export type TextLimits = typeof TEXT_LIMITS;
export type NumericLimits = typeof NUMERIC_LIMITS;
export type PaginationLimits = typeof PAGINATION_LIMITS;
export type FileValidation = typeof FILE_VALIDATION;
export type ValidationPatterns = typeof VALIDATION_PATTERNS;
export type ValidationMessages = typeof VALIDATION_ERROR_MESSAGES;
export type InputConstraints = typeof INPUT_CONSTRAINTS;
export type ValidationConstants = typeof VALIDATION_CONSTANTS;
export type ValidationHelpers = typeof VALIDATION_HELPERS;