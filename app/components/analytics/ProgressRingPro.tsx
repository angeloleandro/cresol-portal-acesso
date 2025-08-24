'use client';

import { useEffect, useState, useRef } from 'react';

interface ProgressRingProProps {
  /** Progress value (0-100) */
  value: number;
  /** Starting value for animation (default: 0) */
  from?: number;
  /** Ring size following Chakra UI size scale */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom size in pixels */
  customSize?: number;
  /** Ring thickness */
  thickness?: 'thin' | 'medium' | 'thick';
  /** Custom thickness in pixels */
  customThickness?: number;
  /** Color palette based on Cresol brand */
  colorPalette?: 'orange' | 'green' | 'blue' | 'gray' | 'red' | 'purple';
  /** Custom gradient colors */
  gradientColors?: [string, string];
  /** Track (background) color */
  trackColor?: string;
  /** Show percentage text in center */
  showValueText?: boolean;
  /** Custom value text */
  valueText?: string | React.ReactNode;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Animation easing */
  easing?: 'linear' | 'ease-out' | 'ease-in-out';
  /** Disable animation */
  disableAnimation?: boolean;
  /** Round line caps */
  roundedCaps?: boolean;
  /** Indeterminate/loading state */
  isIndeterminate?: boolean;
  /** Custom stroke dash array for decorative rings */
  strokeDashArray?: string;
  /** Ring rotation (in degrees) */
  rotation?: number;
  /** Direction of progress */
  direction?: 'clockwise' | 'counterclockwise';
  /** Start angle (in degrees, 0 = top) */
  startAngle?: number;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  className?: string;
}

// Chakra UI inspired size configurations
const sizeConfig = {
  xs: { size: 32, defaultThickness: 3 },
  sm: { size: 48, defaultThickness: 4 },
  md: { size: 64, defaultThickness: 6 },
  lg: { size: 80, defaultThickness: 8 },
  xl: { size: 120, defaultThickness: 10 }
};

// Thickness configurations
const thicknessConfig = {
  thin: (size: number) => Math.max(2, size * 0.08),
  medium: (size: number) => Math.max(4, size * 0.12),
  thick: (size: number) => Math.max(6, size * 0.16)
};

// Cresol brand color palette with gradients
const colorPalettes = {
  orange: ['#F58220', '#FF9A4D'],
  green: ['#005C46', '#007F57'],
  blue: ['#3B82F6', '#60A5FA'],
  gray: ['#6B7280', '#9CA3AF'],
  red: ['#EF4444', '#F87171'],
  purple: ['#8B5CF6', '#A78BFA']
};

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
};

/**
 * ProgressRingPro function
 * @todo Add proper documentation
 */
export function ProgressRingPro({
  value,
  from = 0,
  size = 'md',
  customSize,
  thickness = 'medium',
  customThickness,
  colorPalette = 'orange',
  gradientColors,
  trackColor = '#E5E7EB',
  showValueText = true,
  valueText,
  animationDuration = 1000,
  easing = 'ease-out',
  disableAnimation = false,
  roundedCaps = true,
  isIndeterminate = false,
  strokeDashArray,
  rotation = 0,
  direction = 'clockwise',
  startAngle = -90,
  onAnimationComplete,
  className = ''
}: ProgressRingProProps) {
  const [currentValue, setCurrentValue] = useState(disableAnimation ? value : from);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Calculate dimensions
  const ringSize = customSize || sizeConfig[size].size;
  const strokeWidth = customThickness || customThickness || thicknessConfig[thickness](ringSize);
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = ringSize / 2;

  // Get colors
  const colors = gradientColors || colorPalettes[colorPalette];
  
  // Calculate progress
  const progressValue = Math.min(100, Math.max(0, currentValue));
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  // Transform for rotation and direction
  const transform = `rotate(${startAngle + rotation}deg) ${direction === 'counterclockwise' ? 'scaleX(-1)' : ''}`;

  // Animation logic
  useEffect(() => {
    if (disableAnimation || value === currentValue || isIndeterminate) {
      setCurrentValue(value);
      return;
    }

    setIsAnimating(true);
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Apply easing function
      const easedProgress = easingFunctions[easing](progress);
      
      // Calculate current value
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

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, from, animationDuration, easing, disableAnimation, isIndeterminate, onAnimationComplete, currentValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Generate unique ID for gradient
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: ringSize, height: ringSize }}
    >
      <svg
        width={ringSize}
        height={ringSize}
        className="transform"
        style={{ transform }}
      >
        <defs>
          {/* Gradient definition */}
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor={colors[0]}
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        {/* Track (background circle) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="opacity-30"
          strokeDasharray={strokeDashArray}
        />

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap={roundedCaps ? "round" : "butt"}
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? 0 : strokeDashoffset}
          className={`
            transition-all duration-300 ease-out
            ${isIndeterminate ? 'animate-spin' : ''}
            ${isAnimating ? 'animate-pulse' : ''}
            filter drop-shadow
          `}
          style={{
            transformOrigin: 'center',
            strokeDasharray: isIndeterminate ? `${circumference * 0.3} ${circumference}` : circumference
          }}
          filter="url(#drop-shadow)"
        />

        {/* Decorative inner ring */}
        {value > 80 && (
          <circle
            cx={center}
            cy={center}
            r={radius - strokeWidth - 4}
            fill="none"
            stroke={colors[1]}
            strokeWidth="1"
            opacity="0.4"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Value text */}
      {showValueText && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: direction === 'counterclockwise' ? 'scaleX(-1)' : 'none' }}
        >
          <div className="text-center">
            {valueText || (
              <div>
                <div className="text-lg font-bold text-gray-900 leading-none tabular-nums">
                  {isIndeterminate ? '...' : `${Math.round(progressValue)}%`}
                </div>
                {size !== 'xs' && size !== 'sm' && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {isIndeterminate ? 'Carregando' : 'Completo'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress indicator dot (for high values) */}
      {progressValue > 90 && !isIndeterminate && (
        <div
          className="absolute w-3 h-3 bg-white border-2 rounded-full shadow-lg"
          style={{
            borderColor: colors[0],
            top: center - strokeWidth / 2 - 6,
            left: center - 6,
            transform: `rotate(${(progressValue / 100) * 360 - 90}deg)`,
            transformOrigin: `6px ${center - 6}px`,
            animation: isAnimating ? 'pulse 1s ease-in-out' : 'none'
          }}
        />
      )}
    </div>
  );
}

export default ProgressRingPro;