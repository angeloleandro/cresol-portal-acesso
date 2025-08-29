/**
 * Mapeamento centralizado entre tipos de conteúdo e tabelas do banco
 * Resolve inconsistências de nomenclatura entre API e database
 */

// Tipos de conteúdo suportados
export const CONTENT_TYPES = {
  NEWS: 'news',
  EVENTS: 'events',
  DOCUMENTS: 'documents',
  MESSAGES: 'messages',
  GALLERIES: 'galleries',
  VIDEOS: 'videos',
  GROUPS: 'groups',
  SUBSECTORS: 'subsectors'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// Tipos de entidade (onde o conteúdo pode estar associado)
export const ENTITY_TYPES = {
  GENERAL: 'general',
  SECTOR: 'sector',
  SUBSECTOR: 'subsector'
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// Mapeamento de tabelas do banco de dados
export const TABLE_MAPPINGS: Record<ContentType, Record<EntityType, string>> = {
  [CONTENT_TYPES.NEWS]: {
    [ENTITY_TYPES.GENERAL]: 'general_news',
    [ENTITY_TYPES.SECTOR]: 'sector_news',
    [ENTITY_TYPES.SUBSECTOR]: 'subsector_news'
  },
  [CONTENT_TYPES.EVENTS]: {
    [ENTITY_TYPES.GENERAL]: 'general_events', // pode não existir ainda
    [ENTITY_TYPES.SECTOR]: 'sector_events',
    [ENTITY_TYPES.SUBSECTOR]: 'subsector_events'
  },
  [CONTENT_TYPES.DOCUMENTS]: {
    [ENTITY_TYPES.GENERAL]: 'general_documents', // pode não existir ainda
    [ENTITY_TYPES.SECTOR]: 'sector_documents',
    [ENTITY_TYPES.SUBSECTOR]: 'subsector_documents'
  },
  [CONTENT_TYPES.MESSAGES]: {
    [ENTITY_TYPES.GENERAL]: 'general_messages', // pode não existir ainda
    [ENTITY_TYPES.SECTOR]: 'sector_messages',
    [ENTITY_TYPES.SUBSECTOR]: 'subsector_messages'
  },
  [CONTENT_TYPES.GALLERIES]: {
    [ENTITY_TYPES.GENERAL]: 'gallery_images', // galeria global
    [ENTITY_TYPES.SECTOR]: 'sector_galleries',
    [ENTITY_TYPES.SUBSECTOR]: 'subsector_galleries'
  },
  [CONTENT_TYPES.VIDEOS]: {
    [ENTITY_TYPES.GENERAL]: 'videos', // vídeos globais
    [ENTITY_TYPES.SECTOR]: 'sector_videos',
    [ENTITY_TYPES.SUBSECTOR]: 'subsector_videos'
  },
  [CONTENT_TYPES.GROUPS]: {
    [ENTITY_TYPES.GENERAL]: 'message_groups', // grupos globais
    [ENTITY_TYPES.SECTOR]: 'sector_groups',
    [ENTITY_TYPES.SUBSECTOR]: 'subsector_groups'
  },
  [CONTENT_TYPES.SUBSECTORS]: {
    [ENTITY_TYPES.GENERAL]: 'subsectors', // subsetores não têm hierarquia
    [ENTITY_TYPES.SECTOR]: 'subsectors',
    [ENTITY_TYPES.SUBSECTOR]: 'subsectors'
  }
};

// Função helper para obter nome da tabela
export function getTableName(
  contentType: ContentType,
  entityType: EntityType
): string {
  const tableName = TABLE_MAPPINGS[contentType]?.[entityType];
  
  if (!tableName) {
    throw new Error(
      `Mapeamento de tabela não encontrado para content: ${contentType}, entity: ${entityType}`
    );
  }
  
  return tableName;
}

// Função helper para extrair tipo de entidade de um nome de tabela
export function getEntityTypeFromTable(tableName: string): EntityType | null {
  // Verifica prefixos conhecidos
  if (tableName.startsWith('general_') || tableName === 'videos' || tableName === 'gallery_images') {
    return ENTITY_TYPES.GENERAL;
  }
  
  if (tableName.startsWith('sector_')) {
    return ENTITY_TYPES.SECTOR;
  }
  
  if (tableName.startsWith('subsector_')) {
    return ENTITY_TYPES.SUBSECTOR;
  }
  
  return null;
}

// Função helper para extrair tipo de conteúdo de um nome de tabela
export function getContentTypeFromTable(tableName: string): ContentType | null {
  for (const [contentType, entityMappings] of Object.entries(TABLE_MAPPINGS)) {
    for (const table of Object.values(entityMappings)) {
      if (table === tableName) {
        return contentType as ContentType;
      }
    }
  }
  
  return null;
}

// Mapeamento de rotas de API
export const API_ROUTES = {
  // Rotas gerais
  [ENTITY_TYPES.GENERAL]: {
    [CONTENT_TYPES.NEWS]: '/api/admin/general-news',
    [CONTENT_TYPES.EVENTS]: '/api/admin/general-events', // a criar se necessário
    [CONTENT_TYPES.DOCUMENTS]: '/api/admin/general-documents', // a criar se necessário
    [CONTENT_TYPES.MESSAGES]: '/api/admin/general-messages', // a criar se necessário
    [CONTENT_TYPES.GALLERIES]: '/api/admin/gallery',
    [CONTENT_TYPES.VIDEOS]: '/api/admin/videos',
  },
  
  // Rotas de setor/subsetor (atualmente unificadas em sector-content)
  [ENTITY_TYPES.SECTOR]: {
    [CONTENT_TYPES.NEWS]: '/api/admin/sector-content',
    [CONTENT_TYPES.EVENTS]: '/api/admin/sector-content',
    [CONTENT_TYPES.DOCUMENTS]: '/api/admin/sector-content',
    [CONTENT_TYPES.MESSAGES]: '/api/admin/sector-content',
    [CONTENT_TYPES.GALLERIES]: '/api/admin/sector-content',
    [CONTENT_TYPES.VIDEOS]: '/api/admin/sector-content',
    [CONTENT_TYPES.GROUPS]: '/api/admin/sector-content',
    [CONTENT_TYPES.SUBSECTORS]: '/api/admin/sector-content'
  },
  
  [ENTITY_TYPES.SUBSECTOR]: {
    [CONTENT_TYPES.NEWS]: '/api/admin/sector-content',
    [CONTENT_TYPES.EVENTS]: '/api/admin/sector-content',
    [CONTENT_TYPES.DOCUMENTS]: '/api/admin/sector-content',
    [CONTENT_TYPES.MESSAGES]: '/api/admin/sector-content',
    [CONTENT_TYPES.GALLERIES]: '/api/admin/sector-content',
    [CONTENT_TYPES.VIDEOS]: '/api/admin/sector-content',
    [CONTENT_TYPES.GROUPS]: '/api/admin/sector-content'
  }
};

// Função helper para obter rota de API
export function getApiRoute(
  contentType: ContentType,
  entityType: EntityType
): string {
  const entityRoutes = API_ROUTES[entityType];
  if (!entityRoutes) {
    throw new Error(`Tipo de entidade não encontrado: ${entityType}`);
  }
  
  const route = (entityRoutes as any)[contentType];
  if (!route) {
    throw new Error(
      `Rota de API não encontrada para content: ${contentType}, entity: ${entityType}`
    );
  }
  
  return route;
}

// Campos comuns em todas as tabelas de conteúdo
export const COMMON_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'created_by'
] as const;

// Campos específicos por tipo de conteúdo
export const CONTENT_FIELDS: Record<ContentType, readonly string[]> = {
  [CONTENT_TYPES.NEWS]: [
    'title',
    'summary',
    'content',
    'image_url',
    'is_published',
    'is_featured',
    'priority' // apenas para general_news
  ],
  [CONTENT_TYPES.EVENTS]: [
    'title',
    'description',
    'location',
    'start_date',
    'end_date',
    'is_published'
  ],
  [CONTENT_TYPES.DOCUMENTS]: [
    'title',
    'description',
    'file_url',
    'file_type',
    'file_size',
    'is_published'
  ],
  [CONTENT_TYPES.MESSAGES]: [
    'title',
    'content',
    'priority',
    'is_published',
    'group_id'
  ],
  [CONTENT_TYPES.GALLERIES]: [
    'title',
    'description',
    'images', // JSON array
    'is_published'
  ],
  [CONTENT_TYPES.VIDEOS]: [
    'title',
    'description',
    'video_url',
    'thumbnail_url',
    'duration',
    'is_published'
  ],
  [CONTENT_TYPES.GROUPS]: [
    'name',
    'description',
    'user_ids', // JSON array
    'is_active'
  ],
  [CONTENT_TYPES.SUBSECTORS]: [
    'name',
    'description',
    'sector_id',
    'is_active'
  ]
};

// Validação de tipo de conteúdo
export function isValidContentType(type: string): type is ContentType {
  return Object.values(CONTENT_TYPES).includes(type as ContentType);
}

// Validação de tipo de entidade
export function isValidEntityType(type: string): type is EntityType {
  return Object.values(ENTITY_TYPES).includes(type as EntityType);
}

// Configuração de operações permitidas por tipo
export const ALLOWED_OPERATIONS = {
  [CONTENT_TYPES.NEWS]: ['create', 'read', 'update', 'delete', 'patch'],
  [CONTENT_TYPES.EVENTS]: ['create', 'read', 'update', 'delete', 'patch'],
  [CONTENT_TYPES.DOCUMENTS]: ['create', 'read', 'update', 'delete'],
  [CONTENT_TYPES.MESSAGES]: ['create', 'read', 'update', 'delete', 'patch'],
  [CONTENT_TYPES.GALLERIES]: ['create', 'read', 'update', 'delete'],
  [CONTENT_TYPES.VIDEOS]: ['create', 'read', 'update', 'delete'],
  [CONTENT_TYPES.GROUPS]: ['create', 'read', 'update', 'delete'],
  [CONTENT_TYPES.SUBSECTORS]: ['create', 'read', 'update', 'delete']
} as const;

// Export de tipos úteis
export type TableName = string;
export type ApiRoute = string;
export type Operation = 'create' | 'read' | 'update' | 'delete' | 'patch';

// Interface para configuração unificada
export interface ContentConfig {
  contentType: ContentType;
  entityType: EntityType;
  tableName: TableName;
  apiRoute: ApiRoute;
  fields: readonly string[];
  operations: readonly Operation[];
}

// Função para obter configuração completa
export function getContentConfig(
  contentType: ContentType,
  entityType: EntityType
): ContentConfig {
  return {
    contentType,
    entityType,
    tableName: getTableName(contentType, entityType),
    apiRoute: getApiRoute(contentType, entityType),
    fields: [...COMMON_FIELDS, ...CONTENT_FIELDS[contentType]],
    operations: ALLOWED_OPERATIONS[contentType]
  };
}