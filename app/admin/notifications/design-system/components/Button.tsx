import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  fullWidth = false,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 focus:ring-gray-500/20';
      case 'outline':
        return 'bg-transparent text-primary border-2 border-primary hover:bg-primary/5 focus:ring-primary/20';
      case 'ghost':
        return 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500/20 border-0';
      case 'danger':
        return 'bg-red-500 text-white border border-red-500 hover:bg-red-600 focus:ring-red-500/20';
      default:
        return 'bg-primary text-white border border-primary hover:bg-primary/90 focus:ring-primary/20';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs font-medium';
      case 'lg':
        return 'px-6 py-3 text-base font-semibold';
      default:
        return 'px-4 py-2 text-sm font-medium';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        shadow-sm
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
};