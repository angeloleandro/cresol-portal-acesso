import React, { useCallback, useMemo } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from '@nextui-org/react';
import { Icon } from '@/app/components/icons/Icon';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  helpText,
  size = 'md',
  className = '',
}) => {
  // Get selected option label
  const selectedOption = useMemo(() =>
    options.find(option => option.value === value),
    [options, value]
  );
  
  // Handle option selection
  const handleOptionSelect = useCallback((selectedValue: string) => {
    onChange(selectedValue);
  }, [onChange]);
  
  // Size mapping for HeroUI Button
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'md';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* HeroUI Dropdown following navbar pattern */}
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <Button
            variant="bordered"
            size={getButtonSize()}
            className={`
              w-full justify-between font-normal
              ${error ? 'border-red-300 hover:border-red-500' : 'border-gray-300 hover:border-primary focus:border-primary'}
              ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}
            `}
            endContent={
              <Icon name="chevron-down" className="h-4 w-4 text-gray-400" />
            }
          >
            <span className="truncate text-left">
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.icon}
                  {selectedOption.label}
                </span>
              ) : (
                placeholder || 'Selecione uma opção'
              )}
            </span>
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu
          aria-label={label || 'Selecionar opção'}
          className="min-w-[200px] max-h-[300px] overflow-y-auto scrollbar-branded"
          selectedKeys={value ? [value] : []}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            if (selected) handleOptionSelect(selected);
          }}
          itemClasses={{
            base: [
              "rounded-md",
              "text-default-700",
              "transition-colors",
              "data-[hover=true]:bg-primary",
              "data-[hover=true]:text-white",
              "data-[selectable=true]:focus:bg-primary",
              "data-[selectable=true]:focus:text-white",
            ]
          }}
        >
          {options.map((option) => (
            <DropdownItem key={option.value} textValue={option.label}>
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <Icon name="alert-circle" className="w-3 h-3" />
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};