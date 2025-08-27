'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Icon, IconName } from '@/app/components/icons/Icon';

export interface ActionItem {
  label: string;
  icon?: IconName;
  onClick: () => void;
  variant?: 'default' | 'danger';
  showDivider?: boolean;
}

interface AdminActionMenuProps {
  items: ActionItem[];
  triggerLabel?: string;
}

export function AdminActionMenu({ items, triggerLabel = "Ações" }: AdminActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: ActionItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="secondary"
        size="sm"
        icon="more-horizontal"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        {triggerLabel}
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-1 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.showDivider && index > 0 && (
                  <hr className="my-1 border-gray-200" />
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full px-4 py-2 text-left text-sm transition-colors
                    flex items-center gap-2
                    hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                    ${item.variant === 'danger' 
                      ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' 
                      : 'text-gray-700'
                    }
                  `}
                >
                  {item.icon && <Icon name={item.icon} className="w-4 h-4" />}
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}