/**
 * Subsector Configuration Constants
 * Centralized configuration specific to subsector management
 * Eliminates hardcoded values in subsector components
 */

// ===== SUBSECTOR ROLES =====
export const SUBSECTOR_ROLES = {
  admin: 'admin',
  sectorAdmin: 'sector_admin',
  subsectorAdmin: 'subsector_admin',
  user: 'user'
} as const;

export type Role = (typeof SUBSECTOR_ROLES)[keyof typeof SUBSECTOR_ROLES];

export const SUBSECTOR_ROLE_LABELS = {
  [SUBSECTOR_ROLES.admin]: 'Administrador',
  [SUBSECTOR_ROLES.sectorAdmin]: 'Admin Setorial',
  [SUBSECTOR_ROLES.subsectorAdmin]: 'Admin Subsetorial',
  [SUBSECTOR_ROLES.user]: 'Usuário'
} as const;

// ===== TAB TYPES =====
export const SUBSECTOR_TABS = {
  events: 'events',
  news: 'news',
  systems: 'systems',
  groups: 'groups',
  messages: 'messages'
} as const;

export const SUBSECTOR_TAB_LABELS = {
  [SUBSECTOR_TABS.events]: 'Eventos',
  [SUBSECTOR_TABS.news]: 'Notícias',
  [SUBSECTOR_TABS.systems]: 'Sistemas',
  [SUBSECTOR_TABS.groups]: 'Grupos',
  [SUBSECTOR_TABS.messages]: 'Mensagens'
} as const;

// ===== STATISTICS CONFIGURATION =====
export const SUBSECTOR_STATS = {
  defaultStats: {
    totalEvents: 0,
    publishedEvents: 0,
    totalNews: 0,
    publishedNews: 0,
    totalSystems: 0
  },
  
  colors: {
    events: 'text-primary',
    news: 'text-green-600',
    systems: 'text-blue-600',
    groups: 'text-purple-600',
    messages: 'text-orange-600'
  },
  
  icons: {
    events: 'calendar',
    news: 'newspaper',
    systems: 'cog',
    groups: 'users',
    messages: 'chat'
  }
} as const;

// ===== BREADCRUMB CONFIGURATION =====
export const SUBSECTOR_BREADCRUMBS = {
  base: [
    { label: 'Admin', href: '/admin' },
    { label: 'Subsetores', href: '/admin-subsetor' }
  ],
  
  classes: {
    container: 'bg-white border-b',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'
  }
} as const;

// ===== CARD LAYOUT =====
export const SUBSECTOR_CARD_LAYOUT = {
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  
  card: {
    base: 'bg-white rounded-lg border border-gray-200 hover:border-primary/30 transition-colors',
    content: 'p-6',
    header: 'flex items-center justify-between mb-4',
    title: 'text-lg font-semibold text-cresol-gray',
    subtitle: 'text-sm text-gray-500 mb-4',
    stats: 'grid grid-cols-2 gap-4 mb-6',
    actions: 'space-y-2'
  },
  
  icon: {
    container: 'w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center',
    svg: 'w-6 h-6 text-primary'
  },
  
  stat: {
    container: 'text-center',
    value: 'text-2xl font-bold',
    label: 'text-xs text-cresol-gray'
  }
} as const;

// ===== EMPTY STATE CONFIGURATION =====
export const SUBSECTOR_EMPTY_STATE = {
  noSubsectors: {
    icon: '📂',
    iconSize: 'text-6xl text-gray-300 mb-4',
    title: 'text-lg font-semibold text-cresol-gray mb-2',
    message: 'text-cresol-gray',
    container: 'bg-white rounded-lg border border-gray-200 p-8 text-center'
  }
} as const;

// ===== MANAGEMENT ACTIONS =====
export const SUBSECTOR_ACTIONS = {
  manage: {
    label: 'Gerenciar Sub-setor',
    classes: 'w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm'
  },
  
  toggleDrafts: {
    show: 'Mostrar Rascunhos',
    hide: 'Ocultar Rascunhos',
    classes: 'flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200'
  }
} as const;

// ===== ERROR HANDLING =====
export const SUBSECTOR_ERRORS = {
  notFound: 'Subsetor não encontrado',
  loadError: 'Erro ao carregar dados',
  accessDenied: 'Você não tem permissão para acessar esta página',
  networkError: 'Erro de conexão. Tente novamente.',
  
  actions: {
    reload: 'Tentar novamente',
    goHome: 'Voltar para Home'
  }
} as const;

