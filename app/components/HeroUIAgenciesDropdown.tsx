'use client';

import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button 
} from '@nextui-org/react';
import Link from 'next/link';
import { Icon } from './icons/Icon';

// Types
interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
}

interface HeroUIAgenciesDropdownProps {
  pathname: string;
  agencies: Subsector[];
}

// Dropdown padronizado para Agências usando HeroUI/NextUI
const HeroUIAgenciesDropdown = memo(({ pathname, agencies }: HeroUIAgenciesDropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Limpar timeout quando component é desmontado
  useEffect(() => {
    return () => {
      if (dropdownHoverTimeoutRef.current) {
        clearTimeout(dropdownHoverTimeoutRef.current);
      }
    };
  }, []);

  // Handlers para hover behavior no dropdown principal
  const handleDropdownMouseEnter = useCallback(() => {
    if (dropdownHoverTimeoutRef.current) {
      clearTimeout(dropdownHoverTimeoutRef.current);
      dropdownHoverTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    if (dropdownHoverTimeoutRef.current) {
      clearTimeout(dropdownHoverTimeoutRef.current);
    }
    
    dropdownHoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms debounce
  }, []);

  // Preparar itens do menu
  const menuItems = [];
  
  // Item "Todas as Agências"
  menuItems.push({
    key: 'all-agencies',
    type: 'link',
    href: '/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71',
    label: 'Todas as Agências',
    className: 'font-medium'
  });

  // Adicionar cada agência
  agencies.forEach((agency) => {
    menuItems.push({
      key: agency.id,
      type: 'link',
      href: `/subsetores/${agency.id}`,
      label: agency.name,
      className: 'text-sm'
    });
  });

  // Verificar se está ativo
  const isActive = pathname.includes('5463d1ba-c290-428e-b39e-d7ad9c66eb71') || 
                   pathname.startsWith('/agencias');

  return (
    <div 
      onMouseEnter={handleDropdownMouseEnter}
      onMouseLeave={handleDropdownMouseLeave}
    >
      <Dropdown 
        placement="bottom-start"
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        shouldFlip={true}
        shouldCloseOnBlur={true}
        classNames={{
          content: "min-w-[320px] max-h-[75vh] min-h-[200px] bg-white border-0 rounded-md shadow-xl overflow-hidden z-50 p-0",
        }}
      >
      <DropdownTrigger>
        <Button
          variant="light"
          className={`
            h-auto p-0 min-w-0 data-[hover]:bg-transparent
            text-sm font-medium flex items-center gap-1
            focus:outline-none focus:ring-0 focus:border-none
            data-[focus]:outline-none data-[focus]:border-none data-[focus]:ring-0
            data-[focus-visible]:outline-none data-[focus-visible]:border-none data-[focus-visible]:ring-0
            ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}
          `}
          as={Link}
          href="/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71"
          endContent={
            <Icon 
              name="chevron-down" 
              className="h-4 w-4 transition-transform data-[open=true]:rotate-180" 
            />
          }
        >
          Agências
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Menu de Agências"
        className="p-1 pr-2 max-h-[70vh] overflow-y-auto scrollbar-branded focus:outline-none"
        itemClasses={{
          base: [
            "rounded-md",
            "text-default-700",
            "transition-colors",
            "border-0",
            "outline-none",
            "ring-0",
            "shadow-none",
            "data-[hover=true]:bg-primary",
            "data-[hover=true]:text-white",
            "data-[selectable=true]:focus:bg-primary", 
            "data-[selectable=true]:focus:text-white",
            "focus:outline-none",
            "focus:border-none",
            "focus:ring-0",
            "data-[focus]:outline-none",
            "data-[focus]:border-none",
            "data-[focus-visible]:outline-none",
            "data-[focus-visible]:border-none",
            "data-[focus-visible]:ring-0",
            "data-[focus-visible]:shadow-none",
            "before:hidden",
            "after:hidden"
          ],
        }}
      >
        {menuItems.map((item) => (
          <DropdownItem
            key={item.key}
            className={item.className || ''}
            href={item.href}
            as={Link}
          >
            <span className="truncate" title={item.label}>
              {item.label}
            </span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
    </div>
  );
});

HeroUIAgenciesDropdown.displayName = 'HeroUIAgenciesDropdown';

export default HeroUIAgenciesDropdown;