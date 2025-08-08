'use client';

import Link from 'next/link';
import { Icon, IconName } from '../icons/Icon';

interface AdminModuleCardProps {
  title: string;
  description: string;
  icon: IconName;
  link: string;
  className?: string;
}

export default function AdminModuleCard({ 
  title, 
  description, 
  icon, 
  link, 
  className = '' 
}: AdminModuleCardProps) {
  return (
    <Link 
      href={link}
      className={`card-modern p-6 flex items-start group focus-modern ${className}`}
    >
      <div className="icon-container-modern mr-4 flex-shrink-0 transition-colors duration-200">
        <Icon name={icon} className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="heading-4 text-title mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        
        <p className="body-text-small text-muted leading-relaxed">
          {description}
        </p>
      </div>
      
      <Icon 
        name="arrow-left" 
        className="h-4 w-4 text-muted group-hover:text-primary flex-shrink-0 mt-1 rotate-180 transition-colors duration-200" 
      />
    </Link>
  );
}