// ===== LOADING STATES =====
export const SUBSECTOR_LOADING = {
  default: 'Carregando...',
  subsectors: 'Carregando subsetores...',
  stats: 'Carregando estatísticas...',
  saving: 'Salvando...',
  deleting: 'Excluindo...'
} as const;

// ===== PAGE CONFIGURATION =====
export const SUBSECTOR_PAGE_CONFIG = {
  title: 'Administração de Sub-setores',
  subtitle: 'Gerencie os sub-setores sob sua responsabilidade',
  
  header: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
    title: 'text-3xl font-bold text-primary',
    subtitle: 'text-cresol-gray mt-2'
  }
} as const;

// ===== MODAL CONFIGURATION =====
export const SUBSECTOR_MODALS = {
  news: {
    title: {
      create: 'Nova Notícia',
      edit: 'Editar Notícia'
    }
  },
  
  events: {
    title: {
      create: 'Novo Evento',
      edit: 'Editar Evento'
    }
  },
  
  groups: {
    title: {
      create: 'Novo Grupo',
      edit: 'Editar Grupo'
    }
  },
  
  messages: {
    title: {
      create: 'Nova Mensagem',
      edit: 'Editar Mensagem'
    }
  }
} as const;

// ===== FORM CONFIGURATION =====
export const SUBSECTOR_FORMS = {
  news: {
    fields: {
      title: {
        label: 'Título',
        placeholder: 'Título da notícia',
        required: true,
        maxLength: 255
      },
      summary: {
        label: 'Resumo',
        placeholder: 'Breve resumo da notícia',
        required: true,
        maxLength: 500
      },
      content: {
        label: 'Conteúdo',
        placeholder: 'Conteúdo completo da notícia',
        required: true,
        maxLength: 10000
      },
      isFeatured: {
        label: 'Destacar notícia',
        help: 'Notícias em destaque aparecem no topo'
      },
      isPublished: {
        label: 'Publicar imediatamente',
        help: '(Será salvo como rascunho se não marcado)'
      }
    }
  },
  
  events: {
    fields: {
      title: {
        label: 'Título',
        placeholder: 'Título do evento',
        required: true,
        maxLength: 255
      },
      description: {
        label: 'Descrição',
        placeholder: 'Descrição do evento',
        required: true,
        maxLength: 2000
      },
      startDate: {
        label: 'Data e Hora de Início',
        required: true,
        type: 'datetime-local'
      },
      isFeatured: {
        label: 'Destacar evento',
        help: 'Eventos em destaque aparecem no topo'
      },
      isPublished: {
        label: 'Publicar imediatamente',
        help: '(Será salvo como rascunho se não marcado)'
      }
    }
  }
} as const;

// ===== VALIDATION MESSAGES =====
export const SUBSECTOR_VALIDATION = {
  required: {
    title: 'Título é obrigatório',
    summary: 'Resumo é obrigatório',
    content: 'Conteúdo é obrigatório',
    description: 'Descrição é obrigatória',
    startDate: 'Data de início é obrigatória'
  },
  
  maxLength: {
    title: 'Título não pode exceder 255 caracteres',
    summary: 'Resumo não pode exceder 500 caracteres',
    content: 'Conteúdo não pode exceder 10.000 caracteres',
    description: 'Descrição não pode exceder 2.000 caracteres'
  },
  
  format: {
    email: 'Email deve ter um formato válido',
    url: 'URL deve ter um formato válido',
    date: 'Data deve ter um formato válido'
  }
} as const;

// ===== SUCCESS MESSAGES =====
export const SUBSECTOR_SUCCESS_MESSAGES = {
  news: {
    created: 'Notícia criada com sucesso!',
    updated: 'Notícia atualizada com sucesso!',
    deleted: 'Notícia excluída com sucesso!',
    published: 'Notícia publicada com sucesso!',
    unpublished: 'Notícia despublicada com sucesso!'
  },
  
  events: {
    created: 'Evento criado com sucesso!',
    updated: 'Evento atualizado com sucesso!',
    deleted: 'Evento excluído com sucesso!',
    published: 'Evento publicado com sucesso!',
    unpublished: 'Evento despublicado com sucesso!'
  },
  
  groups: {
    created: 'Grupo criado com sucesso!',
    updated: 'Grupo atualizado com sucesso!',
    deleted: 'Grupo excluído com sucesso!'
  },
  
  messages: {
    sent: 'Mensagem enviada com sucesso!',
    deleted: 'Mensagem excluída com sucesso!'
  }
} as const;

