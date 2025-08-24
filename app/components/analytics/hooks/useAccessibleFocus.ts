'use client';

import { useCallback, useEffect, useRef, RefObject } from 'react';

interface UseAccessibleFocusOptions {
  /** Enable roving tabindex pattern */
  rovingTabindex?: boolean;
  /** Enable arrow key navigation */
  arrowKeyNavigation?: boolean;
  /** Enable home/end key navigation */
  homeEndNavigation?: boolean;
  /** Enable escape key handling */
  escapeKeyHandling?: boolean;
  /** Callback for escape key */
  onEscape?: () => void;
  /** Enable focus trap */
  focusTrap?: boolean;
  /** Restore focus on cleanup */
  restoreFocus?: boolean;
  /** Custom key handlers */
  customKeyHandlers?: Record<string, () => void>;
}

interface UseAccessibleFocusReturn {
  /** Container ref to attach to the parent element */
  containerRef: RefObject<HTMLElement>;
  /** Focus first focusable element */
  focusFirst: () => void;
  /** Focus last focusable element */
  focusLast: () => void;
  /** Focus next focusable element */
  focusNext: () => void;
  /** Focus previous focusable element */
  focusPrevious: () => void;
  /** Get all focusable elements */
  getFocusableElements: () => HTMLElement[];
  /** Focus specific element by index */
  focusIndex: (index: number) => void;
  /** Get current focused element index */
  getCurrentIndex: () => number;
}

/**
 * useAccessibleFocus function
 * @todo Add proper documentation
 */
export function useAccessibleFocus(options: UseAccessibleFocusOptions = {}): UseAccessibleFocusReturn {
  const {
    rovingTabindex = false,
    arrowKeyNavigation = false,
    homeEndNavigation = false,
    escapeKeyHandling = false,
    onEscape,
    focusTrap = false,
    restoreFocus = false,
    customKeyHandlers = {}
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const isInitialized = useRef(false);

  // Focusable element selector
  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  // Get all focusable elements within container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as HTMLElement[];

    return focusableElements.filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('disabled') &&
        element.tabIndex !== -1
      );
    });
  }, [FOCUSABLE_SELECTOR]);  // Get current focused element index
  const getCurrentIndex = useCallback((): number => {
    const focusableElements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;
    
    return focusableElements.indexOf(activeElement);
  }, [getFocusableElements]);

  // Focus element by index
  const focusIndex = useCallback((index: number): void => {
    const focusableElements = getFocusableElements();
    
    if (index >= 0 && index < focusableElements.length) {
      focusableElements[index].focus();
      
      // Update roving tabindex
      if (rovingTabindex) {
        focusableElements.forEach((element, i) => {
          element.tabIndex = i === index ? 0 : -1;
        });
      }
    }
  }, [getFocusableElements, rovingTabindex]);

  // Focus first focusable element
  const focusFirst = useCallback((): void => {
    focusIndex(0);
  }, [focusIndex]);

  // Focus last focusable element
  const focusLast = useCallback((): void => {
    const focusableElements = getFocusableElements();
    focusIndex(focusableElements.length - 1);
  }, [getFocusableElements, focusIndex]);

  // Focus next focusable element
  const focusNext = useCallback((): void => {
    const focusableElements = getFocusableElements();
    const currentIndex = getCurrentIndex();
    const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
    focusIndex(nextIndex);
  }, [getFocusableElements, getCurrentIndex, focusIndex]);

  // Focus previous focusable element
  const focusPrevious = useCallback((): void => {
    const focusableElements = getFocusableElements();
    const currentIndex = getCurrentIndex();
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
    focusIndex(previousIndex);
  }, [getFocusableElements, getCurrentIndex, focusIndex]);

  // Initialize roving tabindex
  const initializeRovingTabindex = useCallback(() => {
    if (!rovingTabindex) return;
    
    const focusableElements = getFocusableElements();
    focusableElements.forEach((element, index) => {
      element.tabIndex = index === 0 ? 0 : -1;
    });
  }, [rovingTabindex, getFocusableElements]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, shiftKey } = event;

    // Custom key handlers
    if (customKeyHandlers[key]) {
      event.preventDefault();
      customKeyHandlers[key]();
      return;
    }

    // Escape key handling
    if (escapeKeyHandling && key === 'Escape') {
      event.preventDefault();
      onEscape?.();
      return;
    }

    // Arrow key navigation
    if (arrowKeyNavigation) {
      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusNext();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusPrevious();
          break;
      }
    }

    // Home/End key navigation
    if (homeEndNavigation) {
      switch (key) {
        case 'Home':
          event.preventDefault();
          focusFirst();
          break;
        case 'End':
          event.preventDefault();
          focusLast();
          break;
      }
    }

    // Focus trap handling
    if (focusTrap && key === 'Tab') {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (shiftKey) {
        // Shift + Tab (backward)
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [
    customKeyHandlers,
    escapeKeyHandling,
    onEscape,
    arrowKeyNavigation,
    homeEndNavigation,
    focusTrap,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    getFocusableElements
  ]);

  // Handle focus events for roving tabindex
  const handleFocus = useCallback((event: FocusEvent) => {
    if (!rovingTabindex) return;
    
    const target = event.target as HTMLElement;
    if (!containerRef.current?.contains(target)) return;

    const focusableElements = getFocusableElements();
    const index = focusableElements.indexOf(target);
    
    if (index >= 0) {
      focusableElements.forEach((element, i) => {
        element.tabIndex = i === index ? 0 : -1;
      });
    }
  }, [rovingTabindex, getFocusableElements]);

  // Initialize focus management
  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;

    // Store previously focused element for restoration
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }

    // Initialize roving tabindex
    initializeRovingTabindex();

    // Add event listeners
    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);
    
    if (rovingTabindex) {
      container.addEventListener('focus', handleFocus, true);
    }

    isInitialized.current = true;

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      if (rovingTabindex) {
        container.removeEventListener('focus', handleFocus, true);
      }

      // Restore previous focus
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }

      isInitialized.current = false;
    };
  }, [
    initializeRovingTabindex,
    handleKeyDown,
    handleFocus,
    rovingTabindex,
    restoreFocus
  ]);

  // Update roving tabindex when focusable elements change
  useEffect(() => {
    if (rovingTabindex && isInitialized.current) {
      const timer = setTimeout(() => {
        initializeRovingTabindex();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [rovingTabindex, initializeRovingTabindex]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements,
    focusIndex,
    getCurrentIndex
  };
}

// Additional hook for announcing changes to screen readers
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) return;

    // Clear previous content
    announcementRef.current.textContent = '';
    announcementRef.current.setAttribute('aria-live', priority);

    // Add new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);

    // Clear the message after it's been announced
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 3000);
  }, []);

  return { announce, announcementRef };
}

// Hook for managing reduced motion preferences
export function useReducedMotion(): boolean {
  const prefersReducedMotion = useRef<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.current = event.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion.current;
}