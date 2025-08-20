'use client';

import React, { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react';
import { Icon } from '@/app/components/icons/Icon';
import { INPUT_CONFIG, CRESOL_TEXT_CONSTANTS } from '@/lib/design-tokens';

// Types para diferentes elementos de input
type BaseInputProps = {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  optional?: boolean;
  
  // Chakra UI v3 props
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  
  // Estados
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isLoading?: boolean;
  
  // Ícones e elementos
  startIcon?: import('@/app/components/icons/Icon').IconName;
  endIcon?: import('@/app/components/icons/Icon').IconName;
  startElement?: ReactNode;
  endElement?: ReactNode;
  
  // Addons (InputGroup)
  startAddon?: string | ReactNode;
  endAddon?: string | ReactNode;
  
  // Eventos de ícones
  onIconClick?: () => void;
  onStartIconClick?: () => void;
  onEndIconClick?: () => void;
  
  // Funcionalidades especiais
  clearable?: boolean;
  onClear?: () => void;
  showPasswordToggle?: boolean;
  
  // Styling
  fullWidth?: boolean;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  groupClassName?: string;
};

// Props para input normal
interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  as?: 'input';
}

// Props para textarea
interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  as: 'textarea';
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// União dos tipos
export type StandardizedInputProps = InputProps | TextareaProps;

/**
 * StandardizedInput - Componente Input baseado no Chakra UI v3
 * 
 * CHAKRA UI V3 FEATURES:
 * - Variantes: outline (padrão), filled, flushed, unstyled
 * - Tamanhos: xs, sm, md (padrão), lg
 * - InputGroup: startAddon, endAddon, startElement, endElement
 * - Field wrapper: label, help, error states
 * - Estados completos: invalid, disabled, readOnly, loading
 * - Acessibilidade WCAG 2.1 AA
 * 
 * FUNCIONALIDADES PRESERVADAS:
 * - Ícones clicáveis e elementos customizados
 * - Password visibility toggle
 * - Clear functionality
 * - Loading states com spinner
 * - Validação e mensagens de erro
 * - Support para textarea
 * - Design tokens Cresol
 * 
 * USAGE:
 * ```tsx
 * // Input básico
 * <StandardizedInput 
 *   label="E-mail" 
 *   variant="outline"
 *   size="md"
 *   type="email" 
 *   required 
 * />
 * 
 * // Com ícones
 * <StandardizedInput 
 *   label="Buscar"
 *   startIcon="search"
 *   variant="filled"
 * />
 * 
 * // Com addons
 * <StandardizedInput 
 *   label="Website"
 *   startAddon="https://"
 *   endAddon=".com"
 * />
 * 
 * // Password com toggle
 * <StandardizedInput 
 *   label="Senha"
 *   type="password"
 *   showPasswordToggle
 * />
 * 
 * // Textarea
 * <StandardizedInput 
 *   as="textarea"
 *   label="Descrição"
 *   rows={4}
 *   variant="outline"
 * />
 * ```
 */
