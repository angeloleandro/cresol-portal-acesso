import React from 'react';
import { PriorityType, PriorityOption } from '../../types';

interface PrioritySelectorProps {
  value: PriorityType;
  onChange: (priority: PriorityType) => void;
}

const priorityOptions: PriorityOption[] = [
  {
    value: 'low',
    label: 'Baixa',
    color: 'bg-green-50 border-green-200 text-green-700',
    icon: '🟢'
  },
  {
    value: 'normal',
    label: 'Normal',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: '🔵'
  },
  {
    value: 'high',
    label: 'Alta',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    icon: '🟠'
  },
  {
    value: 'urgent',
    label: 'Urgente',
    color: 'bg-red-50 border-red-200 text-red-700',
    icon: '🔴'
  }
];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Nível de Prioridade
      </label>
      <div className="grid grid-cols-2 gap-3">
        {priorityOptions.map(priority => (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              value === priority.value 
                ? `${priority.color} ring-2 ring-offset-2 ring-primary/20` 
                : 'bg-white border-gray-200 hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{priority.icon}</span>
              <span className="font-medium text-sm">{priority.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};