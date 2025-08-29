import { z } from 'zod';
import { CONTENT_TYPES, ENTITY_TYPES } from '@/lib/constants/api-mappings';

/**
 * Schemas Zod centralizados para validação de dados de conteúdo
 * Evita duplicação de validação manual em cada API
 */

// ========================================
// Schemas Base (campos comuns)
// ========================================

const baseTimestampSchema = z.object({
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid().optional()
});

const basePublishableSchema = baseTimestampSchema.extend({
  is_published: z.boolean().default(false)
});

const baseFeaturableSchema = basePublishableSchema.extend({
  is_featured: z.boolean().default(false)
});

// ========================================
// Limites de caracteres centralizados
// ========================================

export const TEXT_LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 255,
  SUMMARY_MIN: 10,
  SUMMARY_MAX: 500,
  CONTENT_MIN: 20,
  CONTENT_MAX: 10000,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 1000,
  NAME_MIN: 2,
  NAME_MAX: 100
} as const;

// ========================================
// Schemas para NEWS
// ========================================

const newsBaseSchema = baseFeaturableSchema.extend({
  title: z.string()
    .min(TEXT_LIMITS.TITLE_MIN, `Título deve ter pelo menos ${TEXT_LIMITS.TITLE_MIN} caracteres`)
    .max(TEXT_LIMITS.TITLE_MAX, `Título deve ter no máximo ${TEXT_LIMITS.TITLE_MAX} caracteres`),
  
  summary: z.string()
    .min(TEXT_LIMITS.SUMMARY_MIN, `Resumo deve ter pelo menos ${TEXT_LIMITS.SUMMARY_MIN} caracteres`)
    .max(TEXT_LIMITS.SUMMARY_MAX, `Resumo deve ter no máximo ${TEXT_LIMITS.SUMMARY_MAX} caracteres`),
  
  content: z.string()
    .min(TEXT_LIMITS.CONTENT_MIN, `Conteúdo deve ter pelo menos ${TEXT_LIMITS.CONTENT_MIN} caracteres`)
    .max(TEXT_LIMITS.CONTENT_MAX, `Conteúdo deve ter no máximo ${TEXT_LIMITS.CONTENT_MAX} caracteres`),
  
  image_url: z.string().url().nullable().optional()
});

// Schema específico para general_news (usa priority ao invés de is_featured)
const generalNewsBaseSchema = basePublishableSchema.extend({
  title: z.string()
    .min(TEXT_LIMITS.TITLE_MIN, `Título deve ter pelo menos ${TEXT_LIMITS.TITLE_MIN} caracteres`)
    .max(TEXT_LIMITS.TITLE_MAX, `Título deve ter no máximo ${TEXT_LIMITS.TITLE_MAX} caracteres`),
  
  summary: z.string()
    .min(TEXT_LIMITS.SUMMARY_MIN, `Resumo deve ter pelo menos ${TEXT_LIMITS.SUMMARY_MIN} caracteres`)
    .max(TEXT_LIMITS.SUMMARY_MAX, `Resumo deve ter no máximo ${TEXT_LIMITS.SUMMARY_MAX} caracteres`),
  
  content: z.string()
    .min(TEXT_LIMITS.CONTENT_MIN, `Conteúdo deve ter pelo menos ${TEXT_LIMITS.CONTENT_MIN} caracteres`)
    .max(TEXT_LIMITS.CONTENT_MAX, `Conteúdo deve ter no máximo ${TEXT_LIMITS.CONTENT_MAX} caracteres`),
  
  image_url: z.string().url().nullable().optional()
});

export const generalNewsSchema = generalNewsBaseSchema.extend({
  priority: z.number().int().min(0).max(10).default(0)
});

export const sectorNewsSchema = newsBaseSchema.extend({
  sector_id: z.string().uuid('ID do setor inválido')
});

export const subsectorNewsSchema = newsBaseSchema.extend({
  subsector_id: z.string().uuid('ID do subsetor inválido')
});

// ========================================
// Schemas para EVENTS
// ========================================

const eventBaseSchema = basePublishableSchema.extend({
  title: z.string()
    .min(TEXT_LIMITS.TITLE_MIN)
    .max(TEXT_LIMITS.TITLE_MAX),
  
  description: z.string()
    .min(TEXT_LIMITS.DESCRIPTION_MIN)
    .max(TEXT_LIMITS.DESCRIPTION_MAX),
  
  location: z.string().max(255).optional(),
  
  start_date: z.string().datetime('Data de início inválida'),
  end_date: z.string().datetime('Data de fim inválida')
});

export const sectorEventSchema = eventBaseSchema.extend({
  sector_id: z.string().uuid()
});

export const subsectorEventSchema = eventBaseSchema.extend({
  subsector_id: z.string().uuid()
});

// ========================================
// Schemas para DOCUMENTS
// ========================================

