/**
 * CRESOL PORTAL - CONFIGURAÇÕES DE ANIMAÇÃO
 * 
 * Centralização de todas as animações, transições e micro-interações
 * Elimina hardcode de "transition-all duration-200", "animate-spin", etc.
 * Baseado na análise de 15+ ocorrências de transições hardcoded
 */

import { CRESOL_DESIGN_TOKENS } from './design-tokens';

// === DURAÇÕES PADRONIZADAS ===
// Consolidação de durações encontradas hardcoded (200ms, 150ms, 300ms, etc.)
export const ANIMATION_DURATIONS = {
  instant: '0ms',
  fast: '150ms',        // Micro-interações (hover, focus)
  normal: '200ms',      // Padrão para a maioria das transições
  slow: '300ms',        // Modais, slides
  slower: '500ms',      // Animações complexas
  slowest: '700ms',     // Animações especiais
} as const;

// === EASINGS PADRONIZADOS ===
// Baseado no tailwind.config.js existing
export const ANIMATION_EASINGS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',    // Do tailwind.config
  snappy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Do tailwind.config bounce
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Alias para snappy
} as const;

// === TRANSIÇÕES PRÉ-DEFINIDAS ===
// Eliminando hardcode de "transition-all duration-200", etc.
export const TRANSITION_PRESETS = {
  // Transições mais comuns encontradas hardcoded
  none: 'transition-none',
  
  // All property transitions (mais usado)
  allFast: 'transition-all duration-150 ease-out',      // Hover states
  allNormal: 'transition-all duration-200 ease-out',    // Padrão geral
  allSlow: 'transition-all duration-300 ease-out',      // Smooth interactions
  allSmooth: 'transition-all duration-200 ease-smooth', // Using custom easing
  allSnappy: 'transition-all duration-300 ease-snappy', // Bouncy feel
  
  // Specific property transitions
  colors: 'transition-colors duration-200 ease-out',
  opacity: 'transition-opacity duration-200 ease-out',
  transform: 'transition-transform duration-200 ease-out',
  shadow: 'transition-shadow duration-200 ease-out',
  
  // UI-specific transitions
  button: 'transition-all duration-150 ease-out',       // Button interactions
  card: 'transition-colors duration-150 ease-out',       // Card hover effects
  modal: 'transition-all duration-250 ease-out',        // Modal enter/exit
  dropdown: 'transition-all duration-200 ease-out',     // Dropdown animations
  tooltip: 'transition-all duration-150 ease-out',      // Quick tooltips
  
  // Focus transitions (accessibility)
  focus: 'transition-all duration-150 ease-out',
  focusRing: 'focus:transition-all focus:duration-150 focus:ease-out',
} as const;

