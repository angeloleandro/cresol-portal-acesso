'use client';

import { Tabs } from "@chakra-ui/react";

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
              <span className="inline-flex items-center gap-1.5">
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
            <span className="inline-flex items-center gap-1.5">
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