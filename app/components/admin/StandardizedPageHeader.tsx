'use client';

import { ReactNode } from 'react';

interface StandardizedPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  className?: string;
}

export default function StandardizedPageHeader({
  title,
  subtitle,
  action,
  className = ''
}: StandardizedPageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          
          {action && (
            <div className="mt-3 md:mt-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}