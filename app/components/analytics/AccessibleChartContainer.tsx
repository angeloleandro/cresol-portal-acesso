'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import { Fragment } from 'react';
import { Icon } from '@/app/components/icons/Icon';

interface ChartDataPoint {
  label: string;
  value: number;
  description?: string;
}

interface AccessibleChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Chart data for accessibility table */
  chartData?: ChartDataPoint[];
  /** Chart type for screen reader description */
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'mixed';
  /** Additional actions */
  actions?: ReactNode;
  /** Professional size variants */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Enhanced variant system */
  variant?: 'default' | 'minimal' | 'elevated' | 'bordered' | 'glass';
  /** Loading state */
  isLoading?: boolean;
  /** Collapsible functionality */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Export functionality */
  onExport?: () => void;
  /** Refresh functionality */
  onRefresh?: () => void;
  /** Cresol brand integration */
  brandColor?: 'orange' | 'green' | 'blue' | 'purple' | 'gray';
  /** WCAG 2.1 AA Accessibility Props */
  ariaLabel?: string;
  ariaDescription?: string;
  /** Alternative text description for chart */
  alternativeDescription?: string;
  /** Enable data table view */
  showDataTable?: boolean;
  /** Export formats available */
  exportFormats?: Array<{ label: string; value: string; icon?: string }>;
  /** Live region for updates */
  liveRegion?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    padding: 'p-4',
    headerPadding: 'px-4 py-3',
    title: 'text-lg',
    subtitle: 'text-sm',
    minHeight: 'min-h-[300px]',
    iconSize: 'h-4 w-4',
    buttonSize: 'h-8 w-8 min-h-[32px] min-w-[32px]',
    focusRing: 'focus:ring-1 focus:ring-offset-1',
  },
  md: {
    padding: 'p-6',
    headerPadding: 'px-6 py-4',
    title: 'text-xl',
    subtitle: 'text-base',
    minHeight: 'min-h-[400px]',
    iconSize: 'h-5 w-5',
    buttonSize: 'h-9 w-9 min-h-[44px] min-w-[44px]',
    focusRing: 'focus:ring-2 focus:ring-offset-2',
  },
  lg: {
    padding: 'p-8',
    headerPadding: 'px-8 py-6',
    title: 'text-2xl',
    subtitle: 'text-lg',
    minHeight: 'min-h-[500px]',
    iconSize: 'h-6 w-6',
    buttonSize: 'h-10 w-10 min-h-[48px] min-w-[48px]',
    focusRing: 'focus:ring-2 focus:ring-offset-2',
  },
  xl: {
    padding: 'p-10',
    headerPadding: 'px-10 py-8',
    title: 'text-3xl',
    subtitle: 'text-xl',
    minHeight: 'min-h-[600px]',
    iconSize: 'h-8 w-8',
    buttonSize: 'h-12 w-12 min-h-[48px] min-w-[48px]',
    focusRing: 'focus:ring-2 focus:ring-offset-3',
  }
};

