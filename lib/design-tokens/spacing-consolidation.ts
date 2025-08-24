

// === CONSOLIDAÇÃO DE SPACING MAIS GRANULAR ===
export const SPACING_CONFIG = {
  // === PADDING CONSOLIDADO ===
  padding: {
    // Elementos pequenos
    xs: 'p-1',        // 4px - chips, badges pequenos
    sm: 'p-2',        // 8px - elementos compactos
    md: 'p-3',        // 12px - padrão para componentes pequenos
    lg: 'p-4',        // 16px - padrão principal
    xl: 'p-6',        // 24px - cards, containers
    '2xl': 'p-8',     // 32px - formulários, seções
    '3xl': 'p-12',    // 48px - empty states, hero sections
  },
  
  // === GAP CONSOLIDADO ===
  gap: {
    xs: 'gap-1',      // 4px - elementos muito próximos
    sm: 'gap-2',      // 8px - elementos relacionados
    md: 'gap-3',      // 12px - padrão para flex/grid
    lg: 'gap-4',      // 16px - seções relacionadas
    xl: 'gap-6',      // 24px - grupos de componentes
    '2xl': 'gap-8',   // 32px - seções distintas
  },
  
  // === MARGIN CONSOLIDADO ===
  margin: {
    xs: 'mb-1',       // 4px - elementos próximos
    sm: 'mb-2',       // 8px - texto relacionado
    md: 'mb-3',       // 12px - parágrafos, labels
    lg: 'mb-4',       // 16px - seções pequenas
    xl: 'mb-6',       // 24px - seções médias
    '2xl': 'mb-8',    // 32px - seções grandes
    '3xl': 'mb-12',   // 48px - divisões principais
  },
  
  // === SPACE-Y CONSOLIDADO ===
  space: {
    xs: 'space-y-1',  // 4px
    sm: 'space-y-2',  // 8px
    md: 'space-y-3',  // 12px
    lg: 'space-y-4',  // 16px - mais comum
    xl: 'space-y-6',  // 24px
    '2xl': 'space-y-8', // 32px
  },
  
  // === SPACE-X CONSOLIDADO ===
  spaceX: {
    xs: 'space-x-1',  // 4px
    sm: 'space-x-2',  // 8px
    md: 'space-x-3',  // 12px
    lg: 'space-x-4',  // 16px
    xl: 'space-x-6',  // 24px
    '2xl': 'space-x-8', // 32px
  },
} as const;

// === COMPONENTES ESPECÍFICOS MAPEADOS ===

// Cards com padding específico (baseado na auditoria)
export const CARD_SPACING = {
  // EmptyState: p-12 → padding.hero
  hero: SPACING_CONFIG.padding['3xl'],
  
  // FormCard: p-8 → padding.form
  form: SPACING_CONFIG.padding['2xl'],
  
  // StandardizedCard: p-4, p-6 → padding.standard, padding.comfortable
  standard: SPACING_CONFIG.padding.lg,
  comfortable: SPACING_CONFIG.padding.xl,
  
  // Small cards: p-3 → padding.compact
  compact: SPACING_CONFIG.padding.md,
} as const;

// Buttons com spacing específico (baseado na auditoria)
export const BUTTON_SPACING = {
  // MinimalistButton inconsistencies fixed
  sizes: {
    xs: 'px-2 py-1',      // Muito pequeno
    sm: 'px-3 py-1.5',    // Pequeno padrão
    md: 'px-4 py-2',      // Médio padrão (PADRONIZADO)
    lg: 'px-6 py-3',      // Grande
    xl: 'px-8 py-4',      // Extra grande
  },
  
  // Gaps entre ícone e texto
  gaps: {
    xs: 'gap-1',          // 4px
    sm: 'gap-1.5',        // 6px
    md: 'gap-2',          // 8px (PADRÃO)
    lg: 'gap-2.5',        // 10px
    xl: 'gap-3',          // 12px
  },
} as const;

// Layout spacing (baseado em pages admin)
export const LAYOUT_SPACING = {
  // Page containers: px-4 sm:px-6 lg:px-8 py-8
  page: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
    content: 'mb-6',
    section: 'mb-8',
    subsection: 'mb-4',
  },
  
  // Table spacing: px-6 py-3, px-6 py-4
  table: {
    headerCell: 'px-6 py-3',
    bodyCell: 'px-6 py-4',
    emptyState: 'px-6 py-12',
  },
  
  // Modal spacing: px-6 py-4
  modal: {
    header: 'px-6 py-4',
    body: 'px-6 py-4', 
    footer: 'px-6 py-4',
  },
} as const;

