

// === MENSAGENS GERAIS DE SISTEMA ===
export const SYSTEM_MESSAGES = {
  // Loading states (encontradas 15+ vezes)
  loading: 'Carregando...',
  processing: 'Processando...',
  saving: 'Salvando...',
  uploading: 'Enviando...',
  downloading: 'Baixando...',
  connecting: 'Conectando...',
  updating: 'Atualizando...',
  deleting: 'Excluindo...',
  
  // Success messages (padronização)
  saveSuccess: 'Salvo com sucesso',
  updateSuccess: 'Atualizado com sucesso',
  deleteSuccess: 'Excluído com sucesso',
  uploadSuccess: 'Enviado com sucesso',
  processComplete: 'Processamento concluído',
  operationSuccess: 'Operação realizada com sucesso',
  
  // Error messages (encontradas 10+ vezes)
  loadError: 'Erro ao carregar dados',
  saveError: 'Erro ao salvar',
  updateError: 'Erro ao atualizar',
  deleteError: 'Erro ao excluir',
  uploadError: 'Erro no upload',
  networkError: 'Erro de conexão. Tente novamente.',
  unexpectedError: 'Erro inesperado. Tente novamente.',
  accessDenied: 'Acesso negado',
  sessionExpired: 'Sessão expirada. Faça login novamente.',
  
  // Empty states (encontradas 12+ vezes)
  noResults: 'Nenhum resultado encontrado',
  noData: 'Nenhum dado disponível',
  emptyList: 'Lista vazia',
  noItems: 'Nenhum item encontrado',
  noContent: 'Nenhum conteúdo disponível',
  
  // Validation messages
  requiredField: 'Campo obrigatório',
  invalidFormat: 'Formato inválido',
  invalidEmail: 'E-mail inválido',
  invalidUrl: 'URL inválida',
  minLength: 'Muito curto',
  maxLength: 'Muito longo',
  passwordMismatch: 'Senhas não coincidem',
  
  // Confirmation messages
  confirmDelete: 'Tem certeza que deseja excluir?',
  confirmLeave: 'Tem certeza que deseja sair? Alterações não salvas serão perdidas.',
  confirmCancel: 'Tem certeza que deseja cancelar?',
  unsavedChanges: 'Existem alterações não salvas',
} as const;

// === LABELS E TEXTOS DE INTERFACE ===
export const UI_LABELS = {
  // Actions (botões mais comuns)
  save: 'Salvar',
  cancel: 'Cancelar',
  edit: 'Editar',
  delete: 'Excluir',
  remove: 'Remover',
  add: 'Adicionar',
  create: 'Criar',
  update: 'Atualizar',
  view: 'Visualizar',
  download: 'Baixar',
  upload: 'Enviar',
  copy: 'Copiar',
  share: 'Compartilhar',
  print: 'Imprimir',
  export: 'Exportar',
  import: 'Importar',
  search: 'Buscar',
  filter: 'Filtrar',
  sort: 'Ordenar',
  refresh: 'Atualizar',
  reset: 'Redefinir',
  clear: 'Limpar',
  close: 'Fechar',
  open: 'Abrir',
  expand: 'Expandir',
  collapse: 'Recolher',
  next: 'Próximo',
  previous: 'Anterior',
  back: 'Voltar',
  continue: 'Continuar',
  finish: 'Finalizar',
  submit: 'Enviar',
  send: 'Enviar',
  ok: 'OK',
  yes: 'Sim',
  no: 'Não',
  
  // Status labels
  active: 'Ativo',
  inactive: 'Inativo',
  enabled: 'Habilitado',
  disabled: 'Desabilitado',
  online: 'Online',
  offline: 'Offline',
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
  new: 'Novo',
  updated: 'Atualizado',
  completed: 'Concluído',
  inProgress: 'Em andamento',
  cancelled: 'Cancelado',
  
  // Common fields
  name: 'Nome',
  email: 'E-mail',
  password: 'Senha',
  confirmPassword: 'Confirmar senha',
  phone: 'Telefone',
  address: 'Endereço',
  city: 'Cidade',
  state: 'Estado',
  zipCode: 'CEP',
  country: 'País',
  description: 'Descrição',
  title: 'Título',
  content: 'Conteúdo',
  category: 'Categoria',
  tag: 'Tag',
  date: 'Data',
  time: 'Horário',
  price: 'Preço',
  quantity: 'Quantidade',
  total: 'Total',
  subtotal: 'Subtotal',
  tax: 'Imposto',
  discount: 'Desconto',
  
  // Navigation
  home: 'Início',
  dashboard: 'Dashboard',
  profile: 'Perfil',
  settings: 'Configurações',
  help: 'Ajuda',
  about: 'Sobre',
  contact: 'Contato',
  login: 'Entrar',
  logout: 'Sair',
  register: 'Cadastrar',
  menu: 'Menu',
  
  // File operations
  file: 'Arquivo',
  folder: 'Pasta',
  image: 'Imagem',
  video: 'Vídeo',
  document: 'Documento',
  selectFile: 'Selecionar arquivo',
  dragDrop: 'Arraste e solte ou clique para selecionar',
  fileSize: 'Tamanho do arquivo',
  fileType: 'Tipo de arquivo',
  fileName: 'Nome do arquivo',
  
  // Time and dates
  today: 'Hoje',
  yesterday: 'Ontem',
  tomorrow: 'Amanhã',
  thisWeek: 'Esta semana',
  lastWeek: 'Semana passada',
  nextWeek: 'Próxima semana',
  thisMonth: 'Este mês',
  lastMonth: 'Mês passado',
  nextMonth: 'Próximo mês',
  thisYear: 'Este ano',
  lastYear: 'Ano passado',
  nextYear: 'Próximo ano',
  
  // Pagination
  first: 'Primeiro',
  last: 'Último',
  page: 'Página',
  of: 'de',
  items: 'itens',
  per: 'por',
  showing: 'Mostrando',
  to: 'até',
  results: 'resultados',
} as const;