export default function AccessibleChartContainer({
  title,
  subtitle,
  children,
  chartData = [],
  chartType = 'bar',
  actions,
  size = 'md',
  variant = 'default',
  isLoading = false,
  collapsible = false,
  defaultCollapsed = false,
  onExport,
  onRefresh,
  brandColor = 'orange',
  ariaLabel,
  ariaDescription,
  alternativeDescription,
  showDataTable = true,
  exportFormats = [
    { label: 'PNG', value: 'png', icon: 'download' },
    { label: 'CSV', value: 'csv', icon: 'table' },
    { label: 'PDF', value: 'pdf', icon: 'document' }
  ],
  liveRegion = true,
  className = ''
}: AccessibleChartContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDataTableModal, setShowDataTableModal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const chartRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  const sizeStyles = sizeConfig[size];

  useEffect(() => {
    if (!isLoading && liveRegion) {
      setLastUpdate(`Gráfico ${title} atualizado em ${new Date().toLocaleTimeString('pt-BR')}`);
    }
  }, [isLoading, title, liveRegion]);

  // Enhanced variant styles with Cresol brand integration
  const getVariantStyles = () => {
    const brandColors = {
      orange: {
        primary: 'border-orange-200',
        focus: 'focus:ring-orange-200',
        accent: 'text-orange-600',
        gradient: 'from-orange-400 to-orange-600'
      },
      green: {
        primary: 'border-emerald-200',
        focus: 'focus:ring-emerald-200',
        accent: 'text-emerald-600',
        gradient: 'from-emerald-400 to-emerald-600'
      },
      blue: {
        primary: 'border-blue-200',
        focus: 'focus:ring-blue-200',
        accent: 'text-blue-600',
        gradient: 'from-blue-400 to-blue-600'
      },
      purple: {
        primary: 'border-purple-200',
        focus: 'focus:ring-purple-200',
        accent: 'text-purple-600',
        gradient: 'from-purple-400 to-purple-600'
      },
      gray: {
        primary: 'border-gray-200',
        focus: 'focus:ring-gray-200',
        accent: 'text-gray-600',
        gradient: 'from-gray-400 to-gray-600'
      }
    };

    const colors = brandColors[brandColor];

    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent border-0',
          colors
        };
      case 'elevated':
        return {
          container: `bg-white border ${colors.primary} shadow-lg rounded-2xl`,
          colors
        };
      case 'bordered':
        return {
          container: `bg-white border-2 ${colors.primary} rounded-2xl shadow-sm`,
          colors
        };
      case 'glass':
        return {
          container: 'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg',
          colors
        };
      case 'default':
      default:
        return {
          container: `bg-white border ${colors.primary} shadow-sm rounded-2xl`,
          colors
        };
    }
  };

  const styles = getVariantStyles();

  // Get chart description for screen readers
  const getChartDescription = () => {
    const baseDescription = ariaDescription || 
      `Gráfico do tipo ${chartType} mostrando ${title}. ${subtitle || ''}`.trim();
    
    if (alternativeDescription) {
      return `${baseDescription} ${alternativeDescription}`;
    }

    if (chartData.length > 0) {
      const dataDescription = chartData
        .map(point => `${point.label}: ${point.value}`)
        .join(', ');
      return `${baseDescription} Dados: ${dataDescription}`;
    }

    return baseDescription;
  };

  // Accessible toolbar button
  const ToolbarButton = ({ 
    icon, 
    onClick: onButtonClick, 
    tooltip,
    disabled = false,
    ariaLabel: buttonAriaLabel
  }: { 
    icon: string; 
    onClick?: () => void; 
    tooltip: string;
    disabled?: boolean;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onButtonClick}
      disabled={disabled}
      className={`
        ${sizeStyles.buttonSize} rounded-lg flex items-center justify-center
        bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800
        transition-all duration-200 hover:scale-105
        border border-gray-200 hover:border-gray-300
        ${sizeStyles.focusRing} ${styles.colors.focus} focus:outline-none focus:ring-opacity-50
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={tooltip}
      aria-label={buttonAriaLabel || tooltip}
    >
      <Icon 
        name={icon as any} 
        className={sizeStyles.iconSize}
        aria-hidden="true" 
      />
    </button>
  );

  // Export Modal
  const ExportModal = () => (
    <Transition appear show={showExportModal} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={setShowExportModal}
        initialFocus={undefined}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  id="export-modal-title"
                >
                  Exportar Gráfico
                </Dialog.Title>
                
                <Dialog.Description className="text-sm text-gray-600 mb-6">
                  Escolha o formato para exportar o gráfico &quot;{title}&quot;.
                </Dialog.Description>

                <div className="space-y-3">
                  {exportFormats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => {
                        onExport?.();
                        setShowExportModal(false);
                      }}
                      className="
                        w-full flex items-center space-x-3 px-4 py-3 
                        bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200
                        border border-gray-200 hover:border-gray-300
                        focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-opacity-50
                      "
                    >
                      {format.icon && (
                        <Icon 
                          name={format.icon as any} 
                          className="h-5 w-5 text-gray-600"
                          aria-hidden="true" 
                        />
                      )}
                      <span className="font-medium">Exportar como {format.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="
                      px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 
                      hover:bg-gray-200 rounded-lg transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50
                    "
                    onClick={() => setShowExportModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  // Data Table Modal
  const DataTableModal = () => (
    <Transition appear show={showDataTableModal} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={setShowDataTableModal}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Dados do Gráfico: {title}
                </Dialog.Title>

                <Dialog.Description className="text-sm text-gray-600 mb-6">
                  Visualização alternativa dos dados em formato de tabela acessível.
                </Dialog.Description>

                {chartData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table 
                      className="min-w-full divide-y divide-gray-200"
                      role="table"
                      aria-label={`Tabela de dados para ${title}`}
                    >
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Item
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Valor
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Descrição
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chartData.map((point, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {point.label}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {point.value.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {point.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhum dado disponível para exibir.</p>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="
                      px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 
                      hover:bg-gray-200 rounded-lg transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50
                    "
                    onClick={() => setShowDataTableModal(false)}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div 
        className={`${styles.container} ${sizeStyles.minHeight} overflow-hidden ${className}`}
        role="status"
        aria-label="Carregando gráfico"
      >
        <div className={`border-b border-gray-100 ${sizeStyles.headerPadding}`}>
          <div className="animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={sizeStyles.padding}>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-14"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
    );
  }

  // Collapsible with Disclosure
  if (collapsible) {
    return (
      <Disclosure 
        as="div" 
        defaultOpen={!defaultCollapsed}
        className={`${styles.container} overflow-hidden ${className}`}
      >
        {({ open }) => (
          <>
            {/* Live region for screen readers */}
            {liveRegion && (
              <div
                ref={announcementRef}
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
                role="status"
              >
                {lastUpdate}
              </div>
            )}

            <Disclosure.Button
              className={`
                w-full ${sizeStyles.headerPadding} border-b border-gray-100 
                focus:outline-none ${sizeStyles.focusRing} ${styles.colors.focus} focus:ring-opacity-50
                transition-all duration-200 hover:bg-gray-50/50
                text-left
              `}
              aria-expanded={open}
              aria-controls={`chart-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h2 className={`${sizeStyles.title} font-bold text-gray-900 leading-tight`}>
                    {title}
                  </h2>
                  {subtitle && (
                    <p className={`${sizeStyles.subtitle} text-gray-600 mt-1`}>
                      {subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Toolbar */}
                  <div className="flex items-center space-x-2 bg-gray-50/50 rounded-lg p-1 border border-gray-200">
                    {onRefresh && (
                      <ToolbarButton 
                        icon="refresh" 
                        onClick={onRefresh} 
                        tooltip="Atualizar dados"
                      />
                    )}
                    
                    {onExport && (
                      <ToolbarButton 
                        icon="download" 
                        onClick={() => setShowExportModal(true)} 
                        tooltip="Exportar gráfico"
                      />
                    )}

                    {showDataTable && chartData.length > 0 && (
                      <ToolbarButton 
                        icon="table" 
                        onClick={() => setShowDataTableModal(true)} 
                        tooltip="Visualizar dados em tabela"
                        ariaLabel="Visualizar dados do gráfico em formato de tabela acessível"
                      />
                    )}
                  </div>
                  
                  <Icon
                    name={open ? "chevron-up" : "chevron-down"}
                    className={`h-5 w-5 ${styles.colors.accent} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Disclosure.Button>

            <Disclosure.Panel
              id={`chart-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className={`${sizeStyles.padding} flex-1`}
            >
              <div 
                ref={chartRef}
                className="relative"
                role="img"
                aria-label={ariaLabel || `Gráfico ${chartType} - ${title}`}
                aria-describedby={`chart-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="relative bg-gradient-to-br from-gray-50/30 to-white rounded-xl border border-gray-100 overflow-hidden">
                  {children}
                </div>
              </div>

              {/* Screen reader description */}
              <div 
                id={`chart-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="sr-only"
              >
                {getChartDescription()}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    );
  }

  // Standard accessible container
  return (
    <div 
      className={`${styles.container} ${sizeStyles.minHeight} overflow-hidden ${className}`}
      role="region"
      aria-label={ariaLabel || `Gráfico: ${title}`}
      aria-describedby={`chart-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Live region for screen readers */}
      {liveRegion && (
        <div
          ref={announcementRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          {lastUpdate}
        </div>
      )}

      {/* Header */}
      <div className={`border-b border-gray-100 ${sizeStyles.headerPadding}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div>
            <h2 className={`${sizeStyles.title} font-bold text-gray-900 leading-tight`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`${sizeStyles.subtitle} text-gray-600 mt-1 leading-relaxed`}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center space-x-2 bg-gray-50/50 rounded-lg p-1 border border-gray-200">
              {onRefresh && (
                <ToolbarButton 
                  icon="refresh" 
                  onClick={onRefresh} 
                  tooltip="Atualizar dados"
                />
              )}
              
              {onExport && (
                <ToolbarButton 
                  icon="download" 
                  onClick={() => setShowExportModal(true)} 
                  tooltip="Exportar gráfico"
                />
              )}

              {showDataTable && chartData.length > 0 && (
                <ToolbarButton 
                  icon="table" 
                  onClick={() => setShowDataTableModal(true)} 
                  tooltip="Visualizar dados em tabela"
                  ariaLabel="Visualizar dados do gráfico em formato de tabela acessível"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className={`${sizeStyles.padding} flex-1`}>
        <div 
          ref={chartRef}
          className="relative"
          role="img"
          aria-label={ariaLabel || `Gráfico ${chartType} - ${title}`}
          aria-describedby={`chart-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <div className="relative bg-gradient-to-br from-gray-50/30 to-white rounded-xl border border-gray-100 overflow-hidden">
            {children}
          </div>
        </div>

        {/* Screen reader description */}
        <div 
          id={`chart-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="sr-only"
        >
          {getChartDescription()}
        </div>
      </div>

      {/* Modals */}
      <ExportModal />
      <DataTableModal />
    </div>
  );
}