const documentBaseSchema = basePublishableSchema.extend({
  title: z.string()
    .min(TEXT_LIMITS.TITLE_MIN)
    .max(TEXT_LIMITS.TITLE_MAX),
  
  description: z.string()
    .min(TEXT_LIMITS.DESCRIPTION_MIN)
    .max(TEXT_LIMITS.DESCRIPTION_MAX)
    .optional(),
  
  file_url: z.string().url('URL do arquivo inválida'),
  file_type: z.string().max(50).optional(),
  file_size: z.number().positive().optional()
});

export const sectorDocumentSchema = documentBaseSchema.extend({
  sector_id: z.string().uuid()
});

export const subsectorDocumentSchema = documentBaseSchema.extend({
  subsector_id: z.string().uuid()
});

// ========================================
// Schemas para MESSAGES
// ========================================

const messageBaseSchema = basePublishableSchema.extend({
  title: z.string()
    .min(TEXT_LIMITS.TITLE_MIN)
    .max(TEXT_LIMITS.TITLE_MAX),
  
  content: z.string()
    .min(TEXT_LIMITS.CONTENT_MIN)
    .max(TEXT_LIMITS.CONTENT_MAX),
  
  priority: z.number().int().min(0).max(10).default(0),
  group_id: z.string().uuid().nullable().optional()
});

export const sectorMessageSchema = messageBaseSchema.extend({
  sector_id: z.string().uuid()
});

export const subsectorMessageSchema = messageBaseSchema.extend({
  subsector_id: z.string().uuid()
});

// ========================================
// Schemas para GALLERIES
// ========================================

const galleryImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().max(255).optional(),
  order: z.number().int().min(0).optional()
});

const galleryBaseSchema = basePublishableSchema.extend({
  title: z.string()
    .min(TEXT_LIMITS.TITLE_MIN)
    .max(TEXT_LIMITS.TITLE_MAX),
  
  description: z.string()
    .min(TEXT_LIMITS.DESCRIPTION_MIN)
    .max(TEXT_LIMITS.DESCRIPTION_MAX)
    .optional(),
  
  images: z.array(galleryImageSchema).min(1, 'Galeria deve ter pelo menos 1 imagem')
});

export const sectorGallerySchema = galleryBaseSchema.extend({
  sector_id: z.string().uuid()
});

export const subsectorGallerySchema = galleryBaseSchema.extend({
  subsector_id: z.string().uuid()
});

// ========================================
// Schemas para VIDEOS
// ========================================

const videoBaseSchema = basePublishableSchema.extend({
  title: z.string()
    .min(TEXT_LIMITS.TITLE_MIN)
    .max(TEXT_LIMITS.TITLE_MAX),
  
  description: z.string()
    .min(TEXT_LIMITS.DESCRIPTION_MIN)
    .max(TEXT_LIMITS.DESCRIPTION_MAX)
    .optional(),
  
  video_url: z.string().url('URL do vídeo inválida'),
  thumbnail_url: z.string().url().nullable().optional(),
  duration: z.number().positive().optional()
});

export const generalVideoSchema = videoBaseSchema;

export const sectorVideoSchema = videoBaseSchema.extend({
  sector_id: z.string().uuid()
});

export const subsectorVideoSchema = videoBaseSchema.extend({
  subsector_id: z.string().uuid()
});

// ========================================
// Schemas para GROUPS
// ========================================

const groupBaseSchema = baseTimestampSchema.extend({
  name: z.string()
    .min(TEXT_LIMITS.NAME_MIN)
    .max(TEXT_LIMITS.NAME_MAX),
  
  description: z.string()
    .min(TEXT_LIMITS.DESCRIPTION_MIN)
    .max(TEXT_LIMITS.DESCRIPTION_MAX)
    .optional(),
  
  user_ids: z.array(z.string().uuid()).default([]),
  is_active: z.boolean().default(true)
});

export const messageGroupSchema = groupBaseSchema;

export const sectorGroupSchema = groupBaseSchema.extend({
  sector_id: z.string().uuid()
});

export const subsectorGroupSchema = groupBaseSchema.extend({
  subsector_id: z.string().uuid()
});

// ========================================
// Schemas para SUBSECTORS
// ========================================

export const subsectorSchema = baseTimestampSchema.extend({
  name: z.string()
    .min(TEXT_LIMITS.NAME_MIN)
    .max(TEXT_LIMITS.NAME_MAX),
  
  description: z.string()
    .min(TEXT_LIMITS.DESCRIPTION_MIN)
    .max(TEXT_LIMITS.DESCRIPTION_MAX)
    .optional(),
  
  sector_id: z.string().uuid('ID do setor inválido'),
  is_active: z.boolean().default(true)
});

// ========================================
// Schema para operações PATCH
// ========================================

export const patchOperationSchema = z.object({
  id: z.string().uuid('ID inválido'),
  action: z.enum(['publish', 'unpublish', 'feature', 'unfeature', 'duplicate', 'activate', 'deactivate'])
});

// ========================================
// Função helper para obter schema correto
// ========================================

