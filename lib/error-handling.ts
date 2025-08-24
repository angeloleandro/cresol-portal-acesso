/**
 * Utilities for robust error handling and API response processing
 * 
 * Provides centralized error handling patterns for consistent
 * user experience and debugging information.
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

/**
 * Enhanced error class with context information
 */
export class ApiError extends Error {
  public readonly context: ErrorContext;
  public readonly statusCode?: number;
  public readonly originalError?: Error;

  constructor(
    message: string, 
    context: ErrorContext, 
    statusCode?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.context = context;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Process API response with robust error handling
 */
/**
 * processApiResponse function
 * @todo Add proper documentation
 */
export async function processApiResponse<T = any>(
  response: Response,
  context: ErrorContext
): Promise<T> {
    
  let responseData: ApiResponse<T>;
  
  try {
    responseData = await response.json();
  } catch (parseError) {
    console.error(`❌ [API_RESPONSE] Failed to parse JSON response:`, parseError);
    throw new ApiError(
      'Resposta inválida do servidor',
      context,
      response.status,
      parseError instanceof Error ? parseError : undefined
    );
  }

  if (!response.ok) {
    const errorMessage = responseData.error || `Erro HTTP ${response.status}`;
    console.error(`❌ [API_RESPONSE] API error:`, errorMessage);
    
    throw new ApiError(
      errorMessage,
      context,
      response.status
    );
  }

  // Validate successful response has expected data structure
  if (responseData.error) {
    console.error(`❌ [API_RESPONSE] Response contains error:`, responseData.error);
    throw new ApiError(
      responseData.error,
      context,
      response.status
    );
  }

    return (responseData.data || responseData) as T;
}

/**
 * Create standardized error context
 */
/**
 * createErrorContext function
 * @todo Add proper documentation
 */
export function CreateErrorContext(
  operation: string,
  resource?: string,
  metadata?: Record<string, any>
): ErrorContext {
  return {
    operation,
    resource,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };
}

/**
 * Handle API errors with user-friendly messages
 */
/**
 * handleApiError function
 * @todo Add proper documentation
 */
export function HandleApiError(error: unknown, fallbackMessage: string = 'Erro desconhecido'): string {
  console.error('🔥 [ERROR_HANDLER] Handling API error:', error);

  if (error instanceof ApiError) {
    console.error('🔥 [ERROR_HANDLER] API Error context:', error.context);
    return error.message;
  }

  if (error instanceof Error) {
    console.error('🔥 [ERROR_HANDLER] Standard error:', error.message);
    return error.message;
  }

  console.error('🔥 [ERROR_HANDLER] Unknown error type:', typeof error);
  return fallbackMessage;
}

/**
 * Validate required environment variables for admin operations
 */
/**
 * validateAdminEnvironment function
 * @todo Add proper documentation
 */
export function ValidateAdminEnvironment(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ [ENV_VALIDATION]', errorMessage);
    throw new Error(errorMessage);
  }

  }