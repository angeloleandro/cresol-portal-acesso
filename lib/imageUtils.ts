/**
 * Utilitários para processamento de imagens do Supabase Storage
 * Otimizado para deployment na Vercel com Image Optimization
 */

// Configurações do Supabase Storage
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_STORAGE_PATH = '/storage/v1/object/public/images/';
const IS_VERCEL = process.env.VERCEL === '1';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Valida se uma URL de imagem é válida para Vercel Image Optimization
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
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
export function processSupabaseImageUrl(url: string | null | undefined): string | null {
  if (!url || !SUPABASE_URL) return null;

  // Se já é uma URL completa válida, retorna ela
  if (isValidImageUrl(url)) {
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
export function getFallbackImageUrl(type: 'avatar' | 'gallery' | 'banner' = 'gallery'): string {
  // Retorna uma URL de imagem padrão baseada no tipo
  switch (type) {
    case 'avatar':
      return '/images/default-avatar.png';
    case 'banner':
      return '/images/default-banner.png';
    case 'gallery':
    default:
      return '/images/default-image.png';
  }
}

/**
 * Otimiza URL de imagem para Vercel Image Optimization
 */
export function optimizeSupabaseImage(
  url: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string | null {
  const processedUrl = processSupabaseImageUrl(url);
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
export async function checkImageAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Hook para debug de imagens em desenvolvimento e Vercel
 */
export function debugImageUrl(url: string | null | undefined, context?: string): void {
  if (process.env.NODE_ENV === 'development' || IS_VERCEL) {
    const debugInfo = {
      originalUrl: url,
      processedUrl: processSupabaseImageUrl(url),
      isValid: isValidImageUrl(url),
      supabaseUrl: SUPABASE_URL,
      environment: {
        isVercel: IS_VERCEL,
        isProduction: IS_PRODUCTION,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    console.log(`[Image Debug${context ? ` - ${context}` : ''}]:`, debugInfo);
    
    // Log adicional se a URL não for válida
    if (!isValidImageUrl(url)) {
      console.warn(`[Image Warning] URL inválida detectada: ${url}`);
    }
  }
}

/**
 * Função para verificar compatibilidade com Vercel Image Optimization
 */
export function checkVercelCompatibility(url: string | null | undefined): {
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