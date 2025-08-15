import { Card } from '../../design-system/components/Card';
import { PriorityBadge } from '../../design-system/components/PriorityBadge';
import { PriorityType } from '../../types';

interface PrioritySelectorProps {
  value: PriorityType;
  onChange: (priority: PriorityType) => void;
  className?: string;
}

const priorityOptions: Array<{
  value: PriorityType;
  label: string;
  description: string;
}> = [
  {
    value: 'low',
    label: 'Baixa',
    description: 'Informação geral, não requer ação imediata',
  },
  {
    value: 'normal', 
    label: 'Normal',
    description: 'Comunicação padrão, tempo de resposta normal',
  },
  {
    value: 'high',
    label: 'Alta',
    description: 'Importante, requer atenção em breve',
  },
  {
    value: 'urgent',
    label: 'Urgente',
    description: 'Crítico, requer ação imediata',
  },
];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-900">
        Nível de Prioridade
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {priorityOptions.map((priority) => (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={`
              group relative p-4 text-left
              border-2 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
              ${
                value === priority.value
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <PriorityBadge 
                    priority={priority.value}
                    size="sm"
                    showLabel={false}
                  />
                  <span className="font-medium text-gray-900">
                    {priority.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {priority.description}
                </p>
              </div>
              
              {/* Selection indicator */}
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                transition-all duration-200
                ${
                  value === priority.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-300 bg-white group-hover:border-gray-400'
                }
              `}>
                {value === priority.value && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};