import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  const defaultIcon = (
    <svg className="w-12 h-12 text-cresol-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  return (
    <div className={`bg-white rounded-xl border border-cresol-gray-light p-12 text-center ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="bg-cresol-gray-light/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          {icon || defaultIcon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-cresol-gray-dark mb-3">{title}</h3>
        <p className="text-cresol-gray mb-6">{description}</p>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className={`flex items-center gap-2 mx-auto ${
              action.variant === 'secondary' 
                ? 'btn-secondary' 
                : 'btn-primary'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;