'use client';

interface ShimmerLoadingProps {
  className?: string;
  type?: 'card' | 'chart' | 'text' | 'button' | 'avatar' | 'table';
  count?: number;
}

export default function ShimmerLoading({ 
  className = '', 
  type = 'card',
  count = 1 
}: ShimmerLoadingProps) {
  
  const renderShimmerCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
  );

  const renderShimmerChart = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShimmerText = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const renderShimmerButton = () => (
    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
  );

  const renderShimmerAvatar = () => (
    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
  );

  const renderShimmerTable = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShimmer = () => {
    switch (type) {
      case 'card': return renderShimmerCard();
      case 'chart': return renderShimmerChart();
      case 'text': return renderShimmerText();
      case 'button': return renderShimmerButton();
      case 'avatar': return renderShimmerAvatar();
      case 'table': return renderShimmerTable();
      default: return renderShimmerCard();
    }
  };

  if (count === 1) {
    return (
      <div className={className}>
        {renderShimmer()}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderShimmer()}
        </div>
      ))}
    </div>
  );
}

// Componente especializado para métricas
export function MetricsShimmer({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ShimmerLoading key={index} type="card" />
      ))}
    </div>
  );
}

// Componente especializado para dashboard
export function DashboardShimmer() {
  return (
    <div className="space-y-8">
      <MetricsShimmer />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ShimmerLoading type="chart" />
        </div>
        <div className="space-y-6">
          <ShimmerLoading type="table" />
          <ShimmerLoading type="table" />
        </div>
      </div>
    </div>
  );
}