'use client';

import { ButtonHTMLAttributes, ReactNode, useState } from 'react';

interface ShimmerButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button content */
  children: ReactNode;
  /** Chakra UI inspired size scale */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Chakra UI inspired variants */
  variant?: 'solid' | 'outline' | 'ghost' | 'subtle' | 'surface';
  /** Color palette based on Cresol brand */
  colorPalette?: 'orange' | 'green' | 'blue' | 'gray' | 'red' | 'purple';
  /** Loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Shimmer effect intensity */
  shimmerIntensity?: 'subtle' | 'medium' | 'strong';
  /** Custom shimmer colors */
  shimmerColors?: [string, string, string];
  /** Rounded corners */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Icon on the left */
  leftIcon?: ReactNode;
  /** Icon on the right */
  rightIcon?: ReactNode;
  /** Full width */
  fullWidth?: boolean;
  /** Disabled state with shimmer effect */
  disabled?: boolean;
  /** Custom shimmer animation duration */
  shimmerDuration?: string;
  className?: string;
}

// Chakra UI inspired size configurations
const sizeConfig = {
  xs: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-xs',
    height: 'h-7',
    iconSize: 'w-3 h-3',
    gap: 'gap-1'
  },
  sm: {
    padding: 'px-4 py-2',
    fontSize: 'text-sm',
    height: 'h-8',
    iconSize: 'w-4 h-4',
    gap: 'gap-2'
  },
  md: {
    padding: 'px-6 py-2.5',
    fontSize: 'text-base',
    height: 'h-10',
    iconSize: 'w-5 h-5',
    gap: 'gap-2'
  },
  lg: {
    padding: 'px-8 py-3',
    fontSize: 'text-lg',
    height: 'h-12',
    iconSize: 'w-6 h-6',
    gap: 'gap-3'
  },
  xl: {
    padding: 'px-10 py-4',
    fontSize: 'text-xl',
    height: 'h-14',
    iconSize: 'w-7 h-7',
    gap: 'gap-3'
  }
};

// Rounded configurations
const roundedConfig = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
};

