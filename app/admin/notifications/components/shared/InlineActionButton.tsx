import React from 'react';

interface InlineActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  variant?: 'default' | 'danger';
}

export const InlineActionButton: React.FC<InlineActionButtonProps> = ({ 
  onClick, 
  icon, 
  tooltip, 
  variant = 'default' 
}) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded-md transition-colors ${
      variant === 'danger' 
        ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
    }`}
    title={tooltip}
  >
    {icon}
  </button>
);