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
import { usePathname } from 'next/navigation';
import { Icon } from './icons/Icon';

// Types
interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
}

interface Sector {
  id: string;
  name: string;
  description?: string;
  subsectors?: Subsector[];
}

interface HeroUISectorsDropdownProps {
  pathname: string;
  sectors: Sector[];
}

// Dropdown padronizado para Setores usando HeroUI/NextUI
const HeroUISectorsDropdown = memo(({ pathname, sectors }: HeroUISectorsDropdownProps) => {
  const [openSubsectors, setOpenSubsectors] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentHoveredSector = useRef<string | null>(null);
  
  // Limpar timeout quando component é desmontado
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
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

  // Controlar quais sub-setores estão abertos via hover (apenas um por vez)
  const handleSectorHover = useCallback((sectorId: string) => {
    // Limpar qualquer timeout pendente
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    currentHoveredSector.current = sectorId;
    
    // Abrir imediatamente apenas o setor sendo hovered
    setOpenSubsectors(new Set([sectorId]));
  }, []);

  // Controlar quando mouse sai do setor
  const handleSectorLeave = useCallback(() => {
    // Limpar qualquer timeout pendente
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Debounce para fechar (dar tempo de ir para sub-setor)
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenSubsectors(new Set());
      currentHoveredSector.current = null;
    }, 200); // 200ms debounce para experiência mais suave
  }, []);

  // Manter aberto quando está sobre sub-setores
  const handleSubsectorHover = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Preparar itens do menu
  const menuItems: Array<{
    key: string;
    type: 'link';
    href: string;
    label: string;
    className?: string;
    sector?: Sector;
    hasSubsectors?: boolean;
    isOpen?: boolean;
    isSubsector?: boolean;
  }> = [];
  
  // Item "Todos os Setores"
  menuItems.push({
    key: 'all-sectors',
    type: 'link',
    href: '/setores',
    label: 'Todos os Setores',
    className: 'font-medium'
  });

  // Adicionar cada setor
  sectors.forEach((sector) => {
    // Setor principal (sempre navegável via click)
    menuItems.push({
      key: sector.id,
      type: 'link', // Sempre link para permitir navegação via click
      href: `/setores/${sector.id}`,
      label: sector.name,
      sector: sector,
      hasSubsectors: sector.subsectors && sector.subsectors.length > 0,
      isOpen: openSubsectors.has(sector.id)
    });
    
    // Sub-setores (se estiver aberto)
    if (sector.subsectors && sector.subsectors.length > 0 && openSubsectors.has(sector.id)) {
      sector.subsectors.forEach((subsector) => {
        menuItems.push({
          key: `${sector.id}-${subsector.id}`,
          type: 'link',
          href: `/subsetores/${subsector.id}`,
          label: subsector.name,
          isSubsector: true // Flag para identificar sub-setores
        });
      });
    }
  });

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
            ${pathname.startsWith('/setores') ? 'text-white' : 'text-white/80 hover:text-white'}
          `}
          as={Link}
          href="/setores"
          endContent={
            <Icon 
              name="chevron-down" 
              className="h-4 w-4 transition-transform data-[open=true]:rotate-180" 
            />
          }
        >
          Setores
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Menu de Setores"
        className="p-1 pr-2 max-h-[70vh] overflow-y-auto scrollbar-branded"
        disabledKeys={[]}
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
            "data-[focus-visible=true]:outline-none",
            "data-[focus-visible=true]:ring-0",
            "data-[focus-visible=true]:shadow-none",
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
            onMouseEnter={item.hasSubsectors ? () => handleSectorHover(item.key) : (item.isSubsector ? handleSubsectorHover : undefined)}
            onMouseLeave={item.hasSubsectors ? handleSectorLeave : (item.isSubsector ? handleSectorLeave : undefined)}
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

HeroUISectorsDropdown.displayName = 'HeroUISectorsDropdown';

export default HeroUISectorsDropdown;