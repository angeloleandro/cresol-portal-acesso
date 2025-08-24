import { NextRequest } from 'next/server';




interface RateLimiterOptions {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Número máximo de requisições na janela
  keyGenerator?: (request: NextRequest) => string; // Função para gerar chave única
  skipSuccessfulRequests?: boolean; // Não contar requisições bem-sucedidas
  skipFailedRequests?: boolean; // Não contar requisições falhadas
}

interface RateLimiterEntry {
  count: number;
  resetTime: number;
}

// Cache em memória para rate limiting (em produção, usar Redis)
const rateLimitStore = new Map<string, RateLimiterEntry>();

// Configurações padrão por tipo de endpoint
export const RATE_LIMIT_CONFIGS = {
  // APIs Admin (mais restritivas)
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100, // 100 requisições por 15 min
  },
  
  // APIs de autenticação (muito restritivas)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 10, // 10 tentativas de login por 15 min
  },
  
  // APIs públicas (moderadas)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 200, // 200 requisições por 15 min
  },
  
  // Upload de arquivos (mais restritivas)
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 20, // 20 uploads por hora
  },
  
  // APIs críticas (muito restritivas)
  critical: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 50, // 50 requisições por hora
  }
};

/**
 * Gera chave única para rate limiting baseada no IP e User-Agent
 */
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Hash simples para chave única
  return `${ip}:${userAgent.slice(0, 50)}`;
}

/**
 * Gera chave baseada no usuário autenticado
 */
/**
 * userKeyGenerator function
 * @todo Add proper documentation
 */
export function UserKeyGenerator(userId: string): string {
  return `user:${userId}`;
}

/**
 * Gera chave baseada no IP apenas
 */
/**
 * ipKeyGenerator function
 * @todo Add proper documentation
 */
export function IpKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  return `ip:${ip}`;
}

/**
 * Limpa entradas expiradas do cache
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Verifica se uma requisição deve ser limitada
 */
/**
 * checkRateLimit function
 * @todo Add proper documentation
 */
export function CheckRateLimit(
  request: NextRequest,
  options: RateLimiterOptions
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  // Limpar entradas expiradas periodicamente
  if (Math.random() < 0.01) { // 1% de chance
    cleanupExpiredEntries();
  }

  const key = options.keyGenerator ? options.keyGenerator(request) : defaultKeyGenerator(request);
  const now = Date.now();
  const resetTime = now + options.windowMs;

  let entry = rateLimitStore.get(key);

  // Se não existe entrada ou expirou
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: resetTime
    };
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      resetTime: entry.resetTime
    };
  }

  // Incrementar contador
  entry.count++;

  // Verificar se excedeu limite
  if (entry.count > options.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: retryAfter
    };
  }

  return {
    allowed: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Rate limiter para APIs admin
 */
/**
 * adminRateLimit function
 * @todo Add proper documentation
 */
export function AdminRateLimit(request: NextRequest) {
  return CheckRateLimit(request, RATE_LIMIT_CONFIGS.admin);
}

/**
 * Rate limiter para autenticação
 */
/**
 * authRateLimit function
 * @todo Add proper documentation
 */
export function AuthRateLimit(request: NextRequest) {
  return CheckRateLimit(request, {
    ...RATE_LIMIT_CONFIGS.auth,
    keyGenerator: IpKeyGenerator // Usar apenas IP para auth
  });
}

/**
 * Rate limiter para APIs públicas
 */
/**
 * publicRateLimit function
 * @todo Add proper documentation
 */
export function PublicRateLimit(request: NextRequest) {
  return CheckRateLimit(request, RATE_LIMIT_CONFIGS.public);
}

/**
 * Rate limiter para upload de arquivos
 */
/**
 * uploadRateLimit function
 * @todo Add proper documentation
 */
export function UploadRateLimit(request: NextRequest) {
  return CheckRateLimit(request, RATE_LIMIT_CONFIGS.upload);
}

/**
 * Rate limiter baseado no usuário
 */
/**
 * userRateLimit function
 * @todo Add proper documentation
 */
export function UserRateLimit(userId: string, config: Partial<RateLimiterOptions> = {}) {
  const mockRequest = {} as NextRequest;
  
  return CheckRateLimit(mockRequest, {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    keyGenerator: () => UserKeyGenerator(userId),
    ...config
  });
}

/**
 * Headers de rate limit para resposta
 */
/**
 * getRateLimitHeaders function
 * @todo Add proper documentation
 */
export function GetRateLimitHeaders(result: ReturnType<typeof CheckRateLimit>) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString()
    })
  };
}

/**
 * Middleware helper para aplicar rate limiting
 */
/**
 * withRateLimit function
 * @todo Add proper documentation
 */
export async function withRateLimit<T>(
  request: NextRequest,
  rateLimitFn: (req: NextRequest) => ReturnType<typeof CheckRateLimit>,
  handler: () => Promise<T>
): Promise<T | Response> {
  const result = rateLimitFn(request);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
        details: {
          limit: result.limit,
          resetTime: new Date(result.resetTime).toISOString()
        }
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...GetRateLimitHeaders(result)
        }
      }
    );
  }
  
  // Executar handler e adicionar headers de rate limit na resposta
  const response = await handler();
  
  // Se response é um Response object, adicionar headers
  if (response instanceof Response) {
    const headers = GetRateLimitHeaders(result);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, String(value));
    });
  }
  
  return response;
}

/**
 * Rate limiter para desenvolvimento (mais permissivo)
 */
/**
 * devRateLimit function
 * @todo Add proper documentation
 */
export function DevRateLimit(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return {
      allowed: true,
      limit: 9999,
      remaining: 9999,
      resetTime: Date.now() + 60000
    };
  }
  
  return PublicRateLimit(request);
}

/**
 * Estatísticas do rate limiter
 */
/**
 * getRateLimitStats function
 * @todo Add proper documentation
 */
export function GetRateLimitStats() {
  const now = Date.now();
  const activeEntries = Array.from(rateLimitStore.entries())
    .filter(([_, entry]) => now <= entry.resetTime);
  
  return {
    totalEntries: rateLimitStore.size,
    activeEntries: activeEntries.length,
    expiredEntries: rateLimitStore.size - activeEntries.length,
    memoryUsage: `${Math.round(rateLimitStore.size * 50 / 1024)} KB (approx)`
  };
}

/**
 * Limpar cache manualmente (útil para testes)
 */
/**
 * clearRateLimitCache function
 * @todo Add proper documentation
 */
export function ClearRateLimitCache() {
  rateLimitStore.clear();
}