

// === SUCCESS MESSAGES ===
export const SUCCESS_MESSAGES = {
  // CRUD Operations - Genérico
  created: 'Criado com sucesso!',
  updated: 'Atualizado com sucesso!',
  deleted: 'Removido com sucesso!',
  saved: 'Salvo com sucesso!',
  
  // Específicos por entidade
  news: {
    created: 'Notícia criada com sucesso!',
    updated: 'Notícia atualizada com sucesso!',
    deleted: 'Notícia removida com sucesso!',
    published: 'Notícia publicada com sucesso!',
    draft: 'Notícia salva como rascunho!'
  },
  
  event: {
    created: 'Evento criado com sucesso!',
    updated: 'Evento atualizado com sucesso!',
    deleted: 'Evento removido com sucesso!',
    published: 'Evento publicado com sucesso!'
  },
  
  document: {
    created: 'Documento criado com sucesso!',
    updated: 'Documento atualizado com sucesso!',
    deleted: 'Documento removido com sucesso!',
    uploaded: 'Documento enviado com sucesso!'
  },
  
  user: {
    created: 'Usuário criado com sucesso!',
    updated: 'Usuário atualizado com sucesso!',
    deleted: 'Usuário removido com sucesso!',
    roleUpdated: 'Função do usuário atualizada com sucesso!',
    approved: 'Usuário aprovado com sucesso!',
    passwordReset: 'Senha redefinida com sucesso!'
  },
  
  sector: {
    created: 'Setor criado com sucesso!',
    updated: 'Setor atualizado com sucesso!',
    deleted: 'Setor removido com sucesso!'
  },
  
  subsector: {
    created: 'Subsetor criado com sucesso!',
    updated: 'Subsetor atualizado com sucesso!',
    deleted: 'Subsetor removido com sucesso!',
    teamUpdated: 'Equipe atualizada com sucesso!'
  },
  
  system: {
    created: 'Sistema criado com sucesso!',
    updated: 'Sistema atualizado com sucesso!',
    deleted: 'Sistema removido com sucesso!'
  },
  
  banner: {
    created: 'Banner criado com sucesso!',
    updated: 'Banner atualizado com sucesso!',
    deleted: 'Banner removido com sucesso!',
    uploaded: 'Banner enviado com sucesso!'
  },
  
  video: {
    created: 'Vídeo criado com sucesso!',
    updated: 'Vídeo atualizado com sucesso!',
    deleted: 'Vídeo removido com sucesso!',
    uploaded: 'Vídeo enviado com sucesso!',
    processing: 'Vídeo está sendo processado...',
    thumbnailGenerated: 'Miniatura gerada com sucesso!'
  },
  
  image: {
    uploaded: 'Imagem enviada com sucesso!',
    processed: 'Imagem processada com sucesso!',
    cropped: 'Imagem recortada com sucesso!',
    deleted: 'Imagem removida com sucesso!'
  },
  
  collection: {
    created: 'Coleção criada com sucesso!',
    updated: 'Coleção atualizada com sucesso!',
    deleted: 'Coleção removida com sucesso!',
    reordered: 'Itens reordenados com sucesso!'
  },
  
  message: {
    sent: 'Mensagem enviada com sucesso!',
    created: 'Mensagem criada com sucesso!',
    updated: 'Mensagem atualizada com sucesso!',
    deleted: 'Mensagem removida com sucesso!'
  },
  
  // Operations
  auth: {
    login: 'Login realizado com sucesso!',
    logout: 'Logout realizado com sucesso!',
    passwordChanged: 'Senha alterada com sucesso!'
  },
  
  upload: {
    success: 'Upload realizado com sucesso!',
    multiple: 'Arquivos enviados com sucesso!',
    processing: 'Arquivo sendo processado...'
  },
  
  copy: {
    success: 'Copiado para a área de transferência!',
    url: 'Link copiado com sucesso!',
    text: 'Texto copiado com sucesso!'
  },
  
  export: {
    success: 'Dados exportados com sucesso!',
    pdf: 'PDF gerado com sucesso!',
    excel: 'Planilha exportada com sucesso!'
  },
  
  import: {
    success: 'Dados importados com sucesso!',
    processing: 'Importação sendo processada...'
  },
  
  sync: {
    success: 'Sincronização concluída com sucesso!',
    processing: 'Sincronizando dados...'
  }
} as const;