export const StandardizedInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, StandardizedInputProps>(
  function StandardizedInput(props, ref) {
    const {
      label,
      error,
      help,
      required = false,
      optional = false,
      variant = 'outline',
      size = 'md',
      isInvalid = false,
      isDisabled = false,
      isReadOnly = false,
      isLoading = false,
      startIcon,
      endIcon,
      startElement,
      endElement,
      startAddon,
      endAddon,
      onIconClick,
      onStartIconClick,
      onEndIconClick,
      clearable = false,
      onClear,
      showPasswordToggle = false,
      fullWidth = true,
      className = '',
      labelClassName = '',
      containerClassName = '',
      groupClassName = '',
      id,
      as = 'input',
      value = '',
      disabled,
      placeholder,
      ...inputProps
    } = props;

    // Obter type de forma segura
    const inputType = (props as InputProps).type || 'text';

    // Estado interno
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // Determinar estados
    const effectiveVariant = error || isInvalid ? 'error' : 'default';
    const effectiveDisabled = disabled || isDisabled || isLoading;
    
    // Gerar ID automático se não fornecido
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Toggle password visibility
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
    
    // Determine input display type based on password toggle  
    const displayType = inputType === 'password' && showPassword ? 'text' : inputType;
    
    // Build CSS classes usando design tokens
    const getInputClasses = () => {
      const baseClasses = INPUT_CONFIG.base;
      const variantConfig = INPUT_CONFIG.variants[variant];
      const sizeConfig = INPUT_CONFIG.sizes[size];
      const stateClasses = variantConfig.states[effectiveVariant];
      
      // Classes especiais para tipos
      let typeClasses = '';
      if (startIcon || startElement || startAddon) {
        typeClasses += ' ' + INPUT_CONFIG.types.search.paddingLeft;
      }
      if (endIcon || endElement || endAddon || clearable || (inputType === 'password' && showPasswordToggle)) {
        typeClasses += ' ' + INPUT_CONFIG.types.password.paddingRight;
      }
      
      const widthClass = fullWidth ? 'w-full' : '';
      const disabledClasses = effectiveDisabled ? variantConfig.states.disabled : '';
      
      return `${baseClasses} ${variantConfig.classes} ${sizeConfig.classes} ${stateClasses} ${typeClasses} ${disabledClasses} ${widthClass} ${className}`.trim();
    };
    
    // Container classes
    const containerClasses = `${INPUT_CONFIG.field.base} ${containerClassName}`;
    
    // Label classes
    const getLabelClasses = () => {
      let labelClass = INPUT_CONFIG.field.label;
      if (required) labelClass += ' after:content-["*"] after:ml-0.5 after:text-red-500';
      return `${labelClass} ${labelClassName}`;
    };
    
    // Verificar se precisa de InputGroup
    const hasGroup = startAddon || endAddon || startElement || endElement || startIcon || endIcon || 
                     clearable || (inputType === 'password' && showPasswordToggle) || isLoading;
    
    // Renderizar elemento de input ou textarea
    const renderInputElement = () => {
      const { as: _, label: __, error: ___, help: ____, required: _____, optional: ______, 
              variant: _______, size: ________, isInvalid: _________, isDisabled: __________, 
              isReadOnly: ___________, isLoading: ____________, startIcon: _____________,
              endIcon: ______________, startElement: _______________, endElement: ________________,
              startAddon: _________________, endAddon: __________________, onIconClick: ___________________,
              onStartIconClick: ____________________, onEndIconClick: _____________________, 
              clearable: ______________________, onClear: _______________________, showPasswordToggle: ________________________,
              fullWidth: _________________________, className: __________________________, 
              labelClassName: ___________________________, containerClassName: ____________________________,
              groupClassName: _____________________________, disabled: ______________________________, 
              ...restProps } = inputProps as any;

      const commonProps = {
        id: inputId,
        ref: ref as any,
        type: displayType,
        value,
        disabled: effectiveDisabled,
        readOnly: isReadOnly,
        placeholder: effectiveDisabled ? '' : placeholder,
        className: getInputClasses(),
        onFocus: (e: any) => {
          setIsFocused(true);
          if (restProps.onFocus) restProps.onFocus(e);
        },
        onBlur: (e: any) => {
          setIsFocused(false);
          if (restProps.onBlur) restProps.onBlur(e);
        },
        'aria-invalid': error || isInvalid,
        'aria-describedby': error ? `${inputId}-error` : help ? `${inputId}-help` : undefined,
        'aria-required': required,
        ...restProps,
      };

      if (as === 'textarea') {
        const { rows = 3, resize = 'vertical', ...textareaProps } = restProps;
        return (
          <textarea
            {...commonProps}
            {...textareaProps}
            rows={rows}
            style={{ resize }}
          />
        );
      }

      return <input {...commonProps} />;
    };
    
    // Renderizar ícone ou elemento
    const renderIcon = (
      iconName?: import('@/app/components/icons/Icon').IconName, 
      element?: ReactNode, 
      position: 'left' | 'right' = 'left',
      onClick?: () => void
    ) => {
      if (!iconName && !element) return null;
      
      const positionClass = position === 'left' 
        ? INPUT_CONFIG.group.element.left 
        : INPUT_CONFIG.group.element.right;
      const interactiveClass = onClick ? INPUT_CONFIG.group.element.interactive : '';
      
      return (
        <div className={`${INPUT_CONFIG.group.element.base} ${positionClass} ${interactiveClass}`}>
          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              disabled={effectiveDisabled}
              tabIndex={0}
              className="flex items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={iconName ? `${iconName} icon` : 'Interactive element'}
            >
              {element || (iconName && <Icon name={iconName} className={INPUT_CONFIG.sizes[size].iconSize} />)}
            </button>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              {element || (iconName && <Icon name={iconName} className={INPUT_CONFIG.sizes[size].iconSize} />)}
            </div>
          )}
        </div>
      );
    };
    
    // Renderizar addon
    const renderAddon = (addon: string | ReactNode, position: 'left' | 'right') => {
      if (!addon) return null;
      
      const positionClass = position === 'left' 
        ? INPUT_CONFIG.group.addon.left 
        : INPUT_CONFIG.group.addon.right;
      
      return (
        <div className={`${INPUT_CONFIG.group.addon.base} ${positionClass}`}>
          {addon}
        </div>
      );
    };
    
    // Renderizar input com ou sem group
    const renderInput = () => {
      if (!hasGroup) {
        return renderInputElement();
      }
      
      return (
        <div className={`${INPUT_CONFIG.group.base} ${groupClassName}`}>
          {/* Start Addon */}
          {renderAddon(startAddon, 'left')}
          
          {/* Start Icon/Element */}
          {renderIcon(startIcon, startElement, 'left', onStartIconClick || onIconClick)}
          
          {/* Input Element */}
          {renderInputElement()}
          
          {/* Loading Spinner */}
          {isLoading && renderIcon(undefined, 
            <Icon name="Loader" className={`${INPUT_CONFIG.sizes[size].iconSize} animate-spin`} />, 
            'right'
          )}
          
          {/* End Icon/Element (apenas se não estiver loading) */}
          {!isLoading && renderIcon(endIcon, endElement, 'right', onEndIconClick || onIconClick)}
          
          {/* Clear Button (apenas se não houver endIcon e não estiver loading) */}
          {!isLoading && !endIcon && !endElement && clearable && value && String(value).length > 0 && 
            renderIcon('X', undefined, 'right', handleClear)
          }
          
          {/* Password Toggle (apenas se não houver endIcon/clearable e não estiver loading) */}
          {!isLoading && !endIcon && !endElement && !clearable && inputType === 'password' && showPasswordToggle && 
            renderIcon(showPassword ? 'EyeOff' : 'Eye', undefined, 'right', togglePasswordVisibility)
          }
          
          {/* End Addon */}
          {renderAddon(endAddon, 'right')}
        </div>
      );
    };

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={getLabelClasses()}>
            {label}
            {optional && (
              <span className="text-gray-400 text-xs ml-1">
                ({CRESOL_TEXT_CONSTANTS.help.optional})
              </span>
            )}
          </label>
        )}
        
        {/* Input/InputGroup */}
        {renderInput()}
        
        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className={INPUT_CONFIG.help.error}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {/* Help Text (apenas se não houver erro) */}
        {!error && help && (
          <p
            id={`${inputId}-help`}
            className={INPUT_CONFIG.help.default}
          >
            {help}
          </p>
        )}
      </div>
    );
  }
);