// Color palette configurations with Cresol brand colors
const colorConfigs = {
  orange: {
    solid: {
      bg: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
      text: 'text-white',
      shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)'],
      focus: 'focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
    },
    outline: {
      bg: 'bg-transparent hover:bg-orange-50 active:bg-orange-100 border-2 border-orange-500',
      text: 'text-orange-500 hover:text-orange-600',
      shimmer: ['rgba(245,130,32,0)', 'rgba(245,130,32,0.3)', 'rgba(245,130,32,0)'],
      focus: 'focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
    },
    ghost: {
      bg: 'bg-transparent hover:bg-orange-50 active:bg-orange-100',
      text: 'text-orange-500 hover:text-orange-600',
      shimmer: ['rgba(245,130,32,0)', 'rgba(245,130,32,0.2)', 'rgba(245,130,32,0)'],
      focus: 'focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
    },
    subtle: {
      bg: 'bg-orange-50 hover:bg-orange-100 active:bg-orange-200',
      text: 'text-orange-600 hover:text-orange-700',
      shimmer: ['rgba(245,130,32,0)', 'rgba(245,130,32,0.3)', 'rgba(245,130,32,0)'],
      focus: 'focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
    },
    surface: {
      bg: 'bg-orange-100 hover:bg-orange-200 active:bg-orange-300',
      text: 'text-orange-700 hover:text-orange-800',
      shimmer: ['rgba(245,130,32,0)', 'rgba(245,130,32,0.4)', 'rgba(245,130,32,0)'],
      focus: 'focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
    }
  },
  green: {
    solid: {
      bg: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
      text: 'text-white',
      shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)'],
      focus: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
    },
    outline: {
      bg: 'bg-transparent hover:bg-green-50 active:bg-green-100 border-2 border-green-600',
      text: 'text-green-600 hover:text-green-700',
      shimmer: ['rgba(0,92,70,0)', 'rgba(0,92,70,0.3)', 'rgba(0,92,70,0)'],
      focus: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
    },
    ghost: {
      bg: 'bg-transparent hover:bg-green-50 active:bg-green-100',
      text: 'text-green-600 hover:text-green-700',
      shimmer: ['rgba(0,92,70,0)', 'rgba(0,92,70,0.2)', 'rgba(0,92,70,0)'],
      focus: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
    },
    subtle: {
      bg: 'bg-green-50 hover:bg-green-100 active:bg-green-200',
      text: 'text-green-700 hover:text-green-800',
      shimmer: ['rgba(0,92,70,0)', 'rgba(0,92,70,0.3)', 'rgba(0,92,70,0)'],
      focus: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
    },
    surface: {
      bg: 'bg-green-100 hover:bg-green-200 active:bg-green-300',
      text: 'text-green-800 hover:text-green-900',
      shimmer: ['rgba(0,92,70,0)', 'rgba(0,92,70,0.4)', 'rgba(0,92,70,0)'],
      focus: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
    }
  },
  blue: {
    solid: {
      bg: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
      text: 'text-white',
      shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)'],
      focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    },
    outline: {
      bg: 'bg-transparent hover:bg-blue-50 active:bg-blue-100 border-2 border-blue-500',
      text: 'text-blue-500 hover:text-blue-600',
      shimmer: ['rgba(59,130,246,0)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0)'],
      focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    },
    ghost: {
      bg: 'bg-transparent hover:bg-blue-50 active:bg-blue-100',
      text: 'text-blue-500 hover:text-blue-600',
      shimmer: ['rgba(59,130,246,0)', 'rgba(59,130,246,0.2)', 'rgba(59,130,246,0)'],
      focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    },
    subtle: {
      bg: 'bg-blue-50 hover:bg-blue-100 active:bg-blue-200',
      text: 'text-blue-600 hover:text-blue-700',
      shimmer: ['rgba(59,130,246,0)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0)'],
      focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    },
    surface: {
      bg: 'bg-blue-100 hover:bg-blue-200 active:bg-blue-300',
      text: 'text-blue-700 hover:text-blue-800',
      shimmer: ['rgba(59,130,246,0)', 'rgba(59,130,246,0.4)', 'rgba(59,130,246,0)'],
      focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    }
  },
  gray: {
    solid: {
      bg: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
      text: 'text-white',
      shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)'],
      focus: 'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    },
    outline: {
      bg: 'bg-transparent hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-300',
      text: 'text-gray-600 hover:text-gray-700',
      shimmer: ['rgba(107,114,128,0)', 'rgba(107,114,128,0.3)', 'rgba(107,114,128,0)'],
      focus: 'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    },
    ghost: {
      bg: 'bg-transparent hover:bg-gray-50 active:bg-gray-100',
      text: 'text-gray-600 hover:text-gray-700',
      shimmer: ['rgba(107,114,128,0)', 'rgba(107,114,128,0.2)', 'rgba(107,114,128,0)'],
      focus: 'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    },
    subtle: {
      bg: 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200',
      text: 'text-gray-700 hover:text-gray-800',
      shimmer: ['rgba(107,114,128,0)', 'rgba(107,114,128,0.3)', 'rgba(107,114,128,0)'],
      focus: 'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    },
    surface: {
      bg: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300',
      text: 'text-gray-800 hover:text-gray-900',
      shimmer: ['rgba(107,114,128,0)', 'rgba(107,114,128,0.4)', 'rgba(107,114,128,0)'],
      focus: 'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    }
  },
  red: {
    solid: {
      bg: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
      text: 'text-white',
      shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)'],
      focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    },
    outline: {
      bg: 'bg-transparent hover:bg-red-50 active:bg-red-100 border-2 border-red-500',
      text: 'text-red-500 hover:text-red-600',
      shimmer: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.3)', 'rgba(239,68,68,0)'],
      focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    },
    ghost: {
      bg: 'bg-transparent hover:bg-red-50 active:bg-red-100',
      text: 'text-red-500 hover:text-red-600',
      shimmer: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.2)', 'rgba(239,68,68,0)'],
      focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    },
    subtle: {
      bg: 'bg-red-50 hover:bg-red-100 active:bg-red-200',
      text: 'text-red-600 hover:text-red-700',
      shimmer: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.3)', 'rgba(239,68,68,0)'],
      focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    },
    surface: {
      bg: 'bg-red-100 hover:bg-red-200 active:bg-red-300',
      text: 'text-red-700 hover:text-red-800',
      shimmer: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.4)', 'rgba(239,68,68,0)'],
      focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    }
  },
  purple: {
    solid: {
      bg: 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700',
      text: 'text-white',
      shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)'],
      focus: 'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
    },
    outline: {
      bg: 'bg-transparent hover:bg-purple-50 active:bg-purple-100 border-2 border-purple-500',
      text: 'text-purple-500 hover:text-purple-600',
      shimmer: ['rgba(139,92,246,0)', 'rgba(139,92,246,0.3)', 'rgba(139,92,246,0)'],
      focus: 'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
    },
    ghost: {
      bg: 'bg-transparent hover:bg-purple-50 active:bg-purple-100',
      text: 'text-purple-500 hover:text-purple-600',
      shimmer: ['rgba(139,92,246,0)', 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0)'],
      focus: 'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
    },
    subtle: {
      bg: 'bg-purple-50 hover:bg-purple-100 active:bg-purple-200',
      text: 'text-purple-600 hover:text-purple-700',
      shimmer: ['rgba(139,92,246,0)', 'rgba(139,92,246,0.3)', 'rgba(139,92,246,0)'],
      focus: 'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
    },
    surface: {
      bg: 'bg-purple-100 hover:bg-purple-200 active:bg-purple-300',
      text: 'text-purple-700 hover:text-purple-800',
      shimmer: ['rgba(139,92,246,0)', 'rgba(139,92,246,0.4)', 'rgba(139,92,246,0)'],
      focus: 'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
    }
  }
};