// === CLASSES UTILITÁRIAS PRONTAS ===
// Para uso direto nos componentes sem concatenação
export const UTILITY_CLASSES = {
  // Flex com gaps comuns
  flexGap2: 'flex items-center gap-2',
  flexGap3: 'flex items-center gap-3',
  flexGap4: 'flex items-center gap-4',
  
  // Grid com gaps comuns
  grid2Gap4: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  grid3Gap4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  grid4Gap6: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Espaçamento vertical comum
  spaceY4: 'space-y-4',
  spaceY6: 'space-y-6',
  spaceY8: 'space-y-8',
  
  // Margens bottom comuns
  mb4: 'mb-4',
  mb6: 'mb-6', 
  mb8: 'mb-8',
  
  // Padding para diferentes contextos
  cardPadding: 'p-6',         // Padrão para cards
  formPadding: 'p-8',         // Padrão para forms
  sectionPadding: 'p-4',      // Padrão para sections
  heroePadding: 'p-12',       // Para empty states
} as const;

// === MAPA DE MIGRAÇÃO ===
// Guia para desenvolvedores migrarem código existente
export const MIGRATION_MAP = {
  // ANTES → DEPOIS
  'p-3': CARD_SPACING.compact,
  'p-4': CARD_SPACING.standard, 
  'p-6': CARD_SPACING.comfortable,
  'p-8': CARD_SPACING.form,
  'p-12': CARD_SPACING.hero,
  
  'gap-2': SPACING_CONFIG.gap.sm,
  'gap-3': SPACING_CONFIG.gap.md,
  'gap-4': SPACING_CONFIG.gap.lg,
  'gap-6': SPACING_CONFIG.gap.xl,
  
  'mb-3': SPACING_CONFIG.margin.md,
  'mb-4': SPACING_CONFIG.margin.lg,
  'mb-6': SPACING_CONFIG.margin.xl,
  'mb-8': SPACING_CONFIG.margin['2xl'],
  
  'space-y-3': SPACING_CONFIG.space.md,
  'space-y-4': SPACING_CONFIG.space.lg,
  'space-y-6': SPACING_CONFIG.space.xl,
  'space-y-8': SPACING_CONFIG.space['2xl'],
  
  // Buttons - padronização
  'px-3 py-2': BUTTON_SPACING.sizes.sm,
  'px-4 py-2.5': BUTTON_SPACING.sizes.md,
  'px-6 py-3': BUTTON_SPACING.sizes.lg,
  
  'gap-1.5': BUTTON_SPACING.gaps.sm,
  // 'gap-2': BUTTON_SPACING.gaps.md, // Duplicated - using SPACING_CONFIG.gap.sm above
  'gap-2.5': BUTTON_SPACING.gaps.lg,
} as const;

// === VALIDAÇÃO DE CONSISTÊNCIA ===
// Função para verificar se um valor de spacing está padronizado
export const isStandardizedSpacing = (className: string): boolean => {
  return Object.values(MIGRATION_MAP).includes(className as any);
};

// Função para sugerir alternativa padronizada
export const getSuggestedSpacing = (className: string): string | null => {
  return MIGRATION_MAP[className as keyof typeof MIGRATION_MAP] || null;
};

// === EXPORT CONSOLIDADO ===
export const CRESOL_SPACING_SYSTEM = {
  config: SPACING_CONFIG,
  card: CARD_SPACING,
  button: BUTTON_SPACING,
  layout: LAYOUT_SPACING,
  utilities: UTILITY_CLASSES,
  migration: MIGRATION_MAP,
  
  // Funções utilitárias
  isStandardized: isStandardizedSpacing,
  getSuggested: getSuggestedSpacing,
} as const;

// === TYPES ===
export type SpacingConfig = typeof SPACING_CONFIG;
export type CardSpacing = typeof CARD_SPACING;
export type ButtonSpacing = typeof BUTTON_SPACING;
export type LayoutSpacing = typeof LAYOUT_SPACING;
export type UtilityClasses = typeof UTILITY_CLASSES;
export type MigrationMap = typeof MIGRATION_MAP;
export type CresolSpacingSystem = typeof CRESOL_SPACING_SYSTEM;