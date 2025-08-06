'use client';

import { useState, useRef } from 'react';
import AccessibleMetricCard from './AccessibleMetricCard';
import AccessibleNavigation from './AccessibleNavigation';
import AccessibleChartContainer from './AccessibleChartContainer';
import AccessibleModal from './AccessibleModals';
import { useAccessibleFocus, useScreenReaderAnnouncement } from './hooks/useAccessibleFocus';
import AnnouncementRegion from './AnnouncementRegion';

interface AccessibilityShowcaseProps {
  className?: string;
  description?: string;
}

// Mock data for demonstrations
const mockMetrics = [
  {
    title: 'Total de Usuários',
    value: 1247,
    previousValue: 1156,
    icon: 'users',
    trend: 'up' as const,
    subtitle: 'Usuários ativos',
    description: 'Crescimento de 8% em relação ao mês anterior',
    colorPalette: 'orange' as const
  },
  {
    title: 'Receita Mensal',
    value: 45600,
    previousValue: 42300,
    icon: 'trending-up',
    trend: 'up' as const,
    prefix: 'R$ ',
    description: 'Aumento consistente nas vendas',
    colorPalette: 'green' as const
  },
  {
    title: 'Taxa de Conversão',
    value: 3.2,
    previousValue: 3.8,
    icon: 'target',
    trend: 'down' as const,
    suffix: '%',
    description: 'Necessita atenção para otimização',
    colorPalette: 'red' as const
  },
  {
    title: 'Satisfação do Cliente',
    value: 4.7,
    previousValue: 4.6,
    icon: 'star',
    trend: 'up' as const,
    suffix: '/5',
    description: 'Excelente avaliação dos usuários',
    colorPalette: 'blue' as const
  }
];

const mockChartData = [
  { label: 'Janeiro', value: 1200, description: 'Início do ano forte' },
  { label: 'Fevereiro', value: 1400, description: 'Crescimento sustentado' },
  { label: 'Março', value: 1100, description: 'Leve declínio sazonal' },
  { label: 'Abril', value: 1600, description: 'Recuperação expressiva' },
  { label: 'Maio', value: 1800, description: 'Melhor mês do período' },
  { label: 'Junho', value: 1550, description: 'Estabilização no alto patamar' }
];

const mockTabs = [
  { label: 'Visão Geral', value: 'overview', count: 4, icon: 'grid' },
  { label: 'Métricas', value: 'metrics', count: 12, icon: 'bar-chart' },
  { label: 'Relatórios', value: 'reports', count: 8, icon: 'document' },
  { label: 'Configurações', value: 'settings', icon: 'settings' }
];

const mockFilters = [
  {
    label: 'Período',
    options: [
      { label: 'Último mês', value: '1m', count: 30 },
      { label: 'Últimos 3 meses', value: '3m', count: 90 },
      { label: 'Último ano', value: '1y', count: 365 }
    ]
  },
  {
    label: 'Categoria',
    options: [
      { label: 'Vendas', value: 'sales', icon: 'trending-up', count: 156 },
      { label: 'Marketing', value: 'marketing', icon: 'megaphone', count: 89 },
      { label: 'Suporte', value: 'support', icon: 'help-circle', count: 42 }
    ],
    multiple: true,
    searchable: true
  }
];

