'use client';

import Link from 'next/link';
import { Icon, IconName } from '../icons/Icon';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: IconName;
  href: string;
  className?: string;
}

export default function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  className = '' 
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={`stat-card-orange text-white transition-all duration-200 ${className}`}
    >
      <div className="flex items-center">
        <div className="icon-container-orange mr-5 flex-shrink-0">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="stat-value mb-1">
            {title}
          </div>
          <div className="stat-label">
            {description}
          </div>
        </div>
      </div>
    </Link>
  );
}