import { logger } from './production-logger';




// Configurações do Supabase Storage
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_STORAGE_PATH = '/storage/v1/object/public/images/';
const IS_VERCEL = process.env.VERCEL === '1';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Valida se uma URL de imagem é válida para Vercel Image Optimization
 */
/**
 * isValidImageUrl function
 * @todo Add proper documentation
 */
export function IsValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    // Verificar se é HTTPS (obrigatório para Vercel)
    if (parsedUrl.protocol !== 'https:') return false;
    
    // Verificar se é do Supabase (domínio permitido)
    const isSupabaseDomain = parsedUrl.hostname.includes('supabase.co');
    
    // Verificar se o path está correto
    const isValidPath = parsedUrl.pathname.includes('/storage/v1/object/public/');
    
    return isSupabaseDomain && isValidPath;
  } catch {
    return false;
  }
}

/**
 * Processa URL do Supabase Storage para garantir que está correta
 */
/**
 * processSupabaseImageUrl function
 * @todo Add proper documentation
 */
export function ProcessSupabaseImageUrl(url: string | null | undefined): string | null {
  if (!url || !SUPABASE_URL) return null;

  // Se já é uma URL completa válida, retorna ela
  if (IsValidImageUrl(url)) {
    return url;
  }

  // Se é apenas o path, constrói a URL completa
  if (typeof url === 'string' && !url.startsWith('http')) {
    // Remove barra inicial se existir
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${SUPABASE_URL}${SUPABASE_STORAGE_PATH}${cleanPath}`;
  }

  return null;
}

/**
 * Gera URL de fallback para imagem padrão
 */
/**
 * getFallbackImageUrl function
 * @todo Add proper documentation
 */
export function GetFallbackImageUrl(type: 'avatar' | 'gallery' | 'banner' = 'gallery'): string {
  // Retorna uma URL de imagem padrão baseada no tipo (SVG otimizado)
  switch (type) {
    case 'avatar':
      return '/images/avatar-placeholder.svg';
    case 'banner':
      return '/images/banner-placeholder.svg';
    case 'gallery':
    default:
      return '/images/placeholder.svg';
  }
}

/**
 * Otimiza URL de imagem para Vercel Image Optimization
 */
/**
 * optimizeSupabaseImage function
 * @todo Add proper documentation
 */
export function OptimizeSupabaseImage(
  url: string | null | undefined,
  _options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string | null {
  const processedUrl = ProcessSupabaseImageUrl(url);
  if (!processedUrl) return null;

  // Na Vercel, a otimização é feita automaticamente pelo Next.js
  // Não precisamos adicionar parâmetros manualmente
  if (IS_VERCEL) {
    return processedUrl;
  }

  // Para desenvolvimento local, podemos adicionar parâmetros se necessário
  return processedUrl;
}

/**
 * Verifica se a imagem está acessível
 */
/**
 * checkImageAccessibility function
 * @todo Add proper documentation
 */
export async function checkImageAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Faz retry de carregamento de imagem com exponential backoff
 */
export async function RetryImageLoad(
  url: string, 
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<boolean> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const accessible = await checkImageAccessibility(url);
      if (accessible) {
        logger.debug(`Imagem carregada com sucesso na tentativa ${attempt + 1}`, { url });
        return true;
      }
    } catch (error) {
      logger.warn(`Erro na tentativa ${attempt + 1} de carregar imagem`, { url, error });
    }
    
    // Se não é a última tentativa, aplica delay exponencial
    if (attempt < maxRetries) {
      const delay = Math.min(initialDelay * Math.pow(2, attempt), 8000);
      logger.debug(`Aguardando ${delay}ms antes da próxima tentativa`, { url, attempt: attempt + 1 });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  logger.error(`Falha ao carregar imagem após ${maxRetries + 1} tentativas`, { url });
  return false;
}

/**
 * Circuit breaker para URLs com falhas repetidas
 */
class ImageCircuitBreaker {
  private failureCount = new Map<string, number>();
  private lastFailureTime = new Map<string, number>();
  private readonly failureThreshold = 5;
  private readonly resetTimeoutMs = 300000; // 5 minutos
  
  canAttempt(url: string): boolean {
    const failures = this.failureCount.get(url) || 0;
    const lastFailure = this.lastFailureTime.get(url) || 0;
    
    // Se excedeu threshold, verifica se já passou o timeout de reset
    if (failures >= this.failureThreshold) {
      const timeSinceLastFailure = Date.now() - lastFailure;
      if (timeSinceLastFailure < this.resetTimeoutMs) {
        return false; // Circuit breaker está aberto
      } else {
        // Reset o circuit breaker
        this.failureCount.set(url, 0);
        this.lastFailureTime.delete(url);
      }
    }
    
    return true;
  }
  
  recordSuccess(url: string): void {
    this.failureCount.set(url, 0);
    this.lastFailureTime.delete(url);
  }
  
  recordFailure(url: string): void {
    const currentFailures = this.failureCount.get(url) || 0;
    this.failureCount.set(url, currentFailures + 1);
    this.lastFailureTime.set(url, Date.now());
  }
}

const imageCircuitBreaker = new ImageCircuitBreaker();

/**
 * Carrega imagem com circuit breaker e retry logic
 */
export async function LoadImageWithCircuitBreaker(url: string): Promise<boolean> {
  if (!imageCircuitBreaker.canAttempt(url)) {
    logger.warn('Circuit breaker impediu tentativa de carregamento', { url });
    return false;
  }
  
  const success = await RetryImageLoad(url);
  
  if (success) {
    imageCircuitBreaker.recordSuccess(url);
  } else {
    imageCircuitBreaker.recordFailure(url);
  }
  
  return success;
}

/**
 * Preload de imagem com timeout customizado
 */
export async function PreloadImageWithTimeout(
  url: string,
  timeoutMs: number = 10000
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      logger.warn('Timeout no preload da imagem', { url, timeoutMs });
      resolve(false);
    }, timeoutMs);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      logger.debug('Imagem preloaded com sucesso', { url });
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      logger.warn('Erro no preload da imagem', { url });
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Hook para debug de imagens em desenvolvimento e Vercel
 */
/**
 * debugImageUrl function
 * @todo Add proper documentation
 */
export function DebugImageUrl(url: string | null | undefined, context?: string): void {
  if (process.env.NODE_ENV === 'development' || IS_VERCEL) {
    const debugInfo = {
      originalUrl: url,
      processedUrl: ProcessSupabaseImageUrl(url),
      isValid: IsValidImageUrl(url),
      supabaseUrl: SUPABASE_URL,
      environment: {
        isVercel: IS_VERCEL,
        isProduction: IS_PRODUCTION,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    logger.debug(`Image Debug${context ? ` - ${context}` : ''}`, debugInfo);
    
    // Log adicional se a URL não for válida
    if (!IsValidImageUrl(url)) {
      logger.warn('URL inválida detectada', { url });
    }
  }
}

/**
 * Função para verificar compatibilidade com Vercel Image Optimization
 */
/**
 * checkVercelCompatibility function
 * @todo Add proper documentation
 */
export function CheckVercelCompatibility(url: string | null | undefined): {
  isCompatible: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!url) {
    issues.push('URL não fornecida');
    return { isCompatible: false, issues, recommendations };
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Verificar protocolo HTTPS
    if (parsedUrl.protocol !== 'https:') {
      issues.push('Protocolo deve ser HTTPS');
      recommendations.push('Alterar para HTTPS');
    }
    
    // Verificar domínio permitido
    if (!parsedUrl.hostname.includes('supabase.co')) {
      issues.push('Domínio não está na lista de remotePatterns');
      recommendations.push('Adicionar domínio ao next.config.js');
    }
    
    // Verificar path correto
    if (!parsedUrl.pathname.includes('/storage/v1/object/public/')) {
      issues.push('Path não corresponde ao padrão esperado');
      recommendations.push('Verificar se o arquivo está no bucket correto');
    }
    
  } catch {
    issues.push('URL mal formada');
    recommendations.push('Verificar formato da URL');
  }
  
  return {
    isCompatible: issues.length === 0,
    issues,
    recommendations
  };
}

// === COMPATIBILITY EXPORTS ===
// Export camelCase versions for backward compatibility with existing imports
export const processSupabaseImageUrl = ProcessSupabaseImageUrl;
export const isValidImageUrl = IsValidImageUrl;  
export const getFallbackImageUrl = GetFallbackImageUrl;
export const optimizeSupabaseImage = OptimizeSupabaseImage;
export const debugImageUrl = DebugImageUrl;
export const retryImageLoad = RetryImageLoad;
export const loadImageWithCircuitBreaker = LoadImageWithCircuitBreaker;
export const preloadImageWithTimeout = PreloadImageWithTimeout;