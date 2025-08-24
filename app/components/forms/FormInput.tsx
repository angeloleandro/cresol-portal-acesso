'use client';

import React, { forwardRef, useState } from 'react';

import { Icon } from '@/app/components/icons/Icon';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'outline' | 'filled' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
  isLoading?: boolean;
  startIcon?: import('@/app/components/icons/Icon').IconName;
  endIcon?: import('@/app/components/icons/Icon').IconName;
  onIconClick?: () => void;
  fullWidth?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  variant = 'outline',
  size = 'md',
  isInvalid = false,
  isLoading = false,
  startIcon,
  endIcon,
  onIconClick,
  fullWidth = true,
  clearable = false,
  onClear,
  showPasswordToggle = false,
  className = '',
  type = 'text',
  value = '',
  disabled,
  placeholder,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Handle clear functionality
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    // Focus back to input after clearing
    if (ref && 'current' in ref && ref.current) {
      ref.current.focus();
    }
  };
  
  // Determine input type based on password toggle
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Build CSS classes
  const inputClasses = [
    'form-input-base',
    `form-input-${variant}`,
    `form-input-${size}`,
    fullWidth ? 'form-input-full-width' : '',
    isInvalid ? 'form-input-invalid' : '',
    isLoading ? 'form-input-loading' : '',
    isFocused ? 'form-input-focused' : '',
    disabled ? 'form-input-disabled' : '',
    startIcon ? 'form-input-has-start-icon' : '',
    (endIcon || clearable || (type === 'password' && showPasswordToggle)) ? 'form-input-has-end-icon' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className="form-input-wrapper" data-variant={variant} data-size={size}>
      {/* Start Icon */}
      {startIcon && (
        <div className="form-input-icon-container form-input-icon-start">
          <button
            type="button"
            className="form-input-icon-button"
            onClick={onIconClick}
            disabled={disabled || isLoading}
            tabIndex={onIconClick ? 0 : -1}
            aria-label={`${startIcon} icon`}
          >
            <Icon name={startIcon} className="form-input-icon" />
          </button>
        </div>
      )}
      
      {/* Input Element */}
      <input
        ref={ref}
        type={inputType}
        value={value}
        disabled={disabled || isLoading}
        placeholder={disabled ? '' : placeholder}
        className={inputClasses}
        onFocus={(e) => {
          setIsFocused(true);
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        aria-invalid={isInvalid}
        {...props}
      />
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="form-input-icon-container form-input-icon-end">
          <Icon name="Loader" className="form-input-icon form-input-spinner" />
        </div>
      )}
      
      {/* End Icon */}
      {!isLoading && endIcon && (
        <div className="form-input-icon-container form-input-icon-end">
          <button
            type="button"
            className="form-input-icon-button"
            onClick={onIconClick}
            disabled={disabled}
            tabIndex={onIconClick ? 0 : -1}
            aria-label={`${endIcon} icon`}
          >
            <Icon name={endIcon} className="form-input-icon" />
          </button>
        </div>
      )}
      
      {/* Clear Button */}
      {!isLoading && !endIcon && clearable && value && String(value).length > 0 && (
        <div className="form-input-icon-container form-input-icon-end">
          <button
            type="button"
            className="form-input-icon-button form-input-clear-button"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Limpar campo"
            tabIndex={0}
          >
            <Icon name="X" className="form-input-icon" />
          </button>
        </div>
      )}
      
      {/* Password Toggle */}
      {!isLoading && !endIcon && !clearable && type === 'password' && showPasswordToggle && (
        <div className="form-input-icon-container form-input-icon-end">
          <button
            type="button"
            className="form-input-icon-button form-input-password-toggle"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={0}
          >
            <Icon 
              name={showPassword ? 'EyeOff' : 'Eye'} 
              className="form-input-icon" 
            />
          </button>
        </div>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;