'use client';

import React from 'react';
import { Tabs } from "@chakra-ui/react";

/**
 * STANDARDIZED CHAKRA UI V3 TABS COMPONENT
 * 
 * Implementação correta do Chakra UI v3 Tabs seguindo a documentação oficial.
 * Garante visual consistente com separação adequada entre abas.
 * 
 * Features:
 * - Sintaxe correta do Chakra UI v3 com Tabs.Root wrapper
 * - Visual limpo com separação clara entre abas
 * - Focado na funcionalidade essencial 
 * - TypeScript completo
 * - Responsivo e acessível (WCAG 2.1 AA)
 * - Variants e sizing support
 */

interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface StandardizedChakraTabsProps {
  /** Array de tabs para renderizar */
  tabs: TabItem[];
  /** Classes CSS adicionais */
  className?: string;
  /** Variante visual das tabs */
  variant?: 'line' | 'subtle' | 'enclosed' | 'outline' | 'plain';
  /** Tamanho das tabs */
  size?: 'sm' | 'md' | 'lg';
  /** Palette de cores */
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink';
  /** Tab ativa (controlled) */
  value?: string;
  /** Callback quando tab muda */
  onValueChange?: (details: { value: string }) => void;
  /** Props adicionais para a lista de tabs (Tabs.List) */
  listProps?: React.ComponentProps<typeof Tabs.List>;
}

/**
 * Componente completo de Tabs do Chakra UI v3
 * Inclui Root, List e Triggers em um único componente
 */
export const StandardizedChakraTabs: React.FC<StandardizedChakraTabsProps> = ({
  tabs,
  className = '',
  variant = 'plain',
  size = 'md',
  colorPalette = 'gray',
  value,
  onValueChange,
  listProps
}) => {
  return (
    <Tabs.Root
      value={value}
      onValueChange={onValueChange}
      variant={variant}
      size={size}
      colorPalette={colorPalette}
      className={className}
    >
  <Tabs.List bg={listProps?.bg ?? 'bg.muted'} rounded={listProps?.rounded ?? 'l3'} p={listProps?.p ?? '2'} {...listProps}>
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
    px={3}
    py={2}
    whiteSpace="nowrap"
          >
            {/* Ícone opcional antes do label, caso fornecido */}
            {tab.icon ? (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            ) : (
              tab.label
            )}
          </Tabs.Trigger>
        ))}
        {/* Indicador visual conforme padrão do Chakra v3 Tabs */}
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
    </Tabs.Root>
  );
};

/**
 * Componente separado apenas para a lista de tabs (para casos especiais)
 * Use quando já tiver um Tabs.Root externo
 */
export const StandardizedTabsList: React.FC<{
  tabs: TabItem[];
  className?: string;
  listProps?: React.ComponentProps<typeof Tabs.List>;
}> = ({ tabs, className = '', listProps }) => {
  return (
  <Tabs.List bg={listProps?.bg ?? 'bg.muted'} rounded={listProps?.rounded ?? 'l3'} p={listProps?.p ?? '2'} className={className} {...listProps}>
      {tabs.map((tab) => (
        <Tabs.Trigger
          key={tab.value}
          value={tab.value}
          disabled={tab.disabled}
      px={3}
      py={2}
      whiteSpace="nowrap"
        >
          {tab.icon ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          ) : (
            tab.label
          )}
        </Tabs.Trigger>
      ))}
      <Tabs.Indicator rounded="l2" />
    </Tabs.List>
  );
};

/**
 * Componente de conteúdo de tabs - use dentro do Tabs.Root
 * 
 * @example
 * <Tabs.Root defaultValue="tab1">
 *   <StandardizedChakraTabs tabs={tabs} />
 *   <StandardizedTabContent value="tab1">Conteúdo 1</StandardizedTabContent>
 *   <StandardizedTabContent value="tab2">Conteúdo 2</StandardizedTabContent>
 * </Tabs.Root>
 */
export const StandardizedTabContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className = '' }) => (
  <Tabs.Content value={value} className={`mt-4 ${className}`}>
    {children}
  </Tabs.Content>
);

export default StandardizedChakraTabs;