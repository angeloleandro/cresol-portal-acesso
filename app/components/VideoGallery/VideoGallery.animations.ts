import { Variants } from 'framer-motion';




/**
 * Card animation variants with stagger support
 */
export const CardAnimations: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]  // Custom easing curve
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Modal animation variants with backdrop
 */
export const modalAnimations = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, delay: 0.1 }
    }
  } as Variants,
  modal: {
    hidden: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { duration: 0.2 }
    }
  } as Variants
};

/**
 * Container animations for grid layouts
 */
export const containerAnimations: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      when: 'beforeChildren'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren'
    }
  }
};

/**
 * Header animations
 */
export const headerAnimations: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

/**
 * Loading state animations
 */
export const loadingAnimations: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    scale: [0.98, 1, 0.98],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  shimmer: {
    backgroundPosition: ['-200% 0', '200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Thumbnail hover effects
 */
export const thumbnailAnimations: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Play button animations
 */
export const playButtonAnimations: Variants = {
  hidden: { 
    scale: 0, 
    opacity: 0 
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Badge animations
 */
export const badgeAnimations: Variants = {
  hidden: { 
    scale: 0, 
    opacity: 0 
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Error state animations
 */
export const errorAnimations: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
};

/**
 * Success state animations
 */
export const successAnimations: Variants = {
  hidden: { 
    scale: 0, 
    opacity: 0 
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25
    }
  },
  bounce: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }
};

/**
 * Scroll-triggered animations
 */
export const scrollAnimations: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

/**
 * Transition configurations for consistent timing
 */
export const transitions = {
  fast: {
    duration: 0.1,
    ease: 'easeOut'
  },
  normal: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1]
  },
  slow: {
    duration: 0.5,
    ease: 'easeOut'
  },
  bounce: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25
  },
  elastic: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 10
  }
};

/**
 * Custom easing curves
 */
export const easingCurves = {
  // Material Design easing
  standard: [0.4, 0, 0.2, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
  
  // Custom curves
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  snappy: [0.68, -0.55, 0.265, 1.55] as const,
  gentle: [0.25, 0.1, 0.25, 1] as const,
};

/**
 * Page transition variants
 */
export const pageTransitions: Variants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: easingCurves.standard
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: easingCurves.standard
    }
  }
};

/**
 * Utility functions for creating custom animations
 */
export const createSlideAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  };

  return {
    hidden: { 
      opacity: 0, 
      ...directions[direction] 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: transitions.normal
    }
  };
};

export const createStaggerAnimation = (delayStep: number = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delayStep,
      delayChildren: 0.1
    }
  }
});

export const createScaleAnimation = (from: number = 0.9, to: number = 1) => ({
  hidden: { 
    opacity: 0, 
    scale: from 
  },
  visible: { 
    opacity: 1, 
    scale: to,
    transition: transitions.bounce
  }
});

/**
 * Animation presets for common use cases
 */
export const animationPresets = {
  // Card entrance
  cardEntrance: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  },
  
  // Modal entrance
  modalEntrance: {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  },
  
  // Fade in
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: transitions.normal
    }
  },
  
  // Slide up
  slideUp: createSlideAnimation('up'),
  
  // Scale in
  scaleIn: createScaleAnimation(),
  
  // Stagger children
  staggerChildren: createStaggerAnimation()
};

const animations = {
  CardAnimations,
  modalAnimations,
  containerAnimations,
  headerAnimations,
  loadingAnimations,
  thumbnailAnimations,
  playButtonAnimations,
  badgeAnimations,
  errorAnimations,
  successAnimations,
  scrollAnimations,
  transitions,
  easingCurves,
  pageTransitions,
  animationPresets,
  
  // Utility functions
  createSlideAnimation,
  createStaggerAnimation,
  createScaleAnimation
};

export default animations;