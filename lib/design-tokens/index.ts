

// === DESIGN TOKENS PRINCIPAIS ===
export {
  CRESOL_DESIGN_TOKENS,
  CRESOL_COLORS,
  CRESOL_SPACING,
  CRESOL_SIZES,
  CRESOL_RADIUS,
  CRESOL_TYPOGRAPHY,
  CRESOL_SHADOWS,
  CRESOL_ANIMATIONS,
  CRESOL_Z_INDEX,
  CRESOL_BREAKPOINTS,
  CRESOL_UTILITIES,
  getColor,
  getSpacing,
  getRadius,
  type CresolColors,
  type CresolSpacing,
  type CresolSizes,
  type CresolRadius,
  type CresolTypography,
  type CresolShadows,
  type CresolAnimations,
  type CresolZIndex,
  type CresolBreakpoints,
  type CresolUtilities,
  type CresolDesignTokens,
} from './design-tokens';

// === CONFIGURAÇÕES DE UI ===
export {
  CRESOL_UI_CONFIG,
  BUTTON_CONFIG,
  CARD_CONFIG,
  INPUT_CONFIG,
  MODAL_CONFIG,
  SPINNER_CONFIG,
  BADGE_CONFIG,
  TABLE_CONFIG,
  FORM_CONFIG,
  type ButtonConfig,
  type CardConfig,
  type InputConfig,
  type ModalConfig,
  type SpinnerConfig,
  type BadgeConfig,
  type TableConfig,
  type FormConfig,
  type CresolUIConfig,
} from './ui-config';

// === SISTEMA DE SPACING CONSOLIDADO ===
export {
  CRESOL_SPACING_SYSTEM,
  SPACING_CONFIG,
  CARD_SPACING,
  BUTTON_SPACING,
  LAYOUT_SPACING,
  UTILITY_CLASSES,
  MIGRATION_MAP,
  isStandardizedSpacing,
  getSuggestedSpacing,
  type SpacingConfig,
  type CardSpacing,
  type ButtonSpacing,
  type LayoutSpacing,
  type UtilityClasses,
  type MigrationMap,
  type CresolSpacingSystem,
} from './spacing-consolidation';

// === CONFIGURAÇÕES DE ANIMAÇÃO ===
export {
  CRESOL_ANIMATION_CONFIG,
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
  TRANSITION_PRESETS,
  KEYFRAME_ANIMATIONS,
  MICRO_INTERACTIONS,
  LOADING_ANIMATIONS,
  HOVER_EFFECTS,
  FOCUS_STATES,
  ANIMATION_DELAYS,
  createTransition,
  createKeyframe,
  type AnimationDurations,
  type AnimationEasings,
  type TransitionPresets,
  type KeyframeAnimations,
  type MicroInteractions,
  type LoadingAnimations,
  type HoverEffects,
  type FocusStates,
  type AnimationDelays,
  type CresolAnimationConfig,
} from './animation-config';

// === CONSTANTES DE TEXTO ===
export {
  CRESOL_TEXT_CONSTANTS,
  SYSTEM_MESSAGES,
  UI_LABELS,
  VALIDATION_MESSAGES,
  CRESOL_TEXTS,
  ERROR_MESSAGES,
  HELP_TEXTS,
  formatMessage,
  getMessage,
  type SystemMessages,
  type UILabels,
  type ValidationMessages,
  type CresolTexts,
  type ErrorMessages,
  type HelpTexts,
  type CresolTextConstants,
} from './text-constants';

// === COMPATIBILIDADE COM TOKENS EXISTENTES ===
// Re-export dos tokens de vídeo para manter compatibilidade
export {
  videoSystemTokens,
  videoComponentTokens,
  a11yTokens,
  type VideoSystemTokens,
  type VideoComponentTokens,
  type A11yTokens,
} from './video-system';

// === SHORTCUT EXPORTS (para uso mais conveniente) ===
import { 
  CRESOL_COLORS, CRESOL_SPACING, CRESOL_SIZES, CRESOL_RADIUS,
  CRESOL_TYPOGRAPHY, CRESOL_SHADOWS, CRESOL_ANIMATIONS, CRESOL_Z_INDEX,
  CRESOL_BREAKPOINTS, CRESOL_UTILITIES 
} from './design-tokens';
import { CRESOL_UI_CONFIG } from './ui-config';
import { CRESOL_SPACING_SYSTEM } from './spacing-consolidation';
import { CRESOL_ANIMATION_CONFIG } from './animation-config';
import { CRESOL_TEXT_CONSTANTS } from './text-constants';

export const Colors = CRESOL_COLORS;
export const Spacing = CRESOL_SPACING;
export const Sizes = CRESOL_SIZES;
export const Radius = CRESOL_RADIUS;
export const Typography = CRESOL_TYPOGRAPHY;
export const Shadows = CRESOL_SHADOWS;
export const Animations = CRESOL_ANIMATIONS;
export const ZIndex = CRESOL_Z_INDEX;
export const Breakpoints = CRESOL_BREAKPOINTS;
export const Utilities = CRESOL_UTILITIES;

export const UI = CRESOL_UI_CONFIG;
export const SpacingSystem = CRESOL_SPACING_SYSTEM;
export const AnimationConfig = CRESOL_ANIMATION_CONFIG;
export const TextConstants = CRESOL_TEXT_CONSTANTS;