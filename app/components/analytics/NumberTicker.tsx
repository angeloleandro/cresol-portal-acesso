'use client';

import { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react';

interface NumberTickerProps {
  value: number;
  /** Starting value for animation (default: 0) */
  from?: number;
  /** Animation duration in milliseconds (default: 1000) */
  duration?: number;
  /** Animation easing function (default: 'ease-out-cubic') */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'ease-out-cubic';
  /** Prefix text/symbol */
  prefix?: string;
  /** Suffix text/symbol */
  suffix?: string;
  /** Number formatting locale (default: 'pt-BR') */
  locale?: string;
  /** Number formatting options */
  formatOptions?: Intl.NumberFormatOptions;
  /** Component size following Chakra UI size scale */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color palette based on Cresol brand */
  colorPalette?: 'orange' | 'green' | 'gray' | 'blue' | 'red' | 'purple' | 'amber';
  /** Additional className for customization */
  className?: string;
  /** Font weight */
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Disable animation */
  disableAnimation?: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

// Chakra UI inspired size configurations
const sizeConfig = {
  xs: {
    fontSize: 'text-sm',
    letterSpacing: 'tracking-tight',
    lineHeight: 'leading-none'
  },
  sm: {
    fontSize: 'text-base',
    letterSpacing: 'tracking-tight', 
    lineHeight: 'leading-none'
  },
  md: {
    fontSize: 'text-xl',
    letterSpacing: 'tracking-tight',
    lineHeight: 'leading-none'
  },
  lg: {
    fontSize: 'text-3xl',
    letterSpacing: 'tracking-tight',
    lineHeight: 'leading-none'
  },
  xl: {
    fontSize: 'text-5xl',
    letterSpacing: 'tracking-tighter',
    lineHeight: 'leading-none'
  }
};

// Cresol brand color palette
const colorConfig = {
  orange: 'text-orange-600',
  green: 'text-green-600', 
  gray: 'text-gray-700',
  blue: 'text-blue-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  amber: 'text-amber-600'
};

// Font weight configuration
const fontWeightConfig = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

// Easing functions for smooth animations (60fps target)
const easingFunctions = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
  'ease-in-out': (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  'ease-out-cubic': (t: number) => 1 - Math.pow(1 - t, 3)
};

const NumberTicker = memo(function NumberTicker({
  value,
  from = 0,
  duration = 1000,
  easing = 'ease-out-cubic',
  prefix = '',
  suffix = '',
  locale = 'pt-BR',
  formatOptions = {},
  size = 'md',
  colorPalette = 'orange',
  className = '',
  fontWeight = 'bold',
  disableAnimation = false,
  onAnimationComplete
}: NumberTickerProps) {
  const [currentValue, setCurrentValue] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Memoized animation cleanup
  const cleanupAnimation = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
  }, []);

  // Memoized number formatter para evitar recriação
  const numberFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...formatOptions
      });
    } catch {
      // Fallback formatter para locale inválido
      return new Intl.NumberFormat('pt-BR');
    }
  }, [locale, formatOptions]);

  // Memoized format function
  const formatNumber = useCallback((num: number): string => {
    try {
      return numberFormatter.format(num);
    } catch {
      // Fallback direto para número
      return num.toLocaleString();
    }
  }, [numberFormatter]);

  // Optimized animation logic with 60fps performance target
  useEffect(() => {
    // Skip animation if disabled or values are equal
    if (disableAnimation || value === currentValue) {
      setCurrentValue(value);
      return;
    }

    setIsAnimating(true);
    startTimeRef.current = undefined;

    const easingFunction = easingFunctions[easing];

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing function (cached)
      const easedProgress = easingFunction(progress);
      
      // Calculate current value with better precision
      const newValue = from + (value - from) * easedProgress;
      setCurrentValue(newValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentValue(value);
        onAnimationComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return cleanupAnimation;
  }, [value, from, duration, easing, disableAnimation, onAnimationComplete, cleanupAnimation, currentValue]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return cleanupAnimation;
  }, [cleanupAnimation]);

  // Memoized styles para evitar recálculos
  const sizeStyles = useMemo(() => sizeConfig[size], [size]);
  const colorStyles = useMemo(() => colorConfig[colorPalette], [colorPalette]);
  const weightStyles = useMemo(() => fontWeightConfig[fontWeight], [fontWeight]);

  // Memoized accessibility label
  const accessibilityLabel = useMemo(() => 
    `${prefix}${formatNumber(value)}${suffix}`, 
    [prefix, value, suffix, formatNumber]
  );

  return (
    <span
      className={`
        ${sizeStyles.fontSize}
        ${sizeStyles.letterSpacing}
        ${sizeStyles.lineHeight}
        ${colorStyles}
        ${weightStyles}
        tabular-nums
        inline-block
        transition-all
        duration-200
        ease-out
        ${isAnimating ? 'animate-pulse' : ''}
        ${className}
      `}
      aria-label={accessibilityLabel}
      role="status"
      aria-live="polite"
    >
      {prefix}
      {formatNumber(currentValue)}
      {suffix}
    </span>
  );
});

NumberTicker.displayName = 'NumberTicker';

export { NumberTicker };
export default NumberTicker;