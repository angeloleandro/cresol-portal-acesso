'use client';

import React, { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { CRESOL_UI_CONFIG, CRESOL_TEXT_CONSTANTS } from '@/lib/design-tokens';

// Tipos para diferentes elementos de input
type BaseInputProps = {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  optional?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
};

// Props para input normal
interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  as?: 'input';
}

// Props para textarea
interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  as: 'textarea';
  rows?: number;
}

// União dos tipos
export type StandardizedInputProps = InputProps | TextareaProps;

/**
 * Componente de Input padronizado seguindo o Design System Cresol
 * 
 * FEATURES:
 * - Suporte a input e textarea
 * - Estados: default, error, success, disabled
 * - Tamanhos: sm, md, lg
 * - Labels automáticos com indicador required/optional
 * - Help text e mensagens de erro
 * - Ícones posicionáveis
 * - Classes consistentes eliminando hardcode
 * - Acessibilidade completa
 * - Tipos TypeScript completos
 * 
 * USAGE:
 * ```tsx
 * <StandardizedInput 
 *   label="E-mail" 
 *   type="email" 
 *   required 
 *   error="E-mail inválido"
 * />
 * 
 * <StandardizedInput 
 *   as="textarea"
 *   label="Descrição" 
 *   rows={4}
 *   help="Máximo 500 caracteres"
 * />
 * ```
 */
const StandardizedInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, StandardizedInputProps>(
  function StandardizedInput(props, ref) {
    const {
      label,
      error,
      help,
      required = false,
      optional = false,
      size = 'md',
      variant = 'default',
      icon,
      iconPosition = 'left',
      className = '',
      labelClassName = '',
      containerClassName = '',
      id,
      as = 'input',
      ...inputProps
    } = props;

    // Determinar variant baseado no estado
    const effectiveVariant = error ? 'error' : variant;
    
    // Gerar ID automático se não fornecido
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Classes do container principal
    const containerClasses = `${CRESOL_UI_CONFIG.form.fieldGroup} ${containerClassName}`;
    
    // Classes do label usando design tokens (eliminando hardcode)
    const getLabelClasses = () => {
      if (required) return `${CRESOL_UI_CONFIG.input.label.required} ${labelClassName}`;
      if (optional) return `${CRESOL_UI_CONFIG.input.label.optional} ${labelClassName}`;
      return `${CRESOL_UI_CONFIG.input.label.default} ${labelClassName}`;
    };
    
    // Classes do input usando design tokens
    const getInputClasses = () => {
      const baseClasses = CRESOL_UI_CONFIG.input.base;
      const stateClasses = CRESOL_UI_CONFIG.input.states[effectiveVariant];
      const sizeClasses = CRESOL_UI_CONFIG.input.sizes[size];
      const iconClasses = icon ? (
        iconPosition === 'left' ? CRESOL_UI_CONFIG.input.types.search : CRESOL_UI_CONFIG.input.types.password
      ) : '';
      
      return `${baseClasses} ${stateClasses} ${sizeClasses} ${iconClasses} ${className}`;
    };
    
    // Classes do help text
    const getHelpClasses = () => {
      if (error) return CRESOL_UI_CONFIG.input.help.error;
      if (effectiveVariant === 'success') return CRESOL_UI_CONFIG.input.help.success;
      return CRESOL_UI_CONFIG.input.help.default;
    };

    // Elemento de input ou textarea
    const InputElement = () => {
      const { as: _, label: __, error: ___, help: ____, required: _____, optional: ______, 
              size: _______, variant: ________, icon: _________, iconPosition: __________, 
              className: ___________, labelClassName: ____________, containerClassName: _____________,
              ...restProps } = inputProps as any;

      const commonProps = {
        id: inputId,
        ref: ref as any,
        className: getInputClasses(),
        'aria-invalid': !!error,
        'aria-describedby': error ? `${inputId}-error` : help ? `${inputId}-help` : undefined,
      };

      if (as === 'textarea') {
        const { rows = 3, ...textareaProps } = restProps;
        return (
          <textarea
            {...commonProps}
            {...textareaProps}
            rows={rows}
          />
        );
      }

      return (
        <input
          {...commonProps}
          {...restProps}
        />
      );
    };

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={getLabelClasses()}>
            {label}
            {required && (
              <span className="text-red-500" aria-label="Campo obrigatório">
                {' *'}
              </span>
            )}
            {optional && (
              <span className="text-gray-400 text-xs ml-1">
                ({CRESOL_TEXT_CONSTANTS.help.optional})
              </span>
            )}
          </label>
        )}
        
        {/* Input Container com ícone */}
        <div className="relative">
          {/* Ícone esquerdo */}
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {icon}
              </div>
            </div>
          )}
          
          {/* Input/Textarea */}
          <InputElement />
          
          {/* Ícone direito */}
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="text-gray-400">
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {/* Mensagem de erro */}
        {error && (
          <p
            id={`${inputId}-error`}
            className={getHelpClasses()}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {/* Help text (apenas se não houver erro) */}
        {!error && help && (
          <p
            id={`${inputId}-help`}
            className={getHelpClasses()}
          >
            {help}
          </p>
        )}
      </div>
    );
  }
);

export default StandardizedInput;

// Componentes específicos para conveniência
export const StandardizedTextarea = forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'as'>>(
  function StandardizedTextarea(props, ref) {
    return <StandardizedInput {...props} as="textarea" ref={ref} />;
  }
);

// Hook para controle de estado (opcional)
export const useInputState = (initialValue: string = '') => {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState<string>('');
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (error) setError(''); // Limpa erro ao digitar
  };
  
  const validate = (validator: (value: string) => string | undefined) => {
    const errorMessage = validator(value);
    setError(errorMessage || '');
    return !errorMessage;
  };
  
  return {
    value,
    error,
    onChange,
    setValue,
    setError,
    validate,
    reset: () => {
      setValue(initialValue);
      setError('');
    },
  };
};