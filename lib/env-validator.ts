/**
 * Environment Variables Validator
 * Valida todas as variáveis de ambiente necessárias para produção
 */

interface EnvConfig {
  name: string;
  required: boolean;
  type: 'string' | 'url' | 'boolean' | 'number';
  description: string;
  validation?: (value: string) => boolean;
  defaultValue?: string;
}

const ENV_SCHEMA: EnvConfig[] = [
  // Next.js - Supabase (OBRIGATÓRIAS)
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    type: 'url',
    description: 'URL público do projeto Supabase',
    validation: (value) => value.includes('.supabase.co') && value.startsWith('https://')
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    type: 'string',
    description: 'Chave anônima pública do Supabase',
    validation: (value) => value.startsWith('eyJ') && value.length > 100 // JWT token
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    type: 'string',
    description: 'Chave de serviço para operações admin (MANTENHA SEGURA!)',
    validation: (value) => value.startsWith('eyJ') && value.length > 100 // JWT token
  },

  // MCP Servers (OPCIONAIS mas recomendadas)
  {
    name: 'GITHUB_TOKEN',
    required: false,
    type: 'string',
    description: 'Token do GitHub para integração com MCP servers',
    validation: (value) => value.startsWith('ghp_') && value.length === 40
  },
  {
    name: 'GITHUB_PERSONAL_ACCESS_TOKEN',
    required: false,
    type: 'string',
    description: 'Token pessoal do GitHub (mesmo que GITHUB_TOKEN)',
    validation: (value) => value.startsWith('ghp_') && value.length === 40
  },
  {
    name: 'FIGMA_API_KEY',
    required: false,
    type: 'string',
    description: 'Chave da API do Figma para integração com design',
    validation: (value) => value.startsWith('figd_') && value.length > 20
  },
  {
    name: 'SUPABASE_ACCESS_TOKEN',
    required: false,
    type: 'string',
    description: 'Token de acesso do Supabase para MCP servers',
    validation: (value) => value.startsWith('sbp_') && value.length > 20
  },
  {
    name: 'SUPABASE_ACCESS_TOKEN_CRESOL',
    required: false,
    type: 'string',
    description: 'Token de acesso específico do Cresol (mesmo que SUPABASE_ACCESS_TOKEN)',
    validation: (value) => value.startsWith('sbp_') && value.length > 20
  },
  {
    name: 'SUPABASE_PROJECT_REF',
    required: false,
    type: 'string',
    description: 'Referência do projeto Supabase',
    validation: (value) => value.length > 10 && !value.includes('your-project')
  },
  {
    name: 'CONTEXT7_API_KEY',
    required: false,
    type: 'string',
    description: 'Chave da API Context7 para documentação AI'
  },

  // Sistema
  {
    name: 'NODE_ENV',
    required: false,
    type: 'string',
    description: 'Ambiente de execução',
    validation: (value) => ['development', 'production', 'test'].includes(value),
    defaultValue: 'development'
  },
  {
    name: 'MCP_FILESYSTEM_ALLOWED_DIRS',
    required: false,
    type: 'string',
    description: 'Diretórios permitidos para MCP filesystem'
  }
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  invalid: string[];
  suggestions: string[];
}