// === ERROR MESSAGES ===
export const ERROR_MESSAGES = {
  // Generic
  generic: 'Ocorreu um erro. Tente novamente.',
  network: 'Erro de conexão. Verifique sua internet.',
  timeout: 'A operação excedeu o tempo limite.',
  unauthorized: 'Não autorizado.',
  forbidden: 'Acesso negado.',
  notFound: 'Não encontrado.',
  conflict: 'Conflito de dados.',
  validationError: 'Dados inválidos.',
  
  // Authentication
  auth: {
    invalidCredentials: 'Credenciais inválidas.',
    sessionExpired: 'Sessão expirada. Faça login novamente.',
    accessDenied: 'Acesso negado.',
    userNotFound: 'Usuário não encontrado.',
    invalidToken: 'Token inválido.',
    passwordWeak: 'Senha muito fraca.'
  },
  
  // Validation
  validation: {
    required: 'Este campo é obrigatório.',
    email: 'Email inválido.',
    phone: 'Telefone inválido.',
    url: 'URL inválida.',
    minLength: 'Muito curto.',
    maxLength: 'Muito longo.',
    numeric: 'Deve ser um número.',
    positive: 'Deve ser positivo.',
    dateInvalid: 'Data inválida.',
    futureDateRequired: 'Data deve ser futura.',
    pastDateRequired: 'Data deve ser no passado.'
  },
  
  // File operations
  file: {
    uploadFailed: 'Falha no upload do arquivo.',
    fileTooLarge: 'Arquivo muito grande.',
    invalidType: 'Tipo de arquivo não suportado.',
    processingFailed: 'Falha no processamento do arquivo.',
    downloadFailed: 'Falha no download do arquivo.',
    corruptedFile: 'Arquivo corrompido.',
    virusDetected: 'Arquivo contém vírus.'
  },
  
  // Database operations
  database: {
    connectionFailed: 'Falha na conexão com o banco.',
    queryFailed: 'Erro na consulta.',
    duplicateEntry: 'Registro já existe.',
    foreignKeyConstraint: 'Não é possível excluir - existem dependências.',
    migrationFailed: 'Falha na migração.'
  },
  
  // Entity specific
  news: {
    notFound: 'Notícia não encontrada.',
    createFailed: 'Falha ao criar notícia.',
    updateFailed: 'Falha ao atualizar notícia.',
    deleteFailed: 'Falha ao remover notícia.',
    duplicateTitle: 'Título já existe.'
  },
  
  event: {
    notFound: 'Evento não encontrado.',
    createFailed: 'Falha ao criar evento.',
    updateFailed: 'Falha ao atualizar evento.',
    deleteFailed: 'Falha ao remover evento.',
    dateConflict: 'Conflito de datas.'
  },
  
  user: {
    notFound: 'Usuário não encontrado.',
    createFailed: 'Falha ao criar usuário.',
    updateFailed: 'Falha ao atualizar usuário.',
    deleteFailed: 'Falha ao remover usuário.',
    emailExists: 'Email já cadastrado.',
    invalidRole: 'Função inválida.'
  },
  
  system: {
    notFound: 'Sistema não encontrado.',
    urlInvalid: 'URL do sistema inválida.',
    offline: 'Sistema indisponível.',
    maintenance: 'Sistema em manutenção.'
  },
  
  video: {
    notFound: 'Vídeo não encontrado.',
    processingFailed: 'Falha no processamento do vídeo.',
    invalidFormat: 'Formato de vídeo não suportado.',
    thumbnailFailed: 'Falha ao gerar miniatura.',
    youtubeInvalid: 'URL do YouTube inválida.'
  },
  
  collection: {
    notFound: 'Coleção não encontrada.',
    itemNotFound: 'Item da coleção não encontrado.',
    reorderFailed: 'Falha ao reordenar itens.',
    limitExceeded: 'Limite de itens excedido.'
  }
} as const;

// === WARNING MESSAGES ===
export const WARNING_MESSAGES = {
  // General
  unsavedChanges: 'Há alterações não salvas. Deseja continuar?',
  dataLoss: 'Esta ação não pode ser desfeita.',
  largFile: 'Arquivo grande pode demorar para processar.',
  lowStorage: 'Espaço de armazenamento baixo.',
  
  // Permissions
  limitedAccess: 'Acesso limitado a este recurso.',
  readOnly: 'Modo somente leitura.',
  expiring: 'Seu acesso expira em breve.',
  
  // Performance
  slowConnection: 'Conexão lenta detectada.',
  manyResults: 'Muitos resultados. Considere filtrar.',
  heavyOperation: 'Esta operação pode demorar.',
  
  // Data
  outdatedData: 'Dados podem estar desatualizados.',
  duplicateData: 'Possível duplicação de dados.',
  incompleteData: 'Alguns dados estão incompletos.',
  
  // Operations
  bulkOperation: 'Operação em lote pode demorar.',
  irreversible: 'Esta operação é irreversível.',
  systemMaintenance: 'Manutenção programada em breve.',
  
  // Files
  oldFileVersion: 'Versão antiga do arquivo.',
  largeFileSize: 'Arquivo muito grande.',
  formatCompatibility: 'Formato pode ter problemas de compatibilidade.'
} as const;

