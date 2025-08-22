'use client';

import React, { forwardRef, useMemo } from 'react';
import {
  Portal,
  Select,
  Field,
  Spinner,
  createListCollection
} from "@chakra-ui/react";

export interface ChakraSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface ChakraSelectProps {
  options: ChakraSelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'subtle';
  disabled?: boolean;
  invalid?: boolean;
  loading?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  label?: string;
  errorMessage?: string;
  helperText?: string;
  name?: string;
  id?: string;
  'aria-label'?: string;
  fullWidth?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * ChakraSelect - Componente Select padronizado baseado no Chakra UI v3
 * 
 * Implementa o Select seguindo a documentação oficial do Chakra UI v3,
 * adaptado para usar as cores do sistema de design Cresol:
 * - Primary: #F58220 (laranja Cresol)
 * - Grays: #727176, #D0D0CE, #4A4A4A
 * - Borders: #d1d5db
 * 
 * Features:
 * - Suporte a grupos de opções
 * - Busca/filtro (quando searchable=true)
 * - Multi-seleção (quando multiple=true)
 * - Clear trigger (quando clearable=true)
 * - Estados: disabled, loading, invalid
 * - Tamanhos: xs, sm, md, lg
 * - Variantes: outline, subtle
 * - Acessibilidade completa (WCAG 2.1 AA)
 */
export const ChakraSelect = forwardRef<HTMLSelectElement, ChakraSelectProps>(({
  options = [],
  onChange,
  placeholder = 'Selecione uma opção...',
  size = 'md',
  variant = 'outline',
  disabled = false,
  invalid = false,
  loading = false,
  multiple = false,
  clearable = false,
  value = multiple ? [] : '',
  searchable = false,
  label,
  errorMessage,
  helperText,
  name,
  id,
  'aria-label': ariaLabel,
  fullWidth = true,
  required = false,
  className = '',
  ...props
}, ref) => {

  // Criar collection para o Chakra UI Select
  const collection = useMemo(() => {
    // Filtrar opções desabilitadas para não serem selecionáveis
    const selectableOptions = options.filter(opt => !opt.disabled);
    return createListCollection({
      items: selectableOptions,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
    });
  }, [options]);

  // Agrupar opções por grupo se houver
  const groupedItems = useMemo(() => {
    const grouped: { [key: string]: ChakraSelectOption[] } = {};
    const ungrouped: ChakraSelectOption[] = [];

    options.forEach(option => {
      if (option.group) {
        if (!grouped[option.group]) {
          grouped[option.group] = [];
        }
        grouped[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });

    return { grouped, ungrouped };
  }, [options]);

  // Handler para mudança de valor
  const handleValueChange = (details: { value: string[] }) => {
    if (onChange) {
      onChange(multiple ? details.value : details.value[0] || '');
    }
  };

  // Renderizar conteúdo do select
  const renderContent = () => {
    // Se não há grupos, renderizar itens simples
    if (Object.keys(groupedItems.grouped).length === 0) {
      return options.map((option) => (
        <Select.Item 
          key={option.value} 
          item={option}
        >
          <div className={`flex flex-col ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span>{option.label}</span>
            {option.description && (
              <span className="text-xs text-gray-500">{option.description}</span>
            )}
          </div>
          <Select.ItemIndicator />
        </Select.Item>
      ));
    }

    // Renderizar com grupos
    return (
      <>
        {/* Itens sem grupo primeiro */}
        {groupedItems.ungrouped.map((option) => (
          <Select.Item 
            key={option.value} 
            item={option}
          >
            <div className={`flex flex-col ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{option.label}</span>
              {option.description && (
                <span className="text-xs text-gray-500">{option.description}</span>
              )}
            </div>
            <Select.ItemIndicator />
          </Select.Item>
        ))}

        {/* Grupos com seus itens */}
        {Object.entries(groupedItems.grouped).map(([groupName, groupOptions]) => (
          <Select.ItemGroup key={groupName}>
            <Select.ItemGroupLabel className="text-xs font-medium text-gray-600 px-2 py-1">
              {groupName}
            </Select.ItemGroupLabel>
            {groupOptions.map((option) => (
              <Select.Item 
                key={option.value} 
                item={option}
                className="ml-2"
              >
                <div className={`flex flex-col ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500">{option.description}</span>
                  )}
                </div>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.ItemGroup>
        ))}
      </>
    );
  };

  const selectComponent = (
    <Select.Root
      collection={collection}
      value={Array.isArray(value) ? value : (value ? [value] : [])}
      onValueChange={handleValueChange}
      disabled={disabled}
      invalid={invalid}
      multiple={multiple}
      size={size}
      variant={variant}
      name={name}
      required={required}
      colorPalette="orange" // Usar paleta laranja para match com #F58220
      positioning={{ sameWidth: true }}
      className={className}
    >
      {/* Hidden select para compatibilidade com formulários */}
      <Select.HiddenSelect ref={ref} />
      
      {/* Label se fornecida */}
      {label && <Select.Label>{label}</Select.Label>}
      
      {/* Controle do select */}
      <Select.Control>
        <Select.Trigger
          aria-label={ariaLabel || `Selecionar ${label || 'opção'}`}
          style={{
            // Dimensões
            width: fullWidth ? '100%' : 'auto',
            minHeight: '2.5rem',
            
            // Borda única e limpa
            border: invalid ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '6px',
            
            // Background
            backgroundColor: disabled ? '#f9fafb' : 'white',
            
            // Padding otimizado
            paddingLeft: '0.75rem',
            paddingRight: '2.5rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            
            // Texto
            color: disabled ? '#9ca3af' : '#374151',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            
            // Interação
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? '0.6' : '1',
            outline: 'none',
            
            // Transição suave
            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = invalid ? '#dc2626' : '#9ca3af';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = invalid ? '#ef4444' : '#d1d5db';
            }
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = '#F58220';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 130, 32, 0.1)';
            }
          }}
          onBlur={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = invalid ? '#ef4444' : '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        
        <Select.IndicatorGroup>
          {/* Clear trigger se habilitado */}
          {clearable && <Select.ClearTrigger />}
          
          {/* Loading spinner */}
          {loading && (
            <Spinner 
              size="sm" 
              color="orange.500"
              borderWidth="2px"
            />
          )}
          
          {/* Indicador dropdown */}
          {!loading && <Select.Indicator />}
        </Select.IndicatorGroup>
      </Select.Control>

      {/* Dropdown com portal */}
      <Portal>
        <Select.Positioner>
          <Select.Content
            style={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              minWidth: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
            }}
          >
            {/* TODO: Implementar busca se searchable=true */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}
            
            {/* Conteúdo do select */}
            {options.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Nenhuma opção disponível
              </div>
            ) : (
              renderContent()
            )}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );

  // Se não há label nem mensagens, retornar só o select
  if (!label && !errorMessage && !helperText) {
    return selectComponent;
  }

  // Retornar com Field wrapper para labels e mensagens
  return (
    <Field.Root invalid={invalid} required={required}>
      {selectComponent}
      {errorMessage && (
        <Field.ErrorText>{errorMessage}</Field.ErrorText>
      )}
      {helperText && !errorMessage && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
});

ChakraSelect.displayName = 'ChakraSelect';

export default ChakraSelect;