export function getValidationSchema(contentType: string, entityType: string) {
  const schemaMap = {
    [`${CONTENT_TYPES.NEWS}-${ENTITY_TYPES.GENERAL}`]: generalNewsSchema,
    [`${CONTENT_TYPES.NEWS}-${ENTITY_TYPES.SECTOR}`]: sectorNewsSchema,
    [`${CONTENT_TYPES.NEWS}-${ENTITY_TYPES.SUBSECTOR}`]: subsectorNewsSchema,
    
    [`${CONTENT_TYPES.EVENTS}-${ENTITY_TYPES.SECTOR}`]: sectorEventSchema,
    [`${CONTENT_TYPES.EVENTS}-${ENTITY_TYPES.SUBSECTOR}`]: subsectorEventSchema,
    
    [`${CONTENT_TYPES.DOCUMENTS}-${ENTITY_TYPES.SECTOR}`]: sectorDocumentSchema,
    [`${CONTENT_TYPES.DOCUMENTS}-${ENTITY_TYPES.SUBSECTOR}`]: subsectorDocumentSchema,
    
    [`${CONTENT_TYPES.MESSAGES}-${ENTITY_TYPES.SECTOR}`]: sectorMessageSchema,
    [`${CONTENT_TYPES.MESSAGES}-${ENTITY_TYPES.SUBSECTOR}`]: subsectorMessageSchema,
    
    [`${CONTENT_TYPES.GALLERIES}-${ENTITY_TYPES.SECTOR}`]: sectorGallerySchema,
    [`${CONTENT_TYPES.GALLERIES}-${ENTITY_TYPES.SUBSECTOR}`]: subsectorGallerySchema,
    
    [`${CONTENT_TYPES.VIDEOS}-${ENTITY_TYPES.GENERAL}`]: generalVideoSchema,
    [`${CONTENT_TYPES.VIDEOS}-${ENTITY_TYPES.SECTOR}`]: sectorVideoSchema,
    [`${CONTENT_TYPES.VIDEOS}-${ENTITY_TYPES.SUBSECTOR}`]: subsectorVideoSchema,
    
    [`${CONTENT_TYPES.GROUPS}-${ENTITY_TYPES.GENERAL}`]: messageGroupSchema,
    [`${CONTENT_TYPES.GROUPS}-${ENTITY_TYPES.SECTOR}`]: sectorGroupSchema,
    [`${CONTENT_TYPES.GROUPS}-${ENTITY_TYPES.SUBSECTOR}`]: subsectorGroupSchema,
    
    [`${CONTENT_TYPES.SUBSECTORS}-${ENTITY_TYPES.SECTOR}`]: subsectorSchema
  };
  
  const key = `${contentType}-${entityType}`;
  const schema = schemaMap[key as keyof typeof schemaMap];
  
  if (!schema) {
    throw new Error(`Schema de validação não encontrado para ${contentType}/${entityType}`);
  }
  
  return schema;
}

// ========================================
// Tipos TypeScript exportados
// ========================================

export type GeneralNews = z.infer<typeof generalNewsSchema>;
export type SectorNews = z.infer<typeof sectorNewsSchema>;
export type SubsectorNews = z.infer<typeof subsectorNewsSchema>;

export type SectorEvent = z.infer<typeof sectorEventSchema>;
export type SubsectorEvent = z.infer<typeof subsectorEventSchema>;

export type SectorDocument = z.infer<typeof sectorDocumentSchema>;
export type SubsectorDocument = z.infer<typeof subsectorDocumentSchema>;

export type SectorMessage = z.infer<typeof sectorMessageSchema>;
export type SubsectorMessage = z.infer<typeof subsectorMessageSchema>;

export type SectorGallery = z.infer<typeof sectorGallerySchema>;
export type SubsectorGallery = z.infer<typeof subsectorGallerySchema>;

export type GeneralVideo = z.infer<typeof generalVideoSchema>;
export type SectorVideo = z.infer<typeof sectorVideoSchema>;
export type SubsectorVideo = z.infer<typeof subsectorVideoSchema>;

export type MessageGroup = z.infer<typeof messageGroupSchema>;
export type SectorGroup = z.infer<typeof sectorGroupSchema>;
export type SubsectorGroup = z.infer<typeof subsectorGroupSchema>;

export type Subsector = z.infer<typeof subsectorSchema>;
export type PatchOperation = z.infer<typeof patchOperationSchema>;

// ========================================
// Função de validação com tratamento de erro
// ========================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: {
    fieldErrors: Record<string, string[] | undefined>;
    formErrors: string[];
  };
}

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const flattened = error.flatten();
      return {
        success: false,
        errors: {
          fieldErrors: flattened.fieldErrors,
          formErrors: flattened.formErrors
        }
      };
    }
    
    // Re-throw non-Zod errors
    throw error;
  }
}

// ========================================
// Função de validação parcial (para updates)
// ========================================

export function validatePartialData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<Partial<T>> {
  // Cast to any to access partial method which exists on ZodObject
  const partialSchema = (schema as any).partial();
  return validateData(partialSchema, data);
}