// Shimmer intensity configurations
const shimmerIntensityConfig = {
  subtle: 'opacity-30',
  medium: 'opacity-50',
  strong: 'opacity-70'
};

export function ShimmerButton({
  children,
  size = 'md',
  variant = 'solid',
  colorPalette = 'orange',
  loading = false,
  loadingText,
  shimmerIntensity = 'medium',
  shimmerColors,
  rounded = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  shimmerDuration = '1.5s',
  className = '',
  ...props
}: ShimmerButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeStyles = sizeConfig[size];
  const roundedStyles = roundedConfig[rounded];
  const colorStyles = colorConfigs[colorPalette][variant];
  const shimmerOpacity = shimmerIntensityConfig[shimmerIntensity];
  
  // Use custom shimmer colors or default from color config
  const shimmerGradient = shimmerColors || colorStyles.shimmer;

  const baseClasses = `
    inline-flex items-center justify-center
    ${sizeStyles.padding} ${sizeStyles.fontSize} ${sizeStyles.height} ${sizeStyles.gap}
    ${roundedStyles}
    font-semibold
    transition-all duration-200 ease-in-out
    ${colorStyles.bg} ${colorStyles.text} ${colorStyles.focus}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    relative overflow-hidden
    transform hover:scale-105 active:scale-95
    ${className}
  `;

  const shimmerKeyframes = `
    @keyframes shimmer {
      0% { transform: translateX(-100%) }
      100% { transform: translateX(100%) }
    }
  `;

  const shimmerStyle = {
    background: `linear-gradient(90deg, ${shimmerGradient[0]}, ${shimmerGradient[1]}, ${shimmerGradient[2]})`,
    animation: `shimmer ${shimmerDuration} infinite`,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      <button
        className={baseClasses}
        disabled={disabled || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Shimmer effect overlay */}
        <div
          className={`
            absolute inset-0 
            ${shimmerOpacity}
            ${isHovered || loading ? 'animate-shimmer' : ''}
          `}
          style={shimmerStyle}
        />

        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center gap-inherit">
          {loading ? (
            <>
              {/* Loading spinner */}
              <div
                className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeStyles.iconSize}`}
              />
              {loadingText && (
                <span className="ml-2">{loadingText}</span>
              )}
            </>
          ) : (
            <>
              {leftIcon && (
                <span className={`${sizeStyles.iconSize} flex items-center justify-center`}>
                  {leftIcon}
                </span>
              )}
              {children}
              {rightIcon && (
                <span className={`${sizeStyles.iconSize} flex items-center justify-center`}>
                  {rightIcon}
                </span>
              )}
            </>
          )}
        </div>

        {/* Additional glow effect on hover */}
        {isHovered && !disabled && (
          <div
            className="absolute inset-0 rounded-inherit opacity-20 blur-sm"
            style={{
              background: `radial-gradient(circle, ${shimmerGradient[1]}, transparent 70%)`
            }}
          />
        )}
      </button>
    </>
  );
}

export default ShimmerButton;