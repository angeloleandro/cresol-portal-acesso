'use client';

import { useEffect, useState, memo, useCallback, useMemo } from 'react';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface AnimatedChartProps {
  data: ChartData[];
  title: string;
  type?: 'bar' | 'line' | 'donut';
  height?: number;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

const AnimatedChart = memo(function AnimatedChart({
  data,
  title,
  type = 'bar',
  height = 300,
  showValues = true,
  animated = true,
  className = ''
}: AnimatedChartProps) {
  const [mounted, setMounted] = useState(false);
  const [animatedData, setAnimatedData] = useState(data.map(item => ({ ...item, value: 0 })));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !animated) {
      setAnimatedData(data);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      setAnimatedData(prevData =>
        data.map((item, index) => ({
          ...item,
          value: item.value * easeOutCubic
        }))
      );

      if (progress >= 1) {
        clearInterval(timer);
        setAnimatedData(data);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [data, mounted, animated]);

  const maxValue = Math.max(...data.map(d => d.value));

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return Math.round(value).toString();
  };

  const renderBarChart = () => (
    <div className="space-y-6">
      {animatedData.map((item, index) => (
        <div key={item.label} className="group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 truncate">
              {item.label}
            </span>
            {showValues && (
              <span className="text-sm font-semibold text-gray-900 tabular-nums min-w-[60px] text-right">
                {formatValue(item.value)}
              </span>
            )}
          </div>
          
          <div className="relative">
            {/* Background Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              {/* Animated Fill */}
              <div
                className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden group-hover:brightness-110"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`
                }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer opacity-0 group-hover:opacity-100"></div>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div 
              className="absolute -top-1 w-3 h-5 rounded-sm shadow-lg transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"
              style={{
                left: `${(item.value / maxValue) * 100}%`,
                transform: 'translateX(-50%)',
                backgroundColor: item.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => {
    const chartHeight = 200;
    const chartWidth = 400;
    const padding = 40;

    if (!mounted) return <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse"></div>;

    const points = animatedData.map((item, index) => {
      const x = (index / (animatedData.length - 1)) * (chartWidth - padding * 2) + padding;
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
        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F58220" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF9A4D" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F58220" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F58220" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = chartHeight - (ratio * (chartHeight - padding * 2)) - padding;
              return (
                <line
                  key={index}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}

            {/* Area Fill */}
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
              fill="url(#areaGradient)"
              opacity="0.6"
            />

            {/* Main Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineGradient)"
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
                  stroke="#F58220"
                  strokeWidth="3"
                  className="drop-shadow-sm hover:r-8 transition-all cursor-pointer"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill="#F58220"
                />
              </g>
            ))}
          </svg>

          {/* Value Labels */}
          <div className="absolute inset-0 pointer-events-none">
            {points.map((point, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-8 opacity-0 hover:opacity-100 transition-opacity"
                style={{ left: point.x, top: point.y }}
              >
                <div className="bg-gray-900 text-white px-2 py-1 rounded-sm text-xs font-medium">
                  {formatValue(point.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
      </div>

      <div style={{ height: `${height}px` }}>
        {type === 'bar' && renderBarChart()}
        {type === 'line' && renderLineChart()}
      </div>

      {/* Loading Overlay */}
      {!mounted && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-md">
          <div className="flex items-center space-x-2">
            <UnifiedLoadingSpinner size="default" />
            <span className="text-sm text-gray-600">Carregando gráfico...</span>
          </div>
        </div>
      )}
    </div>
  );
});

AnimatedChart.displayName = 'AnimatedChart';

export default AnimatedChart;