/**
 * Valida todas as variáveis de ambiente
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missing: [],
    invalid: [],
    suggestions: []
  };

  // Verificar se estamos no servidor (para acessar process.env completo)
  const isServer = typeof window === 'undefined';
  
  for (const config of ENV_SCHEMA) {
    const value = isServer 
      ? process.env[config.name]
      : config.name.startsWith('NEXT_PUBLIC_') 
        ? process.env[config.name] 
        : undefined;

    // Verificar se variável obrigatória está presente
    if (config.required && (!value || value.trim() === '')) {
      result.errors.push(`❌ OBRIGATÓRIA: ${config.name} - ${config.description}`);
      result.missing.push(config.name);
      result.isValid = false;
      continue;
    }

    // Se variável não está presente e não é obrigatória
    if (!value || value.trim() === '') {
      if (!config.required) {
        result.warnings.push(`⚠️  OPCIONAL: ${config.name} não configurada - ${config.description}`);
        
        // Sugerir configuração se for importante
        if (config.name.includes('GITHUB') || config.name.includes('FIGMA')) {
          result.suggestions.push(`💡 Considere configurar ${config.name} para funcionalidades completas`);
        }
      }
      continue;
    }

    // Verificar se é placeholder
    if (value.includes('your-') || value.includes('your_') || value === config.name.toLowerCase()) {
      result.warnings.push(`⚠️  PLACEHOLDER: ${config.name} contém valor placeholder`);
      result.suggestions.push(`🔄 Substitua ${config.name} por um valor real`);
      continue;
    }

    // Validar formato se especificado
    if (config.validation && !config.validation(value)) {
      result.errors.push(`❌ FORMATO INVÁLIDO: ${config.name} - ${config.description}`);
      result.invalid.push(config.name);
      result.isValid = false;
      continue;
    }

    // Validações específicas por tipo
    switch (config.type) {
      case 'url':
        try {
          new URL(value);
        } catch {
          result.errors.push(`❌ URL INVÁLIDA: ${config.name} deve ser uma URL válida`);
          result.invalid.push(config.name);
          result.isValid = false;
        }
        break;

      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          result.errors.push(`❌ BOOLEAN INVÁLIDO: ${config.name} deve ser true/false ou 1/0`);
          result.invalid.push(config.name);
          result.isValid = false;
        }
        break;

      case 'number':
        if (isNaN(Number(value))) {
          result.errors.push(`❌ NÚMERO INVÁLIDO: ${config.name} deve ser um número`);
          result.invalid.push(config.name);
          result.isValid = false;
        }
        break;
    }
  }

  // Verificar tokens de segurança comprometidos
  const compromisedTokens = [
    'ghp_[REDACTED]',
    'figd_[REDACTED]',
    'sbp_[REDACTED]'
  ];

  const env = isServer ? process.env : {};
  
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && compromisedTokens.some(token => value.includes(token))) {
      result.errors.push(`🚨 SEGURANÇA CRÍTICA: ${key} contém token comprometido - DEVE ser rotacionado!`);
      result.invalid.push(key);
      result.isValid = false;
    }
  }

  return result;
}

/**
 * Gera relatório formatado de validação
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [];
  
  lines.push('🔍 RELATÓRIO DE VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE');
  lines.push('='.repeat(50));
  lines.push('');

  // Status geral
  if (result.isValid) {
    lines.push('✅ STATUS: TODAS AS VALIDAÇÕES PASSARAM');
  } else {
    lines.push('❌ STATUS: PROBLEMAS ENCONTRADOS - CORRIJA ANTES DO DEPLOY');
  }
  lines.push('');

  // Erros críticos
  if (result.errors.length > 0) {
    lines.push('🚨 ERROS CRÍTICOS (DEVEM SER CORRIGIDOS):');
    result.errors.forEach(error => lines.push(`  ${error}`));
    lines.push('');
  }

  // Avisos
  if (result.warnings.length > 0) {
    lines.push('⚠️  AVISOS (RECOMENDADO CORRIGIR):');
    result.warnings.forEach(warning => lines.push(`  ${warning}`));
    lines.push('');
  }

  // Sugestões
  if (result.suggestions.length > 0) {
    lines.push('💡 SUGESTÕES:');
    result.suggestions.forEach(suggestion => lines.push(`  ${suggestion}`));
    lines.push('');
  }

  // Resumo
  lines.push('📊 RESUMO:');
  lines.push(`  • Obrigatórias faltando: ${result.missing.length}`);
  lines.push(`  • Formatos inválidos: ${result.invalid.length}`);
  lines.push(`  • Avisos: ${result.warnings.length}`);
  lines.push(`  • Sugestões: ${result.suggestions.length}`);
  
  return lines.join('\n');
}

/**
 * Hook para usar validação em componentes React
 */
export function useEnvironmentValidation() {
  if (typeof window !== 'undefined') {
    console.warn('Environment validation should only run on the server side');
    return { isValid: true, errors: [], warnings: [], missing: [], invalid: [], suggestions: [] };
  }
  
  return validateEnvironment();
}

/**
 * Middleware para validar ambiente na inicialização
 */
export function validateEnvironmentOnStartup(): void {
  if (typeof window !== 'undefined') return; // Só no servidor
  
  const result = validateEnvironment();
  
  if (!result.isValid) {
    console.error('\n' + generateValidationReport(result));
    
    if (process.env.NODE_ENV === 'production') {
      console.error('\n🚫 ABORTING: Cannot start in production with invalid environment');
      process.exit(1);
    } else {
      console.warn('\n⚠️  WARNING: Development server starting with environment issues');
    }
  } else {
    console.log('\n✅ Environment validation passed - All required variables configured');
  }
}