StandardizedInput.displayName = 'StandardizedInput';

// Componentes específicos para conveniência
export const StandardizedTextarea = forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'as'>>(
  function StandardizedTextarea(props, ref) {
    return <StandardizedInput {...props} as="textarea" ref={ref} />;
  }
);

// Field wrapper convenience component (seguindo padrão Chakra UI)
export interface FieldProps {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export const Field = ({ 
  label, 
  error, 
  help, 
  required, 
  optional, 
  children, 
  className = '' 
}: FieldProps) => {
  return (
    <div className={`${INPUT_CONFIG.field.base} ${className}`}>
      {label && (
        <label className={INPUT_CONFIG.field.label}>
          {label}
          {required && <span className={INPUT_CONFIG.field.requiredIndicator}>*</span>}
          {optional && (
            <span className="text-gray-400 text-xs ml-1">
              ({CRESOL_TEXT_CONSTANTS.help.optional})
            </span>
          )}
        </label>
      )}
      
      {children}
      
      {error && (
        <p className={INPUT_CONFIG.field.errorText} role="alert" aria-live="polite">
          {error}
        </p>
      )}
      
      {!error && help && (
        <p className={INPUT_CONFIG.field.helpText}>
          {help}
        </p>
      )}
    </div>
  );
};

// Hook para controle de estado (preservado da implementação anterior)
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

export default StandardizedInput;