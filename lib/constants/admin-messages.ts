/**
 * Admin Messages Constants
 * Centralizes all user-facing messages and error texts
 */

// Success Messages
export const SUCCESS_MESSAGES = {
  NEWS_CREATED: 'Notícia criada com sucesso',
  NEWS_UPDATED: 'Notícia atualizada com sucesso',
  NEWS_DELETED: 'Notícia excluída com sucesso',
  NEWS_PUBLISHED: 'Notícia publicada com sucesso',
  NEWS_UNPUBLISHED: 'Notícia despublicada com sucesso',
  
  EVENT_CREATED: 'Evento criado com sucesso',
  EVENT_UPDATED: 'Evento atualizado com sucesso',
  EVENT_DELETED: 'Evento excluído com sucesso',
  EVENT_PUBLISHED: 'Evento publicado com sucesso',
  EVENT_UNPUBLISHED: 'Evento despublicado com sucesso',
  
  CONTENT_SAVED: 'Conteúdo salvo com sucesso',
  CHANGES_SAVED: 'Alterações salvas com sucesso',
  OPERATION_SUCCESS: 'Operação realizada com sucesso',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Generic errors
  GENERIC_ERROR: 'Ocorreu um erro inesperado',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  PERMISSION_DENIED: 'Você não tem permissão para realizar esta ação',
  NOT_FOUND: 'Item não encontrado',
  
  // News errors
  NEWS_CREATE_ERROR: 'Erro ao criar notícia',
  NEWS_UPDATE_ERROR: 'Erro ao atualizar notícia',
  NEWS_DELETE_ERROR: 'Erro ao excluir notícia',
  NEWS_FETCH_ERROR: 'Erro ao buscar notícias',
  NEWS_TOGGLE_ERROR: 'Erro ao alterar status da notícia',
  
  // Event errors
  EVENT_CREATE_ERROR: 'Erro ao criar evento',
  EVENT_UPDATE_ERROR: 'Erro ao atualizar evento',
  EVENT_DELETE_ERROR: 'Erro ao excluir evento',
  EVENT_FETCH_ERROR: 'Erro ao buscar eventos',
  EVENT_TOGGLE_ERROR: 'Erro ao alterar status do evento',
  
  // Validation errors
  TITLE_REQUIRED: 'Título é obrigatório',
  CONTENT_REQUIRED: 'Conteúdo é obrigatório',
  DATE_REQUIRED: 'Data é obrigatória',
  INVALID_DATE: 'Data inválida',
  END_DATE_BEFORE_START: 'Data final deve ser após data inicial',
  
  // Authorization errors
  NOT_AUTHORIZED: 'Não autorizado',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
} as const;

// Confirmation Messages
export const CONFIRM_MESSAGES = {
  DELETE_NEWS: 'Tem certeza que deseja excluir esta notícia?',
  DELETE_EVENT: 'Tem certeza que deseja excluir este evento?',
  DELETE_ITEM: 'Tem certeza que deseja excluir este item?',
  UNSAVED_CHANGES: 'Existem alterações não salvas. Deseja continuar?',
  PUBLISH_DRAFT: 'Deseja publicar este rascunho?',
  UNPUBLISH_CONTENT: 'Deseja despublicar este conteúdo?',
} as const;

// Labels and Titles
export const UI_LABELS = {
  // Buttons
  SAVE: 'Salvar',
  CANCEL: 'Cancelar',
  DELETE: 'Excluir',
  EDIT: 'Editar',
  CREATE: 'Criar',
  PUBLISH: 'Publicar',
  UNPUBLISH: 'Despublicar',
  CONFIRM: 'Confirmar',
  CLOSE: 'Fechar',
  
  // Sections
  NEWS: 'Notícias',
  EVENTS: 'Eventos',
  DRAFTS: 'Rascunhos',
  PUBLISHED: 'Publicados',
  FEATURED: 'Destaques',
  
  // Form fields
  TITLE: 'Título',
  SUMMARY: 'Resumo',
  CONTENT: 'Conteúdo',
  DESCRIPTION: 'Descrição',
  LOCATION: 'Local',
  START_DATE: 'Data de Início',
  END_DATE: 'Data de Término',
  IMAGE: 'Imagem',
  
  // Status
  STATUS_PUBLISHED: 'Publicado',
  STATUS_DRAFT: 'Rascunho',
  STATUS_FEATURED: 'Destaque',
  STATUS_ACTIVE: 'Ativo',
  STATUS_INACTIVE: 'Inativo',
} as const;

// Placeholders
export const PLACEHOLDERS = {
  SEARCH: 'Buscar...',
  TITLE: 'Digite o título',
  SUMMARY: 'Digite um resumo',
  CONTENT: 'Digite o conteúdo',
  DESCRIPTION: 'Digite a descrição',
  LOCATION: 'Digite o local',
  IMAGE_URL: 'URL da imagem',
} as const;