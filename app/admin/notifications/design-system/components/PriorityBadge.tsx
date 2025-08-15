import { PriorityType } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const priorityConfig = {
  low: {
    label: 'Baixa',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-400',
  },
  normal: {
    label: 'Normal',
    bg: 'bg-blue-50',
    border: 'border-blue-200', 
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  high: {
    label: 'Alta',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  urgent: {
    label: 'Urgente',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-400',
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const config = priorityConfig[priority];
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getDotSize = () => {
    switch (size) {
      case 'sm':
        return 'w-1.5 h-1.5';
      case 'lg':
        return 'w-3 h-3';
      default:
        return 'w-2 h-2';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2
        ${getSizeClasses()}
        ${config.bg}
        ${config.border}
        ${config.text}
        border
        rounded-full
        font-medium
        ${className}
      `}
    >
      <span className={`${getDotSize()} ${config.dot} rounded-full flex-shrink-0`} />
      {showLabel && config.label}
    </span>
  );
};