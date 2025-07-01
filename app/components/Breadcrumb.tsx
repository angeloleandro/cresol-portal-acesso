import Link from 'next/link';
import { Icon, IconName } from './icons/Icon';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <Icon 
              name="arrow-left" 
              className="h-4 w-4 text-gray-400 mx-2 rotate-180" 
            />
          )}
          
          {item.href ? (
            <Link 
              href={item.href}
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              {item.icon && index === 0 && (
                <Icon name={item.icon} className="h-4 w-4 mr-1" />
              )}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center text-gray-900 font-medium">
              {item.icon && index === 0 && (
                <Icon name={item.icon} className="h-4 w-4 mr-1" />
              )}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}