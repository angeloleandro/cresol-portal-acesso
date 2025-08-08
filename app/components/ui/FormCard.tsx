import React, { ReactNode } from 'react';

interface FormCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

const FormCard: React.FC<FormCardProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
  onSubmit
}) => {
  const cardContent = (
    <div className={`bg-white rounded-xl border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150 p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        {icon && (
          <div className="bg-primary/10 p-3 rounded-xl">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-cresol-gray-dark">{title}</h2>
          {description && (
            <p className="text-cresol-gray">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className="space-y-8">
        {cardContent}
      </form>
    );
  }

  return cardContent;
};

export default FormCard;