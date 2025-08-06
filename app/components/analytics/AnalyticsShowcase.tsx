'use client';

import { useState } from 'react';
import { 
  NumberTicker, 
  MetricCardEnterprise, 
  ChartComponentAdvanced, 
  ProgressRingPro, 
  ShimmerButton 
} from './';

const sampleChartData = [
  { label: 'Jan', value: 4000, color: '#F58220' },
  { label: 'Fev', value: 3000, color: '#005C46' },
  { label: 'Mar', value: 5000, color: '#FF9A4D' },
  { label: 'Abr', value: 4500, color: '#007F57' },
  { label: 'Mai', value: 6000, color: '#E6731C' }
];

export default function AnalyticsShowcase() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshTrigger(prev => prev + 1);
    
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const generateRandomValue = () => Math.floor(Math.random() * 10000) + 1000;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Cresol Analytics Dashboard
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Demonstração dos novos componentes analytics enterprise, desenvolvidos com padrões 
          Chakra UI e MUI X Charts, integrando as cores da marca Cresol.
        </p>
        
        <div className="flex justify-center space-x-4">
          <ShimmerButton
            onClick={handleRefresh}
            loading={isLoading}
            loadingText="Atualizando..."
            colorPalette="orange"
            variant="solid"
            size="lg"
          >
            🔄 Atualizar Dashboard
          </ShimmerButton>
          
          <ShimmerButton
            colorPalette="green"
            variant="outline"
            size="lg"
            rightIcon={<span>📊</span>}
          >
            Exportar Relatório
          </ShimmerButton>
        </div>
      </div>

      {/* NumberTicker Showcase */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">NumberTicker Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Cooperados</h3>
            <NumberTicker
              key={`cooperados-${refreshTrigger}`}
              value={generateRandomValue()}
              size="xl"
              colorPalette="orange"
              formatOptions={{ style: 'decimal' }}
            />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Volume Financeiro</h3>
            <NumberTicker
              key={`volume-${refreshTrigger}`}
              value={generateRandomValue() * 1000}
              prefix="R$ "
              size="xl"
              colorPalette="green"
              formatOptions={{ style: 'currency', currency: 'BRL' }}
            />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Agências</h3>
            <NumberTicker
              key={`agencias-${refreshTrigger}`}
              value={Math.floor(Math.random() * 100) + 50}
              size="xl"
              colorPalette="blue"
            />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Crescimento</h3>
            <NumberTicker
              key={`crescimento-${refreshTrigger}`}
              value={Math.random() * 15 + 5}
              suffix="%"
              size="xl"
              colorPalette="purple"
              formatOptions={{ maximumFractionDigits: 1 }}
            />
          </div>
        </div>
      </div>

      {/* MetricCards Showcase */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Enhanced Metric Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCardEnterprise
            key={`revenue-${refreshTrigger}`}
            title="Receita Mensal"
            value={generateRandomValue() * 100}
            previousValue={generateRandomValue() * 90}
            icon="chart-bar"
            prefix="R$ "
            variant="primary"
            colorPalette="orange"
            size="lg"
            trend="up"
            subtitle="vs. mês anterior"
            enableAnimation={!isLoading}
            animationDuration={1500}
            isLoading={isLoading}
          />
          
          <MetricCardEnterprise
            key={`loans-${refreshTrigger}`}
            title="Empréstimos"
            value={generateRandomValue() * 10}
            previousValue={generateRandomValue() * 8}
            icon="bank"
            variant="secondary"
            colorPalette="green"
            size="lg"
            trend="up"
            subtitle="operações ativas"
            enableAnimation={!isLoading}
            animationDuration={1200}
            isLoading={isLoading}
          />
          
          <MetricCardEnterprise
            key={`deposits-${refreshTrigger}`}
            title="Depósitos"
            value={generateRandomValue() * 50}
            previousValue={generateRandomValue() * 55}
            icon="piggy-bank"
            prefix="R$ "
            variant="info"
            colorPalette="blue"
            size="lg"
            trend="down"
            subtitle="valor total"
            enableAnimation={!isLoading}
            animationDuration={1800}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ProgressRings Showcase */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Progress Ring Pro</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Meta Anual</h4>
            <ProgressRingPro
              key={`annual-${refreshTrigger}`}
              value={Math.random() * 100}
              size="lg"
              colorPalette="orange"
              showValueText={true}
              thickness="medium"
            />
          </div>
          
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Satisfação</h4>
            <ProgressRingPro
              key={`satisfaction-${refreshTrigger}`}
              value={Math.random() * 100}
              size="lg"
              colorPalette="green"
              showValueText={true}
              thickness="thick"
              roundedCaps={true}
            />
          </div>
          
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Eficiência</h4>
            <ProgressRingPro
              key={`efficiency-${refreshTrigger}`}
              value={Math.random() * 100}
              size="lg"
              colorPalette="blue"
              showValueText={true}
              thickness="medium"
            />
          </div>
          
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Qualidade</h4>
            <ProgressRingPro
              key={`quality-${refreshTrigger}`}
              value={Math.random() * 100}
              size="lg"
              colorPalette="purple"
              showValueText={true}
              thickness="medium"
            />
          </div>
          
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Carregando</h4>
            <ProgressRingPro
              value={0}
              size="lg"
              colorPalette="gray"
              isIndeterminate={true}
              showValueText={true}
              thickness="medium"
            />
          </div>
          
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Custom</h4>
            <ProgressRingPro
              key={`custom-${refreshTrigger}`}
              value={Math.random() * 100}
              customSize={100}
              gradientColors={['#F58220', '#005C46']}
              showValueText={true}
              customThickness={8}
              valueText={<div className="text-xs font-bold">TOP</div>}
            />
          </div>
        </div>
      </div>

      {/* Charts Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponentAdvanced
          data={sampleChartData}
          title="Vendas por Mês"
          type="bar"
          height={300}
          colorPalette="cresol"
          enableExport={true}
          showGrid={true}
          showTooltip={true}
          enableAnimation={true}
          isLoading={isLoading}
        />
        
        <ChartComponentAdvanced
          data={sampleChartData}
          title="Evolução Mensal"
          type="line"
          height={300}
          colorPalette="cresol"
          enableExport={true}
          showGrid={true}
          showTooltip={true}
          enableAnimation={true}
          isLoading={isLoading}
        />
      </div>

      <ChartComponentAdvanced
        data={sampleChartData}
        title="Área de Performance"
        type="area"
        height={350}
        colorPalette="cresol"
        enableExport={true}
        showGrid={true}
        showTooltip={true}
        enableAnimation={true}
        isLoading={isLoading}
      />

      {/* Button Showcase */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Shimmer Buttons</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Tamanhos</h3>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton size="xs" colorPalette="orange">Extra Small</ShimmerButton>
              <ShimmerButton size="sm" colorPalette="orange">Small</ShimmerButton>
              <ShimmerButton size="md" colorPalette="orange">Medium</ShimmerButton>
              <ShimmerButton size="lg" colorPalette="orange">Large</ShimmerButton>
              <ShimmerButton size="xl" colorPalette="orange">Extra Large</ShimmerButton>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Variantes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton variant="solid" colorPalette="orange">Solid</ShimmerButton>
              <ShimmerButton variant="outline" colorPalette="orange">Outline</ShimmerButton>
              <ShimmerButton variant="ghost" colorPalette="orange">Ghost</ShimmerButton>
              <ShimmerButton variant="subtle" colorPalette="orange">Subtle</ShimmerButton>
              <ShimmerButton variant="surface" colorPalette="orange">Surface</ShimmerButton>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Cores</h3>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton colorPalette="orange">Orange</ShimmerButton>
              <ShimmerButton colorPalette="green">Green</ShimmerButton>
              <ShimmerButton colorPalette="blue">Blue</ShimmerButton>
              <ShimmerButton colorPalette="gray">Gray</ShimmerButton>
              <ShimmerButton colorPalette="red">Red</ShimmerButton>
              <ShimmerButton colorPalette="purple">Purple</ShimmerButton>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Com Ícones</h3>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton 
                leftIcon={<span>⬇️</span>}
                colorPalette="green"
              >
                Download
              </ShimmerButton>
              <ShimmerButton 
                rightIcon={<span>➡️</span>}
                colorPalette="blue"
                variant="outline"
              >
                Próximo
              </ShimmerButton>
              <ShimmerButton 
                leftIcon={<span>💾</span>}
                rightIcon={<span>✓</span>}
                colorPalette="purple"
                variant="subtle"
              >
                Salvar
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Especificações Técnicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-orange-600 mb-2">Chakra UI Integration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Sistema de tamanhos padronizado (xs, sm, md, lg, xl)</li>
              <li>✅ Color palette com semantic tokens</li>
              <li>✅ Design system consistency</li>
              <li>✅ Accessibility WCAG 2.1 AA compliant</li>
              <li>✅ Theme-aware components</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-green-600 mb-2">MUI X Charts Integration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Advanced charting capabilities</li>
              <li>✅ Export functionality (PNG, SVG, PDF)</li>
              <li>✅ Interactive tooltips e hover states</li>
              <li>✅ Responsive design</li>
              <li>✅ Performance optimizado (60fps)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">Cores da Marca Cresol</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-700">#F58220 (Laranja Principal)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-700">#005C46 (Verde Secundário)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}