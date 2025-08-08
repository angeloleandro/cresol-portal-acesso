import React from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'datetime-local';
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  required = false,
  value,
  onChange,
  type = 'text',
  error,
  helpText,
  size = 'md',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getStateClasses = () => {
    if (error) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500/20';
    }
    return 'border-gray-300 focus:border-primary focus:ring-primary/20';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`
            w-full
            ${getSizeClasses()}
            ${getStateClasses()}
            border
            rounded-lg
            bg-white
            transition-colors duration-200
            focus:outline-none
            focus:ring-2
            placeholder:text-gray-400
            disabled:bg-gray-50
            disabled:text-gray-500
            disabled:border-gray-200
          `}
        />
      </div>
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};