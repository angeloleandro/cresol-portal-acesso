import React, { ReactNode } from 'react';
import { CRESOL_UI_CONFIG, CRESOL_DESIGN_TOKENS } from '@/lib/design-tokens';

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
    <div className={`${CRESOL_UI_CONFIG.card.base} ${CRESOL_UI_CONFIG.card.variants.hover} ${CRESOL_UI_CONFIG.card.padding.lg} ${className}`}>
      {/* Header */}
      <div className={`${CRESOL_DESIGN_TOKENS.utilities.flex.start} ${CRESOL_DESIGN_TOKENS.utilities.gap[3]} mb-8`}>
        {icon && (
          <div className="bg-primary/10 p-3 rounded-md">
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
      <form onSubmit={onSubmit} className={CRESOL_DESIGN_TOKENS.utilities.space[8]}>
        {cardContent}
      </form>
    );
  }

  return cardContent;
};

export default FormCard;