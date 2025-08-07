import React from 'react';

interface StatusBadgeProps {
  type: 'priority' | 'notification-type' | 'status';
  value: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  type, 
  value, 
  size = 'md', 
  className = '' 
}) => {
  const getStyles = () => {
    const baseStyles = 'inline-flex items-center gap-1 font-medium rounded-full transition-all';
    
    const sizeStyles = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-1.5',
      lg: 'text-base px-4 py-2'
    };

    let colorStyles = '';
    let icon = '';

    if (type === 'priority') {
      switch (value) {
        case 'low':
          colorStyles = 'bg-green-50 text-green-700 border border-green-200';
          icon = '🟢';
          break;
        case 'normal':
          colorStyles = 'bg-blue-50 text-blue-700 border border-blue-200';
          icon = '';
          break;
        case 'high':
          colorStyles = 'bg-orange-50 text-orange-700 border border-orange-200';
          icon = '🟠';
          break;
        case 'urgent':
          colorStyles = 'bg-red-50 text-red-700 border border-red-200';
          icon = '';
          break;
        default:
          colorStyles = 'bg-gray-50 text-gray-700 border border-gray-200';
          icon = '⚪';
      }
    }

    if (type === 'notification-type') {
      switch (value) {
        case 'message':
          colorStyles = 'bg-blue-50 text-blue-700 border border-blue-200';
          icon = '';
          break;
        case 'system':
          colorStyles = 'bg-gray-50 text-gray-700 border border-gray-200';
          icon = '⚙️';
          break;
        case 'news':
          colorStyles = 'bg-green-50 text-green-700 border border-green-200';
          icon = '';
          break;
        case 'event':
          colorStyles = 'bg-purple-50 text-purple-700 border border-purple-200';
          icon = '';
          break;
        default:
          colorStyles = 'bg-gray-50 text-gray-700 border border-gray-200';
          icon = '';
      }
    }

    if (type === 'status') {
      switch (value) {
        case 'active':
        case 'ativo':
          colorStyles = 'bg-green-50 text-green-700 border border-green-200';
          icon = '✅';
          break;
        case 'inactive':
        case 'inativo':
          colorStyles = 'bg-gray-50 text-gray-700 border border-gray-200';
          icon = '⏸️';
          break;
        case 'pending':
        case 'pendente':
          colorStyles = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
          icon = '⏳';
          break;
        default:
          colorStyles = 'bg-gray-50 text-gray-700 border border-gray-200';
          icon = '⚪';
      }
    }

    return `${baseStyles} ${sizeStyles[size]} ${colorStyles} ${className}`;
  };

  const getLabel = () => {
    if (type === 'priority') {
      const priorityLabels = {
        low: 'Baixa',
        normal: 'Normal', 
        high: 'Alta',
        urgent: 'Urgente'
      };
      return priorityLabels[value as keyof typeof priorityLabels] || value;
    }

    if (type === 'notification-type') {
      const typeLabels = {
        message: 'Mensagem',
        system: 'Sistema',
        news: 'Notícia',
        event: 'Evento'
      };
      return typeLabels[value as keyof typeof typeLabels] || value;
    }

    return value;
  };

  const getIcon = () => {
    if (type === 'priority') {
      switch (value) {
        case 'low': return '🟢';
        case 'normal': return '';
        case 'high': return '🟠';
        case 'urgent': return '';
        default: return '⚪';
      }
    }

    if (type === 'notification-type') {
      switch (value) {
        case 'message': return '';
        case 'system': return '⚙️';
        case 'news': return '';
        case 'event': return '';
        default: return '';
      }
    }

    if (type === 'status') {
      switch (value) {
        case 'active':
        case 'ativo': return '✅';
        case 'inactive':
        case 'inativo': return '⏸️';
        case 'pending':
        case 'pendente': return '⏳';
        default: return '⚪';
      }
    }

    return '';
  };

  return (
    <span className={getStyles()}>
      <span className="text-sm">{getIcon()}</span>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;