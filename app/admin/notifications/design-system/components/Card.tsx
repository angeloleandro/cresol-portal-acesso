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
        return 'bg-white border-0 shadow-lg';
      case 'outlined':
        return 'bg-white border-2 border-gray-200 shadow-sm';
      default:
        return 'bg-white border border-gray-200 shadow-md';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  return (
    <div
      className={`
        ${getVariantClasses()}
        ${getPaddingClasses()}
        rounded-lg
        transition-all duration-250
        ${className}
      `}
    >
      {children}
    </div>
  );
};