// ===== ADAPTER CONFIGURATION =====
export const SUBSECTOR_ADAPTER_CONFIG = {
  defaultValues: {
    sectorId: '',
    location: '',
    endDate: null,
    imageUrl: null,
    content: '',
    updatedAt: () => new Date().toISOString()
  },
  
  mapping: {
    subsectorToSector: {
      news: {
        id: 'id',
        title: 'title',
        summary: 'summary',
        content: 'content',
        isFeatured: 'is_featured',
        isPublished: 'is_published',
        createdAt: 'created_at'
      },
      events: {
        id: 'id',
        title: 'title',
        description: 'description',
        startDate: 'start_date',
        isFeatured: 'is_featured',
        isPublished: 'is_published'
      }
    }
  }
} as const;

// ===== PERMISSIONS =====
export const SUBSECTOR_PERMISSIONS = {
  view: ['admin', 'sector_admin', 'subsector_admin'],
  edit: ['admin', 'sector_admin'],
  delete: ['admin', 'sector_admin'],
  manage: ['admin', 'sector_admin', 'subsector_admin'],
  
  actions: {
    canView: (role: Role) => SUBSECTOR_PERMISSIONS.view.includes(role as any),
    canEdit: (role: Role) => SUBSECTOR_PERMISSIONS.edit.includes(role as any),
    canDelete: (role: Role) => SUBSECTOR_PERMISSIONS.delete.includes(role as any),
    canManage: (role: Role) => SUBSECTOR_PERMISSIONS.manage.includes(role as any)
  }
} as const;

// ===== API INTEGRATION =====
export const SUBSECTOR_API = {
  endpoints: {
    subsectors: '/api/admin/subsectors',
    subsectorById: (id: string) => `/api/admin/subsectors/${id}`,
    subsectorStats: (id: string) => `/api/admin/subsectors/${id}/stats`,
    subsectorContent: '/api/admin/sector-content'
  },
  
  contentTypes: {
    news: 'subsector_news',
    events: 'subsector_events'
  }
} as const;

// ===== TYPE EXPORTS =====
export type SubsectorRoles = typeof SUBSECTOR_ROLES;
export type SubsectorTabs = typeof SUBSECTOR_TABS;
export type SubsectorStats = typeof SUBSECTOR_STATS;
export type SubsectorBreadcrumbs = typeof SUBSECTOR_BREADCRUMBS;
export type SubsectorCardLayout = typeof SUBSECTOR_CARD_LAYOUT;
export type SubsectorEmptyState = typeof SUBSECTOR_EMPTY_STATE;
export type SubsectorActions = typeof SUBSECTOR_ACTIONS;
export type SubsectorErrors = typeof SUBSECTOR_ERRORS;
export type SubsectorLoading = typeof SUBSECTOR_LOADING;
export type SubsectorPageConfig = typeof SUBSECTOR_PAGE_CONFIG;
export type SubsectorModals = typeof SUBSECTOR_MODALS;
export type SubsectorForms = typeof SUBSECTOR_FORMS;
export type SubsectorValidation = typeof SUBSECTOR_VALIDATION;
export type SubsectorSuccessMessages = typeof SUBSECTOR_SUCCESS_MESSAGES;
export type SubsectorAdapterConfig = typeof SUBSECTOR_ADAPTER_CONFIG;
export type SubsectorPermissions = typeof SUBSECTOR_PERMISSIONS;
export type SubsectorApi = typeof SUBSECTOR_API;

// ===== UTILITY FUNCTIONS =====
export const SUBSECTOR_HELPERS = {
  /**
   * Format subsector display name
   */
  formatSubsectorName: (name: string, sectorName?: string): string => {
    return sectorName ? `${name} (${sectorName})` : name;
  },

  /**
   * Get tab count display
   */
  getTabCountDisplay: (count: number, type: string): string => {
    return `${count} ${count === 1 ? type.slice(0, -1) : type}`;
  },

  /**
   * Check if user has subsector access
   */
  hasSubsectorAccess: (userRole: string, subsectorId?: string): boolean => {
    return SUBSECTOR_PERMISSIONS.actions.canView(userRole as Role);
  },

  /**
   * Get stats color by type
   */
  getStatsColor: (type: keyof typeof SUBSECTOR_STATS.colors): string => {
    return SUBSECTOR_STATS.colors[type] || 'text-gray-600';
  },

  /**
   * Format stats display
   */
  formatStatsDisplay: (published: number, total: number): string => {
    return total > 0 ? `${published}/${total}` : '0';
  }
} as const;