// === MENSAGENS DE VALIDAÇÃO ===
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} é obrigatório`,
  minLength: (field: string, min: number) => `${field} deve ter pelo menos ${min} caracteres`,
  maxLength: (field: string, max: number) => `${field} não pode exceder ${max} caracteres`,
  minValue: (field: string, min: number) => `${field} deve ser pelo menos ${min}`,
  maxValue: (field: string, max: number) => `${field} não pode exceder ${max}`,
  invalidEmail: (field: string = 'E-mail') => `${field} deve ser um e-mail válido`,
  invalidUrl: (field: string = 'URL') => `${field} deve ser uma URL válida`,
  invalidDate: (field: string = 'Data') => `${field} deve ser uma data válida`,
  invalidTime: (field: string = 'Horário') => `${field} deve ser um horário válido`,
  passwordMismatch: 'Senhas não coincidem',
  weakPassword: 'Senha muito fraca',
  strongPassword: 'Senha forte',
  fileTooBig: (maxSize: string) => `Arquivo muito grande. Máximo: ${maxSize}`,
  invalidFileType: (types: string) => `Tipo de arquivo inválido. Aceitos: ${types}`,
  numberOnly: (field: string) => `${field} deve conter apenas números`,
  lettersOnly: (field: string) => `${field} deve conter apenas letras`,
  alphanumeric: (field: string) => `${field} deve conter apenas letras e números`,
} as const;

// === TEXTOS ESPECÍFICOS DO CRESOL ===
export const CRESOL_TEXTS = {
  // Branding
  appName: 'HUB 2.0',
  company: 'Cresol',
  companyFull: 'Cooperativa Central de Crédito Rural com Interação Solidária',
  tagline: 'Portal de Acesso Interno',
  
  // Navigation específica
  admin: 'Administração',
  adminPanel: 'Painel Administrativo',
  sectorAdmin: 'Administração Setorial',
  subsectorAdmin: 'Administração Subsetorial',
  sectors: 'Setores',
  subsectors: 'Subsetores',
  systems: 'Sistemas',
  users: 'Usuários',
  notifications: 'Notificações',
  gallery: 'Galeria',
  videos: 'Vídeos',
  banners: 'Banners',
  economicIndicators: 'Indicadores Econômicos',
  accessRequests: 'Solicitações de Acesso',
  systemLinks: 'Links do Sistema',
  workLocations: 'Locais de Trabalho',
  positions: 'Cargos',
  team: 'Equipe',
  
  // Roles/Permissions
  roleAdmin: 'Administrador',
  roleSectorAdmin: 'Administrador Setorial',
  roleUser: 'Usuário',
  
  // Status específicos
  approved: 'Aprovado',
  pending: 'Pendente',
  rejected: 'Rejeitado',
  
  // Tipos de upload
  youtube: 'YouTube',
  directUpload: 'Upload Direto',
  
  // Prioridades de notificação
  priorityLow: 'Baixa',
  priorityNormal: 'Normal',
  priorityHigh: 'Alta',
  priorityUrgent: 'Urgente',
} as const;

// === MENSAGENS DE ERRO ESPECÍFICAS ===
export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: 'E-mail ou senha incorretos',
    sessionExpired: 'Sua sessão expirou. Faça login novamente',
    accessDenied: 'Você não tem permissão para acessar esta página',
    accountLocked: 'Conta bloqueada. Entre em contato com o administrador',
    emailNotVerified: 'E-mail não verificado',
    weakPassword: 'Senha muito fraca. Use pelo menos 8 caracteres',
    emailInUse: 'E-mail já está em uso',
    invalidToken: 'Token inválido ou expirado',
  },
  
  upload: {
    fileTooBig: 'Arquivo muito grande',
    invalidFormat: 'Formato de arquivo não suportado',
    uploadFailed: 'Falha no upload. Tente novamente',
    networkError: 'Erro de conexão durante o upload',
    serverError: 'Erro no servidor. Tente mais tarde',
    quotaExceeded: 'Cota de armazenamento excedida',
  },
  
  validation: {
    required: 'Este campo é obrigatório',
    email: 'Digite um e-mail válido',
    url: 'Digite uma URL válida',
    phone: 'Digite um telefone válido',
    cpf: 'CPF inválido',
    cnpj: 'CNPJ inválido',
    cep: 'CEP inválido',
  },
  
  network: {
    offline: 'Você está offline. Verifique sua conexão',
    timeout: 'Tempo limite excedido. Tente novamente',
    serverUnavailable: 'Servidor indisponível. Tente mais tarde',
    rateLimitExceeded: 'Muitas tentativas. Aguarde antes de tentar novamente',
  },
} as const;

// === HELP TEXTS E TOOLTIPS ===
export const HELP_TEXTS = {
  // Form help texts
  password: 'Mínimo de 8 caracteres, incluindo letras e números',
  email: 'Será usado para login e comunicações',
  phone: 'Formato: (11) 99999-9999',
  optional: 'Campo opcional',
  required: 'Campo obrigatório',
  maxFileSize: 'Tamanho máximo',
  supportedFormats: 'Formatos suportados',
  
  // Feature explanations
  dragDrop: 'Você pode arrastar arquivos diretamente para esta área',
  multiSelect: 'Mantenha Ctrl pressionado para selecionar múltiplos itens',
  searchTips: 'Use palavras-chave para encontrar resultados mais precisos',
  filterTips: 'Combine múltiplos filtros para resultados específicos',
  
  // Keyboard shortcuts
  shortcuts: {
    save: 'Ctrl + S para salvar',
    search: 'Ctrl + F para buscar',
    copy: 'Ctrl + C para copiar',
    paste: 'Ctrl + V para colar',
    undo: 'Ctrl + Z para desfazer',
    redo: 'Ctrl + Y para refazer',
    selectAll: 'Ctrl + A para selecionar tudo',
  },
} as const;

// === EXPORT PRINCIPAL ===
export const CRESOL_TEXT_CONSTANTS = {
  system: SYSTEM_MESSAGES,
  ui: UI_LABELS,
  validation: VALIDATION_MESSAGES,
  cresol: CRESOL_TEXTS,
  errors: ERROR_MESSAGES,
  help: HELP_TEXTS,
} as const;

// === UTILITY FUNCTIONS ===
export const formatMessage = (template: string, ...args: (string | number)[]) => {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return args[index] !== undefined ? String(args[index]) : match;
  });
};

export const getMessage = (category: keyof typeof CRESOL_TEXT_CONSTANTS, key: string) => {
  const categoryObj = CRESOL_TEXT_CONSTANTS[category] as any;
  return categoryObj[key] || key;
};

// === TIPOS TYPESCRIPT ===
export type SystemMessages = typeof SYSTEM_MESSAGES;
export type UILabels = typeof UI_LABELS;
export type ValidationMessages = typeof VALIDATION_MESSAGES;
export type CresolTexts = typeof CRESOL_TEXTS;
export type ErrorMessages = typeof ERROR_MESSAGES;
export type HelpTexts = typeof HELP_TEXTS;
export type CresolTextConstants = typeof CRESOL_TEXT_CONSTANTS;