// === INFORMATIONAL MESSAGES ===
export const INFO_MESSAGES = {
  // General
  loading: 'Carregando...',
  processing: 'Processando...',
  saving: 'Salvando...',
  searching: 'Buscando...',
  uploading: 'Enviando...',
  downloading: 'Baixando...',
  
  // Progress
  almostDone: 'Quase terminando...',
  pleaseWait: 'Por favor, aguarde...',
  preparingData: 'Preparando dados...',
  
  // Empty states
  noData: 'Nenhum dado encontrado.',
  noResults: 'Nenhum resultado encontrado.',
  noItems: 'Nenhum item disponível.',
  emptyList: 'Lista vazia.',
  noContent: 'Sem conteúdo para exibir.',
  
  // Instructions
  selectFile: 'Selecione um arquivo para continuar.',
  fillRequired: 'Preencha os campos obrigatórios.',
  reviewData: 'Revise os dados antes de continuar.',
  confirmAction: 'Confirme sua ação.',
  
  // Tips
  dragDrop: 'Arraste e solte arquivos aqui.',
  multipleSelect: 'Mantenha Ctrl pressionado para seleção múltipla.',
  keyboardShortcuts: 'Use Ctrl+S para salvar rapidamente.',
  filterTip: 'Use filtros para refinar os resultados.',
  
  // Features
  newFeature: 'Nova funcionalidade disponível!',
  improved: 'Funcionalidade melhorada.',
  beta: 'Recurso em fase beta.',
  experimental: 'Recurso experimental.'
} as const;

// === CONFIRMATION MESSAGES ===
export const CONFIRMATION_MESSAGES = {
  // Delete operations
  delete: {
    single: 'Tem certeza que deseja excluir este item?',
    multiple: 'Tem certeza que deseja excluir os itens selecionados?',
    permanent: 'Esta exclusão é permanente e não pode ser desfeita.',
    news: 'Tem certeza que deseja excluir esta notícia?',
    event: 'Tem certeza que deseja excluir este evento?',
    user: 'Tem certeza que deseja excluir este usuário?',
    document: 'Tem certeza que deseja excluir este documento?',
    video: 'Tem certeza que deseja excluir este vídeo?',
    collection: 'Tem certeza que deseja excluir esta coleção?'
  },
  
  // Save/Update operations
  save: {
    changes: 'Deseja salvar as alterações?',
    draft: 'Salvar como rascunho?',
    publish: 'Publicar agora?',
    overwrite: 'Substituir arquivo existente?'
  },
  
  // Leave/Cancel operations
  leave: {
    unsaved: 'Sair sem salvar as alterações?',
    process: 'Cancelar processo em andamento?',
    form: 'Sair do formulário sem salvar?'
  },
  
  // Reset operations
  reset: {
    form: 'Limpar todos os campos do formulário?',
    password: 'Redefinir senha do usuário?',
    settings: 'Restaurar configurações padrão?',
    filters: 'Limpar todos os filtros?'
  },
  
  // Send/Submit operations
  submit: {
    form: 'Enviar formulário?',
    message: 'Enviar mensagem?',
    notification: 'Enviar notificação?',
    bulk: 'Processar todos os itens selecionados?'
  }
} as const;

// === CONSOLIDATED EXPORT ===
export const MESSAGE_CONSTANTS = {
  success: SUCCESS_MESSAGES,
  error: ERROR_MESSAGES,
  warning: WARNING_MESSAGES,
  info: INFO_MESSAGES,
  confirmation: CONFIRMATION_MESSAGES
} as const;

// === HELPER FUNCTIONS ===
export const MESSAGE_HELPERS = {
  /**
   * Get entity-specific success message
   */
  getSuccessMessage: (entity: string, operation: string): string => {
    const entityMessages = (SUCCESS_MESSAGES as any)[entity];
    return entityMessages?.[operation] || SUCCESS_MESSAGES[operation as keyof typeof SUCCESS_MESSAGES] || SUCCESS_MESSAGES.saved;
  },
  
  /**
   * Get entity-specific error message
   */
  getErrorMessage: (entity: string, operation: string): string => {
    const entityMessages = (ERROR_MESSAGES as any)[entity];
    return entityMessages?.[operation] || ERROR_MESSAGES.generic;
  },
  
  /**
   * Format message with parameters
   */
  formatMessage: (message: string, params: Record<string, any>): string => {
    return message.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
  },
  
  /**
   * Get confirmation message for delete operation
   */
  getDeleteConfirmation: (entity?: string): string => {
    if (entity && (CONFIRMATION_MESSAGES.delete as any)[entity]) {
      return (CONFIRMATION_MESSAGES.delete as any)[entity];
    }
    return CONFIRMATION_MESSAGES.delete.single;
  },
  
  /**
   * Capitalize first letter
   */
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
  
  /**
   * Get loading message for operation
   */
  getLoadingMessage: (operation?: string): string => {
    if (operation && (INFO_MESSAGES as any)[operation]) {
      return (INFO_MESSAGES as any)[operation];
    }
    return INFO_MESSAGES.loading;
  }
} as const;

// === TYPESCRIPT TYPES ===
export type SuccessMessages = typeof SUCCESS_MESSAGES;
export type ErrorMessages = typeof ERROR_MESSAGES;
export type WarningMessages = typeof WARNING_MESSAGES;
export type InfoMessages = typeof INFO_MESSAGES;
export type ConfirmationMessages = typeof CONFIRMATION_MESSAGES;
export type MessageConstants = typeof MESSAGE_CONSTANTS;
export type MessageHelpers = typeof MESSAGE_HELPERS;