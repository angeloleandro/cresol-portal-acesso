'use client';

import React, { forwardRef, useMemo } from 'react';

import { ChakraSelect, ChakraSelectProps, ChakraSelectOption } from './ChakraSelect';

// Manter interface SelectOption original para compatibilidade
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  group?: string;
}

// Manter interface FormSelectProps original para compatibilidade
export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  variant?: 'outline' | 'filled' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  noOptionsText?: string;
  loadingText?: string;
  emptyText?: string;
  maxHeight?: number;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({
  options = [],
  variant = 'outline',
  size = 'md',
  isInvalid = false,
  isLoading = false,
  fullWidth = true,
  searchable = false,
  clearable = false,
  onClear,
  noOptionsText = 'Nenhuma opção disponível',
  loadingText = 'Carregando...',
  emptyText = 'Nenhum resultado encontrado',
  maxHeight = 300,
  onSearch,
  className = '',
  value = '',
  disabled,
  placeholder = 'Selecione uma opção...',
  onChange,
  name,
  id,
  'aria-label': ariaLabel,
  ...props
}, ref) => {

  // Converter SelectOption[] para ChakraSelectOption[]
  const chakraOptions = useMemo((): ChakraSelectOption[] => {
    return options.map(option => ({
      value: option.value,
      label: option.label,
      description: option.description,
      disabled: option.disabled,
      group: option.group,
    }));
  }, [options]);

  // Mapear variant para Chakra UI
  const chakraVariant = useMemo(() => {
    if (variant === 'filled') return 'subtle';
    return 'outline'; // Default para outline e underline
  }, [variant]);

  // Handler para mudança de valor - manter compatibilidade com onChange
  const handleChange = (newValue: string | string[]) => {
    if (typeof newValue === 'string') {
      if (!onChange) {

        return;
      }
      
      // Criar evento sintético compatível com React Hook Form
      const syntheticEvent = {
        target: { value: newValue, name },
        currentTarget: { value: newValue, name }
      } as React.ChangeEvent<HTMLSelectElement>;
      
      onChange(syntheticEvent);
    }
  };

  // Note: handleClear removido pois não está sendo usado
  // A funcionalidade de clear foi removida do ChakraSelect

  // Props para o ChakraSelect
  const chakraProps: ChakraSelectProps = {
    options: chakraOptions,
    value: typeof value === 'string' ? value : '',
    onChange: handleChange,
    placeholder,
    size: size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md',
    variant: chakraVariant,
    disabled,
    invalid: isInvalid,
    loading: isLoading,
    multiple: false, // FormSelect original não suporta multiple
    clearable: clearable && !!onClear,
    searchable,
    name,
    id,
    'aria-label': ariaLabel,
    fullWidth,
    className,
  };

  return (
    <div className="form-select-wrapper">
      {/* Hidden select original para máxima compatibilidade com formulários */}
      <select
        ref={ref}
        value={value}
        onChange={() => {}} // Handler vazio para evitar warning do React
        disabled={disabled || isLoading}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* ChakraSelect como implementação visual */}
      <ChakraSelect
        {...chakraProps}
      />
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;

// Tipos já exportados no arquivo de interface principal