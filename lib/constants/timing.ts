

// === ALERT & NOTIFICATION DURATIONS ===
export const ALERT_TIMING = {
  /** Duração padrão para toasts e alertas */
  duration: 3000, // 3s
  
  /** Tempo de fade out para alertas */
  fadeOut: 500, // 500ms
  
  /** Duração para alertas de sucesso */
  success: 3000,
  
  /** Duração para alertas de erro (mais tempo para leitura) */
  error: 5000,
  
  /** Duração para alertas de warning */
  warning: 4000,
  
  /** Duração para alertas informativas */
  info: 3000
} as const;

// === REQUEST TIMEOUTS ===
export const REQUEST_TIMING = {
  /** Timeout padrão para requisições API */
  timeout: 30000, // 30s
  
  /** Timeout para long polling */
  longPoll: 300000, // 5min
  
  /** Timeout para requisições de autenticação */
  auth: 10000, // 10s
  
  /** Timeout para uploads de arquivo */
  upload: 120000, // 2min
  
  /** Timeout para operações críticas */
  critical: 60000, // 1min
  
  /** Timeout para operações em background */
  background: 5000 // 5s
} as const;

// === ANIMATION DURATIONS ===
export const ANIMATION_TIMING = {
  /** Animações rápidas (hover, focus) */
  fast: 150, // 150ms
  
  /** Animações normais (transições padrão) */
  normal: 200, // 200ms
  
  /** Animações lentas (smooth transitions) */
  slow: 300, // 300ms
  
  /** Animações muito lentas (complex effects) */
  slower: 500, // 500ms
  
  /** Animações de 1 segundo */
  long: 1000, // 1s
  
  /** Shimmer/loading animations */
  shimmer: 2000, // 2s
  
  /** Pulse slow animation */
  pulseUser: 3000 // 3s
} as const;

// === DEBOUNCE & THROTTLE ===
export const DEBOUNCE_TIMING = {
  /** Search input debounce */
  search: 300, // 300ms
  
  /** Resize event debounce */
  resize: 250, // 250ms
  
  /** Form validation debounce */
  validation: 500, // 500ms
  
  /** API call debounce */
  apiCall: 1000, // 1s
  
  /** Scroll event throttle */
  scroll: 100, // 100ms
  
  /** Mouse movement throttle */
  mousemove: 50 // 50ms
} as const;

// === LOADING & PROCESSING ===
export const LOADING_TIMING = {
  /** Minimum loading spinner display time */
  minSpinnerTime: 500, // 500ms
  
  /** Skeleton loading duration */
  skeleton: 1000, // 1s
  
  /** Image loading timeout */
  imageLoad: 5000, // 5s
  
  /** Video processing timeout */
  videoProcessing: 30000, // 30s
  
  /** Cleanup timeout for resources */
  cleanup: 300, // 300ms
  
  /** Retry delay for failed operations */
  retry: 1000 // 1s
} as const;

// === RETRY & BACKOFF ===
export const RETRY_TIMING = {
  /** Initial retry delay */
  initial: 1000, // 1s
  
  /** Exponential backoff multiplier */
  backoffMultiplier: 2,
  
  /** Maximum retry delay */
  maxDelay: 5000, // 5s
  
  /** Maximum number of retry attempts */
  maxAttempts: 3,
  
  /** Jitter to prevent thundering herd */
  jitter: 100 // 100ms
} as const;

// === AUTO-SAVE & PERIODIC OPERATIONS ===
export const PERIODIC_TIMING = {
  /** Auto-save interval */
  autoSave: 30000, // 30s
  
  /** Data refresh interval */
  dataRefresh: 60000, // 1min
  
  /** Connection heartbeat */
  heartbeat: 15000, // 15s
  
  /** Cache invalidation check */
  cacheCheck: 300000, // 5min
  
  /** Session renewal check */
  sessionCheck: 300000 // 5min
} as const;

// === MODAL & OVERLAY ===
export const MODAL_TIMING = {
  /** Modal entrada/saída */
  enter: 250, // 250ms
  exit: 200, // 200ms
  
  /** Backdrop fade */
  backdrop: 150, // 150ms
  
  /** Tooltip delays */
  tooltipDelay: 500, // 500ms
  tooltipHide: 100, // 100ms
  
  /** Dropdown animation */
  dropdown: 200 // 200ms
} as const;

// === PAGE TRANSITION ===
export const PAGE_TIMING = {
  /** Page load timeout */
  pageLoad: 5000, // 5s
  
  /** Route transition */
  routeTransition: 300, // 300ms
  
  /** Component mount delay */
  mountDelay: 100, // 100ms
  
  /** Lazy loading intersection delay */
  lazyLoad: 200 // 200ms
} as const;

// === CONSOLIDATED EXPORT ===
export const TIMING_CONSTANTS = {
  alerts: ALERT_TIMING,
  requests: REQUEST_TIMING,
  animations: ANIMATION_TIMING,
  debounce: DEBOUNCE_TIMING,
  loading: LOADING_TIMING,
  retry: RETRY_TIMING,
  periodic: PERIODIC_TIMING,
  modal: MODAL_TIMING,
  page: PAGE_TIMING
} as const;

// === HELPER FUNCTIONS ===
export const TIMING_HELPERS = {
  /**
   * Create a delay promise
   */
  delay: (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Calculate exponential backoff delay
   */
  exponentialBackoff: (attempt: number, baseDelay: number = RETRY_TIMING.initial): number => 
    Math.min(baseDelay * Math.pow(RETRY_TIMING.backoffMultiplier, attempt - 1), RETRY_TIMING.maxDelay),
  
  /**
   * Add jitter to prevent thundering herd
   */
  addJitter: (delay: number, jitterPercent: number = 0.1): number => 
    delay + (Math.random() * delay * jitterPercent),
  
  /**
   * Convert milliseconds to seconds
   */
  msToSeconds: (ms: number): number => ms / 1000,
  
  /**
   * Convert seconds to milliseconds
   */
  secondsToMs: (seconds: number): number => seconds * 1000
} as const;

// === QUICK ACCESS EXPORT ===
// Para compatibilidade com imports existentes - versão simplificada
export const TIMINGS = {
  alertDuration: ALERT_TIMING.duration,     // 3000ms
  requestTimeout: REQUEST_TIMING.timeout,   // 30000ms
  animationNormal: ANIMATION_TIMING.normal, // 200ms
  animationFast: ANIMATION_TIMING.fast,     // 150ms
  debounceSearch: DEBOUNCE_TIMING.search,   // 300ms
  retryDelay: RETRY_TIMING.initial,         // 1000ms
  modalTransition: MODAL_TIMING.enter,      // 250ms
  loadingMinTime: LOADING_TIMING.minSpinnerTime // 500ms
} as const;

// === TYPESCRIPT TYPES ===
export type AlertTiming = typeof ALERT_TIMING;
export type RequestTiming = typeof REQUEST_TIMING;
export type AnimationTiming = typeof ANIMATION_TIMING;
export type DebounceTiming = typeof DEBOUNCE_TIMING;
export type LoadingTiming = typeof LOADING_TIMING;
export type RetryTiming = typeof RETRY_TIMING;
export type PeriodicTiming = typeof PERIODIC_TIMING;
export type ModalTiming = typeof MODAL_TIMING;
export type PageTiming = typeof PAGE_TIMING;
export type TimingConstants = typeof TIMING_CONSTANTS;
export type TimingHelpers = typeof TIMING_HELPERS;
export type Timings = typeof TIMINGS;