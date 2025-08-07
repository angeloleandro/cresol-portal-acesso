'use client';

import React from 'react';
import { Icon } from '@/app/components/icons/Icon';

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
  startIcon?: import('@/app/components/icons/Icon').IconName;
  endIcon?: import('@/app/components/icons/Icon').IconName;
  onIconClick?: () => void;
}

/**
 * FormField - Professional form field wrapper
 * 
 * Enterprise-grade form field component that provides:
 * - Consistent styling across all form elements
 * - Integrated label, error, and help text handling
 * - Icon support with click handlers
 * - Responsive layout management
 * - Full WCAG 2.1 AA accessibility compliance
 * - Loading and error states
 * - Cresol design system integration
 * 
 * Based on Chakra UI v3 patterns with React Hook Form compatibility
 * 
 * @param children - Form input element (FormInput, FormSelect, etc.)
 * @param label - Field label text
 * @param error - Error message to display
 * @param helpText - Additional help text
 * @param required - Whether field is required
 * @param className - Additional CSS classes
 * @param id - Field ID for accessibility
 * @param disabled - Whether field is disabled
 * @param loading - Loading state
 * @param success - Success state
 * @param startIcon - Icon name for start position
 * @param endIcon - Icon name for end position
 * @param onIconClick - Icon click handler
 */
export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  helpText,
  required = false,
  className = '',
  id,
  disabled = false,
  loading = false,
  success = false,
  startIcon,
  endIcon,
  onIconClick
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  // Determine field state for styling
  const getFieldState = () => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (success) return 'success';
    if (disabled) return 'disabled';
    return 'default';
  };
  
  const fieldState = getFieldState();
  
  return (
    <div className={`form-field-wrapper ${className}`} data-state={fieldState}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className="form-field-label"
        >
          {label}
          {required && (
            <span className="form-field-required" aria-label="obrigatório">
              *
            </span>
          )}
          {loading && (
            <span className="form-field-loading">
              <Icon name="Loader" className="animate-spin" />
            </span>
          )}
        </label>
      )}
      
      {/* Input Container with Icons */}
      <div className="form-field-input-container">
        {/* Start Icon */}
        {startIcon && (
          <button
            type="button"
            className="form-field-icon form-field-icon-start"
            onClick={onIconClick}
            disabled={disabled || loading}
            tabIndex={onIconClick ? 0 : -1}
            aria-label={`${startIcon} icon`}
          >
            <Icon name={startIcon} />
          </button>
        )}
        
        {/* Input Element */}
        <div className="form-field-input">
          {React.cloneElement(children as React.ReactElement, {
            id: fieldId,
            'aria-describedby': [
              error ? errorId : '',
              helpText ? helpId : ''
            ].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? 'true' : 'false',
            'aria-required': required,
            disabled,
            className: `form-input ${error ? 'form-input-error' : ''} ${success ? 'form-input-success' : ''} ${startIcon ? 'form-input-with-start-icon' : ''} ${endIcon ? 'form-input-with-end-icon' : ''}`.trim()
          })}
        </div>
        
        {/* End Icon */}
        {endIcon && (
          <button
            type="button"
            className="form-field-icon form-field-icon-end"
            onClick={onIconClick}
            disabled={disabled || loading}
            tabIndex={onIconClick ? 0 : -1}
            aria-label={`${endIcon} icon`}
          >
            <Icon name={endIcon} />
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div 
          id={errorId}
          className="form-field-error"
          role="alert"
          aria-live="polite"
        >
          <Icon name="AlertTriangle" className="form-field-error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Help Text */}
      {helpText && !error && (
        <div 
          id={helpId}
          className="form-field-help"
        >
          <Icon name="Info" className="form-field-help-icon" />
          <span>{helpText}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && !error && (
        <div className="form-field-success">
          <Icon name="CheckCircle" className="form-field-success-icon" />
          <span>Campo válido</span>
        </div>
      )}
    </div>
  );
};

export default FormField;