// === KEYFRAMES PERSONALIZADOS ===
// Baseado nas animações do tailwind.config.js + novas necessidades
export const KEYFRAME_ANIMATIONS = {
  // Do tailwind.config.js existente
  shimmer: {
    name: 'animate-shimmer',
    keyframes: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
    duration: '2s',
    timing: 'linear',
    iteration: 'infinite',
  },
  
  pulseCustom: {
    name: 'animate-pulse-slow',
    duration: '3s',
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
  
  fadeIn: {
    name: 'animate-fade-in',
    keyframes: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    duration: '0.5s',
    timing: 'ease-out',
  },
  
  slideUp: {
    name: 'animate-slide-up',
    keyframes: {
      '0%': { 
        opacity: '0', 
        transform: 'translateY(20px)' 
      },
      '100%': { 
        opacity: '1', 
        transform: 'translateY(0)' 
      },
    },
    duration: '0.4s',
    timing: 'ease-out',
  },
  
  scaleIn: {
    name: 'animate-scale-in',
    keyframes: {
      '0%': { 
        opacity: '0', 
        transform: 'scale(0.9)' 
      },
      '100%': { 
        opacity: '1', 
        transform: 'scale(1)' 
      },
    },
    duration: '0.3s',
    timing: 'ease-out',
  },
  
  // Animações built-in úteis
  spin: {
    name: 'animate-spin',
    duration: '1s',
    timing: 'linear',
    iteration: 'infinite',
  },
  
  pulse: {
    name: 'animate-pulse',
    duration: '2s',
    timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iteration: 'infinite',
  },
  
  bounce: {
    name: 'animate-bounce',
    duration: '1s',
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
} as const;

// === MICRO-INTERAÇÕES ===
// Animações específicas para elementos de UI
export const MICRO_INTERACTIONS = {
  // Button states
  buttonHover: {
    transition: TRANSITION_PRESETS.button,
    properties: ['background-color', 'border-color', 'color', 'box-shadow'],
    duration: ANIMATION_DURATIONS.fast,
  },
  
  buttonPress: {
    transform: 'scale(0.98)',
    transition: 'transform 100ms ease-out',
  },
  
  // Card interactions
  cardHover: {
    transition: TRANSITION_PRESETS.card,
    borderColor: 'rgba(210, 210, 206, 1)',
    duration: ANIMATION_DURATIONS.fast,
  },
  
  cardPress: {
    transform: 'scale(0.98)',
    transition: 'transform 150ms ease-out',
  },
  
  // Input focus states
  inputFocus: {
    transition: TRANSITION_PRESETS.allFast,
    borderColor: CRESOL_DESIGN_TOKENS.colors.primary.DEFAULT,
    ringColor: `${CRESOL_DESIGN_TOKENS.colors.primary.DEFAULT}33`, // 20% opacity
    ringWidth: '2px',
    ringOffset: '1px',
  },
  
  // Loading states
  loadingPulse: {
    animation: KEYFRAME_ANIMATIONS.pulse.name,
    backgroundColor: CRESOL_DESIGN_TOKENS.colors.gray[200],
  },
  
  loadingShimmer: {
    animation: KEYFRAME_ANIMATIONS.shimmer.name,
    background: `linear-gradient(90deg, 
      ${CRESOL_DESIGN_TOKENS.colors.gray[200]} 25%, 
      ${CRESOL_DESIGN_TOKENS.colors.gray[100]} 50%, 
      ${CRESOL_DESIGN_TOKENS.colors.gray[200]} 75%)`,
    backgroundSize: '200% 100%',
  },
  
  // Modal animations
  modalEnter: {
    animation: KEYFRAME_ANIMATIONS.scaleIn.name,
    backdropFilter: 'blur(4px)',
    transition: TRANSITION_PRESETS.modal,
  },
  
  modalExit: {
    animation: KEYFRAME_ANIMATIONS.fadeIn.name + ' reverse',
    transition: TRANSITION_PRESETS.modal,
  },
  
  // Dropdown animations
  dropdownEnter: {
    animation: KEYFRAME_ANIMATIONS.slideUp.name,
    transformOrigin: 'top',
    transition: TRANSITION_PRESETS.dropdown,
  },
  
  // Toast/notification animations
  toastSlideIn: {
    transform: 'translateX(100%)',
    animation: 'slide-in-right 0.3s ease-out forwards',
  },
  
  toastFadeOut: {
    animation: KEYFRAME_ANIMATIONS.fadeIn.name + ' reverse',
    duration: ANIMATION_DURATIONS.normal,
  },
} as const;

// === LOADING STATES ===
// Configurações para diferentes tipos de loading
export const LOADING_ANIMATIONS = {
  // Spinner configurations
  spinner: {
    small: {
      size: CRESOL_DESIGN_TOKENS.sizes.icon.sm,
      animation: KEYFRAME_ANIMATIONS.spin.name,
    },
    medium: {
      size: CRESOL_DESIGN_TOKENS.sizes.icon.md,
      animation: KEYFRAME_ANIMATIONS.spin.name,
    },
    large: {
      size: CRESOL_DESIGN_TOKENS.sizes.icon.lg,
      animation: KEYFRAME_ANIMATIONS.spin.name,
    },
  },
  
  // Skeleton loading
  skeleton: {
    base: 'animate-pulse bg-gray-200 rounded',
    text: 'animate-pulse bg-gray-200 rounded h-4',
    avatar: 'animate-pulse bg-gray-200 rounded-full',
    button: 'animate-pulse bg-gray-200 rounded-md',
    card: 'animate-pulse bg-gray-200 rounded-lg',
  },
  
  // Progress indicators
  progress: {
    bar: {
      container: 'w-full bg-gray-200 rounded-full h-2',
      fill: `bg-primary rounded-full h-2 ${TRANSITION_PRESETS.allNormal}`,
      animated: 'bg-gradient-to-r from-primary to-primary-dark animate-pulse',
    },
    circle: {
      track: `stroke-gray-200`,
      fill: `stroke-primary ${TRANSITION_PRESETS.allNormal}`,
      animation: 'rotate 1.5s linear infinite',
    },
  },
  
  // Button loading states
  buttonLoading: {
    disabled: 'opacity-75 cursor-not-allowed',
    spinner: CRESOL_DESIGN_TOKENS.sizes.spinner.sm,
    text: 'opacity-75',
  },
} as const;

// === HOVER EFFECTS ===
// Efeitos de hover padronizados
export const HOVER_EFFECTS = {
  // Lift effects
  lift: {
    light: `hover:border-gray-200 hover:-translate-y-0.5 ${TRANSITION_PRESETS.allNormal}`,
    medium: `hover:border-gray-200 hover:-translate-y-1 ${TRANSITION_PRESETS.allNormal}`,
    strong: `hover:border-gray-200 hover:-translate-y-2 ${TRANSITION_PRESETS.allNormal}`,
  },
  
  // Scale effects
  scale: {
    subtle: `hover:scale-105 ${TRANSITION_PRESETS.transform}`,
    medium: `hover:scale-110 ${TRANSITION_PRESETS.transform}`,
    large: `hover:scale-125 ${TRANSITION_PRESETS.transform}`,
  },
  
  // Border emphasis effects (replacing glow)
  borderEmphasis: {
    primary: `hover:border-primary ${TRANSITION_PRESETS.colors}`,
    success: `hover:border-green-500 ${TRANSITION_PRESETS.colors}`,
    warning: `hover:border-yellow-500 ${TRANSITION_PRESETS.colors}`,
    error: `hover:border-red-500 ${TRANSITION_PRESETS.colors}`,
  },
  
  // Color shifts
  brighten: `hover:brightness-110 ${TRANSITION_PRESETS.allFast}`,
  darken: `hover:brightness-90 ${TRANSITION_PRESETS.allFast}`,
  saturate: `hover:saturate-150 ${TRANSITION_PRESETS.allFast}`,
} as const;

// === FOCUS STATES ===
// Estados de foco para acessibilidade
export const FOCUS_STATES = {
  // Ring focus (padrão)
  ring: {
    primary: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    secondary: 'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    success: 'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    warning: 'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
    error: 'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  },
  
  // Within focus (para containers)
  within: {
    primary: 'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
    secondary: 'focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2',
  },
  
  // Visible focus (para elementos que já têm outline)
  visible: {
    primary: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    secondary: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500',
  },
  
  // Smooth focus transition
  transition: TRANSITION_PRESETS.focus,
} as const;

// === DELAYS COMUNS ===
// Delays para sequenciamento de animações
export const ANIMATION_DELAYS = {
  none: '0ms',
  short: '100ms',
  medium: '200ms',
  long: '300ms',
  extraLong: '500ms',
  
  // Staggered animations
  stagger: {
    '1': '50ms',
    '2': '100ms', 
    '3': '150ms',
    '4': '200ms',
    '5': '250ms',
  },
} as const;

// === EXPORT PRINCIPAL ===
export const CRESOL_ANIMATION_CONFIG = {
  durations: ANIMATION_DURATIONS,
  easings: ANIMATION_EASINGS,
  transitions: TRANSITION_PRESETS,
  keyframes: KEYFRAME_ANIMATIONS,
  microInteractions: MICRO_INTERACTIONS,
  loading: LOADING_ANIMATIONS,
  hover: HOVER_EFFECTS,
  focus: FOCUS_STATES,
  delays: ANIMATION_DELAYS,
} as const;

// === UTILITY FUNCTIONS ===
export const createTransition = (
  properties: string[],
  duration: keyof typeof ANIMATION_DURATIONS = 'normal',
  easing: keyof typeof ANIMATION_EASINGS = 'easeOut'
) => {
  const props = properties.join(', ');
  return `transition-[${props}] duration-[${ANIMATION_DURATIONS[duration]}] ease-[${ANIMATION_EASINGS[easing]}]`;
};

export const createKeyframe = (
  name: string,
  keyframes: Record<string, Record<string, string>>,
  duration: string = '1s',
  timing: string = 'ease-out',
  iteration: string = '1'
) => {
  return {
    name: `animate-${name}`,
    keyframes,
    duration,
    timing,
    iteration,
  };
};

// === TIPOS TYPESCRIPT ===
export type AnimationDurations = typeof ANIMATION_DURATIONS;
export type AnimationEasings = typeof ANIMATION_EASINGS;
export type TransitionPresets = typeof TRANSITION_PRESETS;
export type KeyframeAnimations = typeof KEYFRAME_ANIMATIONS;
export type MicroInteractions = typeof MICRO_INTERACTIONS;
export type LoadingAnimations = typeof LOADING_ANIMATIONS;
export type HoverEffects = typeof HOVER_EFFECTS;
export type FocusStates = typeof FOCUS_STATES;
export type AnimationDelays = typeof ANIMATION_DELAYS;
export type CresolAnimationConfig = typeof CRESOL_ANIMATION_CONFIG;