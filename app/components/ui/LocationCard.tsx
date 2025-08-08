import React from 'react';
import { TruncatedText } from './TruncatedText';

interface LocationCardProps {
  name: string;
  users: number;
  percentage: number;
  rank: number;
  className?: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  name,
  users,
  percentage,
  rank,
  className = ''
}) => {
  const getColorByRank = (rank: number) => {
    switch (rank) {
      case 0: return 'bg-orange-500';
      case 1: return 'bg-orange-400';
      case 2: return 'bg-orange-300';
      default: return 'bg-gray-400';
    }
  };
  
  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };
  
  return (
    <div className={`group bg-white border border-gray-200/40 hover:border-gray-200/70 rounded-lg p-3 transition-colors duration-150 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getColorByRank(rank)}`} />
            {rank < 3 && (
              <span className="text-sm">{getRankLabel(rank)}</span>
            )}
          </div>
          <TruncatedText 
            text={name}
            maxLength={18}
            className="text-sm font-medium text-gray-700"
            showTooltip={true}
          />
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <div className="text-sm font-semibold text-gray-900">{users}</div>
          <div className="text-xs text-gray-500">({percentage}%)</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${getColorByRank(rank)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Hover effect indicator */}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>#{rank + 1} posição</span>
          <span>{users} {users === 1 ? 'usuário' : 'usuários'}</span>
        </div>
      </div>
    </div>
  );
};
