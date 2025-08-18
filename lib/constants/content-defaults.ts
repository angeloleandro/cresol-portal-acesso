/**
 * Constantes padrão para gerenciamento de conteúdo
 * Centraliza configurações de estado inicial e comportamentos
 */

export const CONTENT_DEFAULTS = {
  /** Estado inicial para exibição de rascunhos - true para mostrar rascunhos por padrão */
  SHOW_DRAFTS_INITIAL: true,
  
  /** Comportamento da alternância de rascunhos */
  DRAFT_TOGGLE_BEHAVIOR: 'include_unpublished' as const
} as const;