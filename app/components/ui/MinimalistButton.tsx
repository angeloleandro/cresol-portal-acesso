import React from 'react';
import { Icon, IconName } from '@/app/components/icons/Icon';

interface MinimalistButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const MinimalistButton: React.FC<MinimalistButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  onClick,
  disabled = false,
  className = '',
  fullWidth = false
}) => {
  const baseClasses = 'group relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-orange-500 text-white border border-orange-500 hover:bg-orange-600 hover:border-orange-600 focus:ring-orange-500 active:bg-orange-700',
    secondary: 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 focus:ring-gray-500 active:bg-gray-300',
    ghost: 'text-gray-700 border border-transparent hover:bg-gray-100 hover:border-gray-200 focus:ring-gray-500 active:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 active:bg-gray-100'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-md gap-2.5'
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const fullWidthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidthClass} ${className}`;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      
      {icon && iconPosition === 'left' && (
        <Icon name={icon} className={iconSizeClasses[size]} />
      )}
      <span className="relative leading-none">{children}</span>
      {icon && iconPosition === 'right' && (
        <Icon name={icon} className={iconSizeClasses[size]} />
      )}
    </button>
  );
};
