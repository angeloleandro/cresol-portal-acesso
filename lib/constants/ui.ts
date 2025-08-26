// Constantes de UI e textos da interface
// Centraliza todas as strings e configurações de UI

// ========== Textos de Interface ==========
export const UI_TEXT = {
  // Botões
  BUTTONS: {
    SAVE: 'Salvar',
    CANCEL: 'Cancelar',
    DELETE: 'Excluir',
    EDIT: 'Editar',
    CREATE: 'Criar',
    NEW: 'Novo',
    ADD: 'Adicionar',
    REMOVE: 'Remover',
    CONFIRM: 'Confirmar',
    CLOSE: 'Fechar',
    SEARCH: 'Buscar',
    FILTER: 'Filtrar',
    EXPORT: 'Exportar',
    IMPORT: 'Importar',
    DOWNLOAD: 'Baixar',
    UPLOAD: 'Enviar',
    REFRESH: 'Atualizar',
    BACK: 'Voltar',
    NEXT: 'Próximo',
    PREVIOUS: 'Anterior',
    LOGIN: 'Entrar',
    LOGOUT: 'Sair',
    REGISTER: 'Cadastrar',
  },

  // Labels
  LABELS: {
    TITLE: 'Título',
    DESCRIPTION: 'Descrição',
    NAME: 'Nome',
    EMAIL: 'E-mail',
    PASSWORD: 'Senha',
    CONFIRM_PASSWORD: 'Confirmar Senha',
    DATE: 'Data',
    TIME: 'Hora',
    STATUS: 'Status',
    TYPE: 'Tipo',
    CATEGORY: 'Categoria',
    TAGS: 'Tags',
    FEATURED: 'Destaque',
    PUBLISHED: 'Publicado',
    DRAFT: 'Rascunho',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    REQUIRED: 'Obrigatório',
    OPTIONAL: 'Opcional',
  },

  // Mensagens
  MESSAGES: {
    LOADING: 'Carregando...',
    SAVING: 'Salvando...',
    DELETING: 'Excluindo...',
    UPLOADING: 'Enviando arquivo...',
    PROCESSING: 'Processando...',
    NO_DATA: 'Nenhum dado encontrado',
    NO_RESULTS: 'Nenhum resultado encontrado',
    ERROR_GENERIC: 'Ocorreu um erro. Tente novamente.',
    ERROR_CONNECTION: 'Erro de conexão. Verifique sua internet.',
    ERROR_VALIDATION: 'Por favor, verifique os campos obrigatórios.',
    SUCCESS_SAVE: 'Salvo com sucesso!',
    SUCCESS_DELETE: 'Excluído com sucesso!',
    SUCCESS_UPDATE: 'Atualizado com sucesso!',
    CONFIRM_DELETE: 'Tem certeza que deseja excluir?',
    CONFIRM_ACTION: 'Tem certeza que deseja continuar?',
    UNSAVED_CHANGES: 'Você tem alterações não salvas. Deseja continuar?',
  },

  // Placeholders
  PLACEHOLDERS: {
    SEARCH: 'Digite para buscar...',
    SELECT: 'Selecione uma opção',
    ENTER_TEXT: 'Digite aqui...',
    ENTER_EMAIL: 'seu@email.com',
    ENTER_PASSWORD: 'Digite sua senha',
    ENTER_NAME: 'Digite o nome',
    ENTER_TITLE: 'Digite o título',
    ENTER_DESCRIPTION: 'Digite a descrição',
    CHOOSE_FILE: 'Escolher arquivo',
    DROP_FILES: 'Arraste arquivos aqui ou clique para selecionar',
  },

  // Validações
  VALIDATIONS: {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    INVALID_EMAIL: 'E-mail inválido',
    PASSWORD_MIN: 'A senha deve ter no mínimo 6 caracteres',
    PASSWORD_MATCH: 'As senhas não coincidem',
    MIN_LENGTH: (min: number) => `Mínimo de ${min} caracteres`,
    MAX_LENGTH: (max: number) => `Máximo de ${max} caracteres`,
    MIN_VALUE: (min: number) => `Valor mínimo: ${min}`,
    MAX_VALUE: (max: number) => `Valor máximo: ${max}`,
    INVALID_FORMAT: 'Formato inválido',
    FILE_TOO_LARGE: (max: string) => `Arquivo muito grande. Máximo: ${max}`,
    INVALID_FILE_TYPE: 'Tipo de arquivo não permitido',
  },

  // Títulos de Seção
  SECTIONS: {
    DASHBOARD: 'Dashboard',
    PROFILE: 'Perfil',
    SETTINGS: 'Configurações',
    USERS: 'Usuários',
    SECTORS: 'Setores',
    SUBSECTORS: 'Subsetores',
    DOCUMENTS: 'Documentos',
    NEWS: 'Notícias',
    EVENTS: 'Eventos',
    MESSAGES: 'Mensagens',
    IMAGES: 'Imagens',
    VIDEOS: 'Vídeos',
    GALLERY: 'Galeria',
    COLLECTIONS: 'Coleções',
    REPORTS: 'Relatórios',
    NOTIFICATIONS: 'Notificações',
  },
};

// ========== Estados de Loading ==========
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// ========== Tamanhos de Componentes ==========
export const COMPONENT_SIZES = {
  BUTTON: {
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl',
  },
  INPUT: {
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
  },
  MODAL: {
    SM: 'max-w-sm',
    MD: 'max-w-md',
    LG: 'max-w-lg',
    XL: 'max-w-xl',
    '2XL': 'max-w-2xl',
    '3XL': 'max-w-3xl',
    FULL: 'max-w-full',
  },
};

// ========== Variantes de Componentes ==========
export const COMPONENT_VARIANTS = {
  BUTTON: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    DANGER: 'danger',
    WARNING: 'warning',
    INFO: 'info',
    GHOST: 'ghost',
    LINK: 'link',
  },
  ALERT: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  BADGE: {
    DEFAULT: 'default',
    PRIMARY: 'primary',
    SUCCESS: 'success',
    DANGER: 'danger',
    WARNING: 'warning',
    INFO: 'info',
  },
};

// ========== Animações ==========
export const ANIMATIONS = {
  FADE_IN: 'fade-in',
  FADE_OUT: 'fade-out',
  SLIDE_UP: 'slide-up',
  SLIDE_DOWN: 'slide-down',
  SLIDE_LEFT: 'slide-left',
  SLIDE_RIGHT: 'slide-right',
  SCALE_IN: 'scale-in',
  SCALE_OUT: 'scale-out',
  SPIN: 'animate-spin',
  PULSE: 'animate-pulse',
  BOUNCE: 'animate-bounce',
};

// ========== Breakpoints ==========
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// ========== Z-Index ==========
export const Z_INDEX = {
  DROPDOWN: 10,
  STICKY: 20,
  FIXED: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  POPOVER: 60,
  TOOLTIP: 70,
  TOAST: 80,
};

// ========== Durations ==========
export const DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  TOAST: 5000,
  REDIRECT: 2000,
};