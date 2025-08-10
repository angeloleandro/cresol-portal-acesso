'use client';

import { useMemo, useState } from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ChartComponentAdvancedProps {
  data: ChartData[];
  title: string;
  type?: 'bar' | 'line' | 'area';
  height?: number;
  /** Enable/disable animations */
  enableAnimation?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Responsive design */
  responsive?: boolean;
  /** Color palette based on Cresol brand */
  colorPalette?: 'cresol' | 'blue' | 'green' | 'purple';
  /** Chart margin */
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Custom formatting for values */
  valueFormatter?: (value: number) => string;
  /** Export functionality */
  enableExport?: boolean;
  /** Loading state */
  isLoading?: boolean;
  className?: string;
}

// Cresol brand color palettes following MUI X Charts patterns
const colorPalettes = {
  cresol: ['#F58220', '#005C46', '#FF9A4D', '#007F57', '#E6731C', '#004A38'],
  blue: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a'],
  green: ['#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5'],
  purple: ['#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d3']
};

// Format number following Portuguese BR standards
const defaultFormatter = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function ChartComponentAdvanced({
  data,
  title,
  type = 'bar',
  height = 300,
  enableAnimation = true,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  responsive = true,
  colorPalette = 'cresol',
  margin = { top: 20, right: 30, bottom: 50, left: 60 },
  valueFormatter = defaultFormatter,
  enableExport = false,
  isLoading = false,
  className = ''
}: ChartComponentAdvancedProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const colors = colorPalettes[colorPalette];
  
  // Process data with colors from selected palette
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));
  }, [data, colors]);

  const maxValue = Math.max(...data.map(d => d.value));

  // Export functionality
  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    // Chart export functionality - removed console.log for production
    // In a real implementation, this would use MUI X Charts export functionality
    alert(`Funcionalidade de exportação para ${format.toUpperCase()} seria implementada aqui`);
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-sm w-1/3 mb-4"></div>
          <div className={`bg-gray-100 rounded-lg`} style={{ height: height }}>
            <div className="flex items-end justify-center h-full space-x-2 p-4">
              {Array.from({ length: data.length || 5 }).map((_, i) => (
                <div 
                  key={i}
                  className="bg-gray-300 rounded-t animate-pulse"
                  style={{
                    width: '40px',
                    height: `${Math.random() * 80 + 20}%`,
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderBarChart = () => (
    <div className="space-y-4">
      {/* Chart Area */}
      <div 
        className="relative bg-gray-50 rounded-lg overflow-hidden"
        style={{ height: `${height}px` }}
      >
        {/* Grid Lines */}
        {showGrid && (
          <div className="absolute inset-0">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => (
              <div
                key={index}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${ratio * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-center p-4">
          <div className="flex items-end space-x-2 h-full">
            {processedData.map((item, index) => (
              <div
                key={item.label}
                className="flex flex-col items-center space-y-2"
                onMouseEnter={() => showTooltip && setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {/* Tooltip */}
                {showTooltip && activeIndex === index && (
                  <div className="absolute z-10 -mt-12 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                    {item.label}: {valueFormatter(item.value)}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`
                    relative rounded-t-lg transition-all duration-300 ease-out cursor-pointer
                    hover:brightness-110 hover:shadow-lg
                    ${enableAnimation ? 'animate-grow' : ''}
                  `}
                  style={{
                    width: '40px',
                    height: `${(item.value / maxValue) * 80}%`,
                    backgroundColor: item.color,
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: activeIndex === index ? `0 4px 20px ${item.color}40` : 'none'
                  }}
                >
                  {/* Value Label */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                    {valueFormatter(item.value)}
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 animate-shimmer"></div>
                </div>

                {/* X-axis Label */}
                <div className="text-xs font-medium text-gray-600 text-center max-w-[60px] truncate">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Y-axis Labels */}
        <div className="absolute left-2 inset-y-0 flex flex-col justify-between py-4 text-xs text-gray-500">
          {[maxValue, maxValue * 0.8, maxValue * 0.6, maxValue * 0.4, maxValue * 0.2, 0].map((value, index) => (
            <div key={index} className="text-right">
              {valueFormatter(value)}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-3 justify-center">
          {processedData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLineChart = () => {
    const chartWidth = responsive ? '100%' : 400;
    const chartHeight = height - 100;
    const padding = 40;

    const points = processedData.map((item, index) => {
      const x = (index / (processedData.length - 1)) * (400 - padding * 2) + padding;
      const y = chartHeight - ((item.value / maxValue) * (chartHeight - padding * 2)) - padding;
      return { x, y, ...item };
    });

    const pathD = points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      } else {
        const prevPoint = points[index - 1];
        const cpX1 = prevPoint.x + (point.x - prevPoint.x) / 3;
        const cpY1 = prevPoint.y;
        const cpX2 = point.x - (point.x - prevPoint.x) / 3;
        const cpY2 = point.y;
        return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
      }
    }, '');

    return (
      <div className="space-y-4">
        <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ height: `${height}px` }}>
          <svg width="100%" height={height} className="overflow-visible">
            <defs>
              <linearGradient id="cresolLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
                <stop offset="100%" stopColor={colors[1]} stopOpacity="1" />
              </linearGradient>
              <linearGradient id="cresolAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {showGrid && [0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = chartHeight - (ratio * (chartHeight - padding * 2)) - padding;
              return (
                <line
                  key={index}
                  x1={padding}
                  y1={y}
                  x2={400 - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}

            {/* Area Fill for Area Chart */}
            {type === 'area' && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
                fill="url(#cresolAreaGradient)"
                opacity="0.6"
              />
            )}

            {/* Main Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#cresolLineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {/* Data Points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="white"
                  stroke={point.color}
                  strokeWidth="3"
                  className="drop-shadow-sm hover:r-8 transition-all cursor-pointer"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill={point.color}
                />
              </g>
            ))}

            {/* Tooltip for active point */}
            {showTooltip && activeIndex !== null && (
              <g>
                <rect
                  x={points[activeIndex].x - 40}
                  y={points[activeIndex].y - 35}
                  width="80"
                  height="25"
                  fill="rgba(0,0,0,0.8)"
                  rx="4"
                />
                <text
                  x={points[activeIndex].x}
                  y={points[activeIndex].y - 18}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="500"
                >
                  {valueFormatter(points[activeIndex].value)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap gap-3 justify-center">
            {processedData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-md p-6 hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
        </div>
        
        {/* Export Controls */}
        {enableExport && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('png')}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm-lg transition-colors"
              title="Exportar como PNG"
            >
              PNG
            </button>
            <button
              onClick={() => handleExport('svg')}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm-lg transition-colors"
              title="Exportar como SVG"
            >
              SVG
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm-lg transition-colors"
              title="Exportar como PDF"
            >
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div>
        {type === 'bar' && renderBarChart()}
        {(type === 'line' || type === 'area') && renderLineChart()}
      </div>

      {/* Chart Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total de pontos: {data.length}</span>
          <span>Valor máximo: {valueFormatter(maxValue)}</span>
        </div>
      </div>
    </div>
  );
}