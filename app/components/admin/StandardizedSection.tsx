'use client';

import { ReactNode } from 'react';

interface StandardizedSectionProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

/**
 * Seção padronizada: wrapper para blocos de conteúdo com header limpo + body + footer
 * Inspirado no visual de /admin/users e conceitos do Chakra (seções claras, hierarquia e espaçamento).
 */
export default function StandardizedSection({
  title,
  subtitle,
  actions,
  children,
  className = '',
  footer
}: StandardizedSectionProps) {
  return (
    <section className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>
      )}

      <div className="p-4">
        {children}
      </div>

      {footer && (
        <div className="px-4 pt-2 pb-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </section>
  );
}
