/**
 * Constantes centralizadas para mensagens de loading
 * Elimina hardcode e duplicação de textos
 * Garante consistência em toda a aplicação
 */

export const LOADING_MESSAGES = {
  // ===== MENSAGENS GERAIS =====
  default: 'Carregando...',
  saving: 'Salvando...',
  sending: 'Enviando...',
  processing: 'Processando...',
  loading: 'Carregando...',
  updating: 'Atualizando...',
  deleting: 'Excluindo...',
  validating: 'Validando...',
  searching: 'Buscando...',
  wait: 'Aguarde...',
  
  // ===== MENSAGENS POR CONTEXTO =====
  // Dashboard e páginas principais
  dashboard: 'Carregando dashboard...',
  profile: 'Carregando perfil...',
  sectors: 'Carregando setores...',
  subsectors: 'Carregando subsetores...',
  home: 'Carregando página inicial...',
  login: 'Entrando...',
  logout: 'Saindo...',
  
  // Conteúdo e mídia
  videos: 'Carregando vídeos...',
  images: 'Carregando imagens...',
  gallery: 'Carregando galeria...',
  banners: 'Carregando banners...',
  news: 'Carregando notícias...',
  events: 'Carregando eventos...',
  
  // Administração
  users: 'Carregando usuários...',
  permissions: 'Carregando permissões...',
  systems: 'Carregando sistemas...',
  notifications: 'Carregando notificações...',
  settings: 'Carregando configurações...',
  analytics: 'Carregando análises...',
  reports: 'Carregando relatórios...',
  
  // ===== MENSAGENS DE UPLOAD =====
  uploadingFile: 'Enviando arquivo...',
  uploadingImage: 'Enviando imagem...',
  uploadingVideo: 'Enviando vídeo...',
  uploadingDocument: 'Enviando documento...',
  uploadProgress: 'Enviando... {progress}%',
  
  // ===== MENSAGENS DE PROCESSAMENTO =====
  processingImage: 'Processando imagem...',
  processingVideo: 'Processando vídeo...',
  generatingThumbnail: 'Gerando miniatura...',
  optimizingImage: 'Otimizando imagem...',
  
  // ===== MENSAGENS DE FORMULÁRIO =====
  submittingForm: 'Enviando formulário...',
  validatingData: 'Validando dados...',
  savingChanges: 'Salvando alterações...',
  creatingRecord: 'Criando registro...',
  updatingRecord: 'Atualizando registro...',
  deletingRecord: 'Excluindo registro...',
  
  // ===== MENSAGENS DE AUTENTICAÇÃO =====
  authenticating: 'Autenticando...',
  checkingSession: 'Verificando sessão...',
  refreshingToken: 'Renovando autenticação...',
  loggingIn: 'Fazendo login...',
  loggingOut: 'Fazendo logout...',
  
  // ===== MENSAGENS DE REDE =====
  connecting: 'Conectando...',
  reconnecting: 'Reconectando...',
  syncingData: 'Sincronizando dados...',
  fetchingData: 'Buscando dados...',
  downloadingFile: 'Baixando arquivo...',
  
  // ===== MENSAGENS DE ERRO E RETRY =====
  retrying: 'Tentando novamente...',
  recovering: 'Recuperando...',
  restoring: 'Restaurando...',
} as const;

// Tipo para garantir type-safety
export type LoadingMessage = typeof LOADING_MESSAGES[keyof typeof LOADING_MESSAGES];

/**
 * Função helper para mensagens com variáveis
 * @example getLoadingMessage('uploadProgress', { progress: 50 }) => "Enviando... 50%"
 */
export function getLoadingMessage(
  key: keyof typeof LOADING_MESSAGES,
  variables?: Record<string, string | number>
): string {
  let message: string = LOADING_MESSAGES[key];
  
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }
  
  return message;
}

// Exportação de grupos específicos para facilitar imports
export const UPLOAD_MESSAGES = {
  file: LOADING_MESSAGES.uploadingFile,
  image: LOADING_MESSAGES.uploadingImage,
  video: LOADING_MESSAGES.uploadingVideo,
  document: LOADING_MESSAGES.uploadingDocument,
  progress: LOADING_MESSAGES.uploadProgress,
} as const;

export const AUTH_MESSAGES = {
  login: LOADING_MESSAGES.loggingIn,
  logout: LOADING_MESSAGES.loggingOut,
  authenticating: LOADING_MESSAGES.authenticating,
  checkingSession: LOADING_MESSAGES.checkingSession,
  refreshingToken: LOADING_MESSAGES.refreshingToken,
} as const;

export const FORM_MESSAGES = {
  submit: LOADING_MESSAGES.submittingForm,
  validate: LOADING_MESSAGES.validatingData,
  save: LOADING_MESSAGES.savingChanges,
  create: LOADING_MESSAGES.creatingRecord,
  update: LOADING_MESSAGES.updatingRecord,
  delete: LOADING_MESSAGES.deletingRecord,
} as const;