import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white border border-gray-200/40 hover:border-gray-200/70';
      case 'outlined':
        return 'bg-white border border-gray-200/40 hover:border-gray-200/70';
      default:
        return 'bg-white border border-gray-200/40 hover:border-gray-200/70';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'p-3 sm:p-4';
      case 'lg':
        return 'p-6 sm:p-8';
      default:
        return 'p-4 sm:p-6';
    }
  };

  return (
    <div
      className={`
        ${getVariantClasses()}
        ${getPaddingClasses()}
        rounded-lg sm:rounded-xl
        transition-colors duration-150
        ${className}
      `}
    >
      {children}
    </div>
  );
};