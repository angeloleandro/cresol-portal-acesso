// Componentes padronizados para páginas administrativas
// Baseados no design system da página /admin/users

export { default as StandardizedAdminLayout } from './StandardizedAdminLayout';
export { default as StandardizedPageHeader } from './StandardizedPageHeader';
export { default as StandardizedButton } from './StandardizedButton';
export { default as StandardizedCard } from './StandardizedCard';
export { default as StandardizedFilters } from './StandardizedFilters';
export { default as StandardizedEmptyState } from './StandardizedEmptyState';
export { default as StandardizedTabs } from './StandardizedTabs';

// Novos componentes padronizados (Chakra UI v3)
export { StandardizedChakraTabs, StandardizedTabsList, StandardizedTabContent } from './StandardizedChakraTabs';
export { StandardizedMetricsCard, StandardizedMetricsGrid } from './StandardizedMetricsCard';

// Hooks e utilitários comuns
export * from './types';
export * from './constants';