export default function AccessibilityShowcase({ className = '' }: AccessibilityShowcaseProps) {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [searchValue, setSearchValue] = useState('');
  const [activeViewMode, setActiveViewMode] = useState('grid');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  // Accessibility hooks
  const { containerRef } = useAccessibleFocus({
    rovingTabindex: true,
    arrowKeyNavigation: true,
    homeEndNavigation: true
  });
  const divContainerRef = containerRef as React.RefObject<HTMLDivElement>;

  const { announce, announcementRef } = useScreenReaderAnnouncement();

  // Mock chart component
  const MockChart = () => (
    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
        <p className="text-blue-800 font-medium">Gráfico Interativo</p>
        <p className="text-blue-600 text-sm">Dados de exemplo para demonstração</p>
      </div>
    </div>
  );

  // Handlers
  const handleMetricClick = (index: number) => {
    setSelectedMetric(index);
    announce(`Métrica ${mockMetrics[index].title} selecionada`, 'polite');
  };

  const handleExport = (format: string) => {
    setShowExportModal(false);
    setShowProgressModal(true);
    
    // Simulate export progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setExportProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowProgressModal(false);
          setExportProgress(0);
          announce(`Exportação em formato ${format} concluída com sucesso`, 'polite');
        }, 500);
      }
    }, 200);
  };

  const handleRefresh = () => {
    announce('Dados atualizados com sucesso', 'polite');
  };

  return (
    <div 
      ref={divContainerRef}
      className={`space-y-8 p-6 bg-gray-50/30 rounded-2xl border border-gray-200 ${className}`}
      role="region"
      aria-label="Demonstração de componentes acessíveis"
    >
      {/* Screen Reader Announcements */}
      <AnnouncementRegion ref={announcementRef} />

      {/* Skip Link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-orange-600 text-white px-4 py-2 rounded-lg z-50 
                   focus:outline-none focus:ring-2 focus:ring-orange-200"
      >
        Pular para conteúdo principal
      </a>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          WCAG 2.1 AA - HeadlessUI Integration
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Demonstração completa de componentes acessíveis com navegação por teclado, 
          suporte a leitores de tela e conformidade WCAG 2.1 AA.
        </p>
        
        {/* Accessibility Features Badge */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex items-center space-x-6 bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">WCAG 2.1 AA</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Navegação por Teclado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Screen Reader</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Navigation */}
      <section aria-labelledby="navigation-heading">
        <h2 id="navigation-heading" className="text-xl font-semibold text-gray-900 mb-4">
          Navegação Acessível (HeadlessUI Tab + Menu + Combobox)
        </h2>
        <AccessibleNavigation
          tabs={mockTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filters={mockFilters}
          searchEnabled={true}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          viewModes={[
            { label: 'Grade', value: 'grid', icon: 'grid' },
            { label: 'Lista', value: 'list', icon: 'list' }
          ]}
          activeViewMode={activeViewMode}
          onViewModeChange={setActiveViewMode}
          onRefresh={handleRefresh}
          onExport={() => setShowExportModal(true)}
          brandColor="orange"
          ariaLabel="Controles principais do dashboard"
          skipLinkTarget="#main-content"
        />
      </section>

      {/* Main Content Area */}
      <main id="main-content">
        
        {/* Accessible Metric Cards */}
        <section aria-labelledby="metrics-heading" className="mb-8">
          <h2 id="metrics-heading" className="text-xl font-semibold text-gray-900 mb-6">
            Cartões de Métricas Acessíveis (HeadlessUI Disclosure + Focus Management)
          </h2>
          
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            role="group"
            aria-label="Métricas principais do dashboard"
          >
            {mockMetrics.map((metric, index) => (
              <AccessibleMetricCard
                key={index}
                {...metric}
                expandable={true}
                onActivate={() => handleMetricClick(index)}
                expandedContent={
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Detalhes Adicionais:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Dados atualizados em tempo real</li>
                        <li>• Comparação com período anterior</li>
                        <li>• Tendência baseada em algoritmos preditivos</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 
                                 transition-colors duration-200 focus:outline-none focus:ring-2 
                                 focus:ring-orange-200 focus:ring-opacity-50"
                    >
                      Ver Relatório Detalhado
                    </button>
                  </div>
                }
                liveRegion={true}
                ariaLabel={`Métrica ${metric.title} com valor ${metric.value}${metric.suffix || ''} e tendência ${metric.trend}`}
                alternativeText={`Esta métrica mostra ${metric.description}`}
              />
            ))}
          </div>
        </section>

        {/* Accessible Chart Container */}
        <section aria-labelledby="charts-heading">
          <h2 id="charts-heading" className="text-xl font-semibold text-gray-900 mb-6">
            Container de Gráfico Acessível (HeadlessUI Dialog + Data Tables)
          </h2>
          
          <AccessibleChartContainer
            title="Vendas Mensais"
            subtitle="Evolução das vendas nos últimos 6 meses"
            chartType="line"
            chartData={mockChartData}
            collapsible={true}
            showDataTable={true}
            onExport={() => setShowExportModal(true)}
            onRefresh={handleRefresh}
            brandColor="orange"
            ariaLabel="Gráfico de linha mostrando a evolução das vendas mensais"
            ariaDescription="Gráfico interativo com dados dos últimos 6 meses, mostrando crescimento geral com pico em maio"
            alternativeDescription="As vendas iniciaram em R$ 1.200 em janeiro, cresceram para R$ 1.800 em maio (pico), e estabilizaram em R$ 1.550 em junho"
            exportFormats={[
              { label: 'PNG (Imagem)', value: 'png', icon: 'image' },
              { label: 'CSV (Dados)', value: 'csv', icon: 'table' },
              { label: 'PDF (Relatório)', value: 'pdf', icon: 'document' }
            ]}
          >
            <MockChart />
          </AccessibleChartContainer>
        </section>
      </main>

      {/* Keyboard Navigation Instructions */}
      <section aria-labelledby="instructions-heading" className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 id="instructions-heading" className="text-lg font-semibold text-gray-900 mb-4">
          Instruções de Navegação por Teclado
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Navegação Geral</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Tab</kbd> - Próximo elemento</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Shift+Tab</kbd> - Elemento anterior</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Enter/Space</kbd> - Ativar elemento</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Esc</kbd> - Fechar modais</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Abas e Menus</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">←→</kbd> - Navegar entre abas</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">↑↓</kbd> - Navegar em menus</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Home/End</kbd> - Primeira/última opção</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Digite</kbd> - Busca em combobox</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Cartões e Gráficos</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Enter</kbd> - Expandir/colapsar</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Space</kbd> - Ativar ação</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">T</kbd> - Visualizar tabela de dados</li>
              <li><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">E</kbd> - Exportar dados</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Accessible Modals */}
      <AccessibleModal
        type="confirmation"
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Ação"
        description="Deseja realmente visualizar o relatório detalhado desta métrica?"
        variant="info"
        onConfirm={() => {
          setShowConfirmModal(false);
          announce('Relatório detalhado será carregado', 'polite');
        }}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Ver Relatório"
        cancelText="Cancelar"
        size="md"
      >
        <div className="text-gray-700 space-y-3">
          <p>O relatório detalhado incluirá:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Análise temporal completa</li>
            <li>Comparações com períodos anteriores</li>
            <li>Projeções e tendências</li>
            <li>Dados segmentados por categoria</li>
          </ul>
        </div>
      </AccessibleModal>

      <AccessibleModal
        type="export"
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exportar Dados"
        description="Escolha o formato de exportação desejado para os dados do dashboard."
        variant="default"
        onExport={handleExport}
        exportFormats={[
          { 
            label: 'PNG (Imagem)', 
            value: 'png', 
            icon: 'image'
          },
          { 
            label: 'CSV (Planilha)', 
            value: 'csv', 
            icon: 'table'
          },
          { 
            label: 'PDF (Relatório)', 
            value: 'pdf', 
            icon: 'document'
          },
          { 
            label: 'JSON (API)', 
            value: 'json', 
            icon: 'code'
          }
        ]}
        size="md"
      />

      <AccessibleModal
        type="progress"
        isOpen={showProgressModal}
        onClose={() => {}}
        title="Exportando Dados"
        description="Aguarde enquanto preparamos seus dados para download."
        variant="info"
        progress={exportProgress}
        progressLabel="Processando exportação..."
        canCancel={true}
        onCancel={() => {
          setShowProgressModal(false);
          setExportProgress(0);
          announce('Exportação cancelada', 'polite');
        }}
        preventClose={exportProgress < 100}
        size="md"
      />
    </div>
  );
}