/**
 * CORS Configuration para Next.js API Routes
 * Configuração segura para produção
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CORSOptions {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

// Configurações de CORS por ambiente
const CORS_CONFIGS = {
  development: {
    origin: ['http://localhost:3000', 'http://localhost:4000', 'http://127.0.0.1:3000', 'http://127.0.0.1:4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    maxAge: 86400, // 24 horas
  } as CORSOptions,

  production: {
    origin: [
      'https://cresol-portal.vercel.app',
      'https://hub.cresol.com.br',
      'https://*.cresol.com.br',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
    maxAge: 3600, // 1 hora
  } as CORSOptions,

  restrictive: {
    origin: false, // Nenhuma origem externa permitida
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 300, // 5 minutos
  } as CORSOptions,
};

/**
 * Verifica se uma origem é permitida
 */
function isOriginAllowed(origin: string | null | undefined, allowedOrigins: string | string[] | boolean): boolean {
  if (!origin) return true; // Requisições same-origin

  if (allowedOrigins === true) return true;
  if (allowedOrigins === false) return false;

  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }

  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.some(allowed => {
      // Suporte a wildcards
      if (allowed.includes('*')) {
        const regex = new RegExp(allowed.replace(/\*/g, '.*'));
        return regex.test(origin);
      }
      return origin === allowed;
    });
  }

  return false;
}

/**
 * Aplica configuração CORS em uma response
 */
export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse,
  options: CORSOptions
): NextResponse {
  const origin = request.headers.get('origin');

  // Verificar se origem é permitida
  if (isOriginAllowed(origin, options.origin)) {
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  // Configurar credentials
  if (options.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Configurar métodos permitidos
  response.headers.set('Access-Control-Allow-Methods', options.methods.join(', '));

  // Configurar cabeçalhos permitidos
  response.headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));

  // Cache para preflight
  if (options.maxAge) {
    response.headers.set('Access-Control-Max-Age', options.maxAge.toString());
  }

  // Cabeçalhos expostos
  response.headers.set('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');

  return response;
}

/**
 * Middleware CORS para API routes
 */
export function withCORS(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: Partial<CORSOptions>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Obter configuração baseada no ambiente
    const env = process.env.NODE_ENV || 'development';
    const baseConfig = env === 'production' ? CORS_CONFIGS.production : CORS_CONFIGS.development;
    
    // Mesclar com opções customizadas
    const corsOptions = { ...baseConfig, ...options };

    // Tratar requisições OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      return applyCORSHeaders(request, response, corsOptions);
    }

    // Executar handler e aplicar CORS
    try {
      const response = await handler(request);
      return applyCORSHeaders(request, response, corsOptions);
    } catch (error) {
      // Em caso de erro, ainda aplicar CORS
      const errorResponse = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
      return applyCORSHeaders(request, errorResponse, corsOptions);
    }
  };
}

/**
 * CORS para APIs públicas (mais permissivo)
 */
export const publicCORS = (handler: (request: NextRequest) => Promise<NextResponse>) =>
  withCORS(handler, {
    origin: true, // Permitir todas as origens
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false,
  });

/**
 * CORS para APIs admin (mais restritivo)
 */
export const adminCORS = (handler: (request: NextRequest) => Promise<NextResponse>) =>
  withCORS(handler, {
    origin: process.env.NODE_ENV === 'production' 
      ? CORS_CONFIGS.production.origin 
      : CORS_CONFIGS.development.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

/**
 * CORS para APIs de autenticação (mais restritivo)
 */
export const authCORS = (handler: (request: NextRequest) => Promise<NextResponse>) =>
  withCORS(handler, {
    origin: process.env.NODE_ENV === 'production' 
      ? CORS_CONFIGS.production.origin 
      : CORS_CONFIGS.development.origin,
    methods: ['POST', 'OPTIONS'],
    credentials: true,
    maxAge: 300, // Cache curto para auth
  });

/**
 * CORS para upload de arquivos
 */
export const uploadCORS = (handler: (request: NextRequest) => Promise<NextResponse>) =>
  withCORS(handler, {
    origin: process.env.NODE_ENV === 'production' 
      ? CORS_CONFIGS.production.origin 
      : CORS_CONFIGS.development.origin,
    methods: ['POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Content-Length',
      'tus-resumable', // Para upload resumável
    ],
    credentials: true,
  });

/**
 * Configuração CORS personalizada para necessidades específicas
 */
export function customCORS(options: Partial<CORSOptions>) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withCORS(handler, options);
}

/**
 * Helper para adicionar apenas cabeçalhos CORS básicos
 */
export function addBasicCORS(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  
  if (process.env.NODE_ENV === 'development') {
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  return response;
}

/**
 * Validar configuração CORS
 */
export function validateCORSConfig(options: CORSOptions): boolean {
  // Verificar se há configurações inseguras
  if (options.origin === true && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  AVISO: CORS configurado para permitir todas as origens em produção!');
    return false;
  }

  if (options.credentials && options.origin === true) {
    console.warn('⚠️  AVISO: Credentials habilitado com origin wildcard é inseguro!');
    return false;
  }

  return true;
}

/**
 * Log de configuração CORS para debugging
 */
export function logCORSConfig() {
  const env = process.env.NODE_ENV || 'development';
  const config = env === 'production' ? CORS_CONFIGS.production : CORS_CONFIGS.development;
  
  console.log(`🌐 CORS configurado para ${env}:`, {
    origin: config.origin,
    credentials: config.credentials,
    methods: config.methods.length,
    headers: config.allowedHeaders.length,
  });
}