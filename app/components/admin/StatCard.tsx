'use client';

import { Icon, IconName } from '../icons/Icon';

interface StatCardProps {
  icon: IconName;
  value: number;
  label: string;
  className?: string;
}

export default function StatCard({ icon, value, label, className = '' }: StatCardProps) {
  return (
    <div className={`stat-card-orange ${className}`}>
      <div className="flex items-center">
        <div className="icon-container-orange mr-5 flex-shrink-0">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="stat-value mb-1">
            {value}
          </div>
          <div className="stat-label">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}