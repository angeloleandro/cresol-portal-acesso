/**
 * ImagePreview Animation Configurations
 * Optimized animations using Framer Motion for smooth 60fps performance
 */

import { Variants, Transition } from 'framer-motion';

// Easing functions optimized for perceived performance
export const easings = {
  // Smooth and responsive for modals
  modal: [0.4, 0, 0.2, 1], // cubic-bezier equivalent to ease-out
  // Snappy for quick interactions
  snappy: [0.68, -0.55, 0.265, 1.55], // back ease for buttons
  // Gentle for image transitions
  gentle: [0.25, 0.46, 0.45, 0.94], // ease-in-out equivalent
  // Spring-like for natural movement
  spring: [0.175, 0.885, 0.32, 1.275]
} as const;

// Base transition configurations
const baseTransition: Transition = {
  type: "tween",
  duration: 0.3,
  ease: easings.modal
};

const fastTransition: Transition = {
  type: "tween", 
  duration: 0.2,
  ease: easings.snappy
};

const gentleTransition: Transition = {
  type: "tween",
  duration: 0.4,
  ease: easings.gentle
};

/**
 * Modal backdrop animations
 */
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easings.modal
    }
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.modal
    }
  }
};

/**
 * Modal container animations with scale and opacity
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
      ease: easings.modal
    }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.modal,
      delay: 0.05 // Small delay after backdrop
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: easings.modal
    }
  }
};

/**
 * Mobile-optimized modal animations
 */
export const mobileModalVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: 0.25,
      ease: easings.modal
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easings.modal,
      delay: 0.05
    }
  },
  exit: {
    opacity: 0,
    y: '50%',
    transition: {
      duration: 0.25,
      ease: easings.modal
    }
  }
};

/**
 * Image transition animations for navigation
 */
export const imageVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 300 : -300,
    scale: 0.95
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.gentle
    }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 300 : -300,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: easings.modal
    }
  })
};

/**
 * Image loading animations
 */
export const imageLoadingVariants: Variants = {
  loading: {
    opacity: 0,
    scale: 0.95,
    transition: baseTransition
  },
  loaded: {
    opacity: 1,
    scale: 1,
    transition: {
      ...gentleTransition,
      delay: 0.1 // Small delay for perceived quality
    }
  },
  error: {
    opacity: 0.6,
    scale: 1,
    transition: fastTransition
  }
};

/**
 * Navigation button animations
 */
export const navButtonVariants: Variants = {
  idle: {
    opacity: 0.7,
    scale: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  hover: {
    opacity: 1,
    scale: 1.05,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    transition: fastTransition
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: easings.snappy
    }
  },
  disabled: {
    opacity: 0.3,
    scale: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    transition: baseTransition
  }
};

/**
 * Info overlay animations
 */
export const infoOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: fastTransition
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...baseTransition,
      delay: 0.2 // Show after image loads
    }
  }
};

/**
 * Grid image card hover animations
 */
export const cardHoverVariants: Variants = {
  idle: {
    scale: 1,
    transition: baseTransition
  },
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.2,
      ease: easings.snappy
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: easings.modal
    }
  }
};

/**
 * Image card overlay animations
 */
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: fastTransition
  },
  visible: {
    opacity: 1,
    transition: fastTransition
  }
};

/**
 * Loading skeleton animations
 */
export const skeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/**
 * Zoom animation for image modal
 */
export const zoomVariants: Variants = {
  initial: {
    scale: 1,
    transition: baseTransition
  },
  zoomed: {
    scale: 1.5,
    transition: {
      duration: 0.3,
      ease: easings.gentle
    }
  }
};

/**
 * Slide animation for image gallery navigation
 */
export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

/**
 * Stagger animation for grid loading
 */
export const gridContainerVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const gridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.modal
    }
  }
};

/**
 * Focus ring animation for accessibility
 */
export const focusRingVariants: Variants = {
  focused: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: easings.modal
    }
  },
  unfocused: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: easings.modal
    }
  }
};

/**
 * Utility function to get responsive animation config
 */
export function getResponsiveModalVariants(isMobile: boolean): Variants {
  return isMobile ? mobileModalVariants : modalVariants;
}

/**
 * Animation presets for common use cases
 */
export const presets = {
  // Quick modal for simple previews
  quick: {
    backdrop: {
      ...backdropVariants,
      visible: {
        ...backdropVariants.visible,
        transition: { duration: 0.2 }
      }
    },
    modal: {
      ...modalVariants,
      visible: {
        ...modalVariants.visible,
        transition: { duration: 0.25 }
      }
    }
  },
  // Smooth modal for premium experience
  smooth: {
    backdrop: backdropVariants,
    modal: modalVariants,
    image: imageVariants
  },
  // Performance mode for lower-end devices
  performance: {
    backdrop: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } }
    },
    modal: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.15 } }
    }
  }
} as const;