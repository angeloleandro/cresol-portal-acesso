/**
 * Trunca URLs longas de forma inteligente mantendo legibilidade
 * --ultrathink: Sistema inteligente que preserva domínio e final da URL
 */

/**
 * Lista de protocolos seguros permitidos
 */
const SAFE_PROTOCOLS = ['http:', 'https:'];

interface TruncateUrlOptions {
  maxLength?: number;
  showDomain?: boolean;
  showProtocol?: boolean;
  ellipsis?: string;
}

export function truncateUrl(url: string | undefined, options: TruncateUrlOptions = {}): string {
  const {
    maxLength = 50,
    showDomain = true,
    showProtocol = false,
    ellipsis = '...'
  } = options;

  if (!url) {
    return '';
  }
  
  if (url.length <= maxLength) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Validar protocolo contra lista de protocolos seguros
    if (!SAFE_PROTOCOLS.includes(urlObj.protocol)) {
      return ''; // Retorna string vazia para protocolos perigosos
    }
    
    // Verificar se host existe
    if (!urlObj.host) {
      return '';
    }
    
    const protocol = showProtocol ? `${urlObj.protocol}//` : '';
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search + urlObj.hash;

    if (showDomain && domain) {
      const domainPart = `${protocol}${domain}`;
      const remainingLength = maxLength - domainPart.length - ellipsis.length;

      if (remainingLength > 0 && path.length > remainingLength) {
        // Mostra domínio + início do path + ellipsis + final do path
        const startLen = Math.max(1, Math.floor(remainingLength / 2));
        const endLen = Math.max(1, remainingLength - startLen);
        const startPath = path.substring(0, startLen);
        const endPath = path.substring(path.length - endLen);
        return `${domainPart}${startPath}${ellipsis}${endPath}`;
      }
      
      if (remainingLength > 0) {
        const truncatedPath = path.substring(0, remainingLength);
        return path.length > remainingLength 
          ? `${domainPart}${truncatedPath}…` 
          : `${domainPart}${truncatedPath}`;
      }
      
      // Se o domínio já é muito grande, trunca ele também
      if (domainPart.length > maxLength - ellipsis.length) {
        return `${domainPart.substring(0, maxLength - ellipsis.length)}${ellipsis}`;
      }
      
      return domainPart;
    }

    // Fallback: truncamento simples no meio
    const startLength = Math.ceil((maxLength - ellipsis.length) / 2);
    const endLength = Math.floor((maxLength - ellipsis.length) / 2);
    
    return `${url.substring(0, startLength)}${ellipsis}${url.substring(url.length - endLength)}`;

  } catch (error) {
    // Se não for uma URL válida, faz truncamento simples
    if (url.length <= maxLength) return url;
    
    const startLength = Math.ceil((maxLength - ellipsis.length) / 2);
    const endLength = Math.floor((maxLength - ellipsis.length) / 2);
    
    return `${url.substring(0, startLength)}${ellipsis}${url.substring(url.length - endLength)}`;
  }
}

/**
 * Variante específica para cards de banner
 */
export function truncateBannerLink(url: string): string {
  return truncateUrl(url, {
    maxLength: 60,
    showDomain: true,
    showProtocol: false,
    ellipsis: '…'
  });
}

/**
 * Variante para tooltips/títulos completos com validação de segurança
 */
export function formatUrlForTooltip(url: string | undefined): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // Validar protocolo contra lista de protocolos seguros
    if (!SAFE_PROTOCOLS.includes(urlObj.protocol)) {
      return ''; // Retorna string vazia para protocolos perigosos
    }
    
    // Verificar se host existe
    if (!urlObj.host) {
      return '';
    }
    
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
  } catch {
    return ''; // Retorna string vazia em caso de erro de parse
  }
}