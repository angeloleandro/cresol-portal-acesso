'use client';

import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button 
} from '@nextui-org/react';
import Link from 'next/link';
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

interface DropdownMenuItem {
  key: string;
  label: string;
  href: string;
  sector?: {
    id: string;
    name: string;
    subsectors?: Subsector[];
  };
}

// Hook para detectar se é dispositivo móvel
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// Componente para o submenu hierárquico
const HierarchicalSubmenu = memo(({ 
  sector, 
  isVisible, 
  position, 
  onMouseEnter, 
  onMouseLeave,
  isMounted 
}: {
  sector: Sector;
  isVisible: boolean;
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMounted: boolean;
}) => {
  if (!isVisible || !sector.subsectors?.length || !isMounted) return null;

  return createPortal(
    <div
      className="fixed z-[9999] animate-in fade-in slide-in-from-left-1 duration-150"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Hover bridge invisível */}
      <div className="absolute -left-2 top-0 w-2 h-full bg-transparent" />
      
      <div className="bg-white border border-gray-200/60 hover:border-gray-200 min-w-[200px] max-h-[400px] overflow-y-auto rounded-md p-1 transition-colors duration-150" data-submenu="true">
        {/* Lista de subsetores */}
        <div className="py-1">
          {sector.subsectors.map((subsector, index) => (
            <Link
              key={subsector.id}
              href={`/subsetores/${subsector.id}`}
              className={`
                block px-3 py-2 text-sm text-gray-700 rounded-md transition-colors
                hover:bg-primary hover:text-white focus:bg-primary focus:text-white
                focus:outline-none
              `}
              style={{
                animationDelay: `${index * 20}ms`
              }}
            >
              <span className="truncate block" title={subsector.name}>
                {subsector.name.replace(/^Benefícios Cresol\s*-\s*/, '').toString()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
});

HierarchicalSubmenu.displayName = 'HierarchicalSubmenu';

// Componente para versão mobile com accordion
const MobileAccordion = memo(({ pathname, sectors }: { pathname: string; sectors: Sector[] }) => {
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  // Preparar itens de menu de forma linear
  const menuItems = [];
  
  // Todos os setores
  menuItems.push(
    <DropdownItem key="all-sectors" href="/setores" as={Link}>
      <span className="font-medium">Todos os Setores</span>
    </DropdownItem>
  );
  
  // Adicionar setores e subsetores expandidos
  sectors.forEach((sector) => {
    menuItems.push(
      <DropdownItem
        key={`sector-${sector.id}`}
        className="flex items-center justify-between"
        onClick={() => {
          if (sector.subsectors?.length) {
            setExpandedSector(
              expandedSector === sector.id ? null : sector.id
            );
          }
        }}
        href={sector.subsectors?.length ? undefined : `/setores/${sector.id}`}
        as={sector.subsectors?.length ? 'div' : Link}
      >
        <span className="flex items-center justify-between w-full">
          <span className="truncate">{sector.name.toString()}</span>
          {sector.subsectors && sector.subsectors.length > 0 && (
            <Icon
              name="chevron-down"
              className={`h-4 w-4 transition-transform ml-2 ${
                expandedSector === sector.id ? 'rotate-180' : ''
              }`}
            />
          )}
        </span>
      </DropdownItem>
    );
    
    // Adicionar subsetores se expandido
    if (expandedSector === sector.id && sector.subsectors?.length) {
      sector.subsectors.forEach((subsector) => {
        menuItems.push(
          <DropdownItem
            key={`subsector-${subsector.id}`}
            href={`/subsetores/${subsector.id}`}
            as={Link}
            className="text-sm pl-6 border-l-2 border-divider ml-2"
          >
            <span className="truncate">{subsector.name.toString()}</span>
          </DropdownItem>
        );
      });
    }
  });

  return (
    <div className="md:hidden">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <Button
            variant="light"
            className={`
              h-auto p-0 min-w-0 data-[hover]:bg-transparent
              text-sm font-medium flex items-center gap-1
              focus:outline-none focus:ring-0 focus:border-none
              ${pathname.startsWith('/setores') ? 'text-white' : 'text-white/80 hover:text-white'}
            `}
            endContent={
              <Icon name="chevron-down" className="h-4 w-4" />
            }
          >
            Setores
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Menu de Setores Mobile"
          className="p-1 max-h-[70vh] overflow-y-auto rounded-sm"
          itemClasses={{
            base: [
              "rounded-sm",
              "text-default-700",
              "transition-colors",
              "data-[hover=true]:bg-primary",
              "data-[hover=true]:text-white",
            ],
          }}
        >
          {menuItems}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
});

MobileAccordion.displayName = 'MobileAccordion';

// Componente principal refatorado
const HeroUISectorsDropdown = memo(({ pathname, sectors }: HeroUISectorsDropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sectorRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const hoverTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  const isMobile = useIsMobile();

  // Cleanup timeouts
  useEffect(() => {
    const currentTimeouts = hoverTimeouts.current;
    return () => {
      Object.values(currentTimeouts).forEach(clearTimeout);
    };
  }, []);

  // Control component mounting for portal rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers para dropdown principal
  const handleDropdownMouseEnter = useCallback(() => {
    Object.values(hoverTimeouts.current).forEach(clearTimeout);
    setIsDropdownOpen(true);
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    Object.values(hoverTimeouts.current).forEach(clearTimeout);
    
    hoverTimeouts.current.dropdown = setTimeout(() => {
      setIsDropdownOpen(false);
      setActiveSubmenu(null);
    }, 300);
  }, []);

  // Handlers para submenu hierárquico
  const handleSectorHover = useCallback((sectorId: string, event: React.MouseEvent) => {
    Object.values(hoverTimeouts.current).forEach(clearTimeout);
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const sector = sectors.find(s => s.id === sectorId);
    
    if (sector?.subsectors?.length) {
      hoverTimeouts.current[sectorId] = setTimeout(() => {
        setSubmenuPosition({
          x: rect.right + 16, // Aumentar gap para 16px
          y: rect.top - 4, // Ajustar alinhamento vertical
        });
        setActiveSubmenu(sectorId);
      }, 150);
    }
  }, [sectors]);

  const handleSectorLeave = useCallback(() => {
    Object.values(hoverTimeouts.current).forEach(clearTimeout);
    
    hoverTimeouts.current.sector = setTimeout(() => {
      setActiveSubmenu(null);
    }, 300);
  }, []);

  const handleSubmenuEnter = useCallback(() => {
    Object.values(hoverTimeouts.current).forEach(clearTimeout);
  }, []);

  const handleSubmenuLeave = useCallback(() => {
    hoverTimeouts.current.submenu = setTimeout(() => {
      setActiveSubmenu(null);
    }, 200);
  }, []);

  // Navegação por teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setActiveSubmenu(null);
        setIsDropdownOpen(false);
        break;
      case 'ArrowRight':
        // Lógica para entrar no primeiro submenu disponível
        if (activeSubmenu === null) {
          const firstSectorWithSubsectors = sectors.find(s => s.subsectors?.length);
          if (firstSectorWithSubsectors) {
            setActiveSubmenu(firstSectorWithSubsectors.id);
            event.preventDefault();
          }
        }
        break;
      case 'ArrowLeft':
        if (activeSubmenu) {
          setActiveSubmenu(null);
          event.preventDefault();
        }
        break;
    }
  }, [activeSubmenu, sectors]);

  const activeSector = sectors.find(s => s.id === activeSubmenu);

  // Renderizar versão mobile se necessário
  if (isMobile) {
    return <MobileAccordion pathname={pathname} sectors={sectors} />;
  }

  return (
    <div className="hidden md:block relative" onKeyDown={handleKeyDown}>
      <div
        ref={dropdownRef}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      >
        <Dropdown 
          placement="bottom-start"
          isOpen={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
          shouldFlip={true}
          shouldCloseOnBlur={true}
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
            className="p-1 pr-2 bg-gray-50 rounded-sm"
            itemClasses={{
              base: [
                "rounded-sm",
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
            items={[
              { key: "all-sectors", label: "Todos os Setores", href: "/setores" } as DropdownMenuItem,
              ...sectors.map((sector) => ({ 
                key: sector.id, 
                label: sector.name, 
                href: `/setores/${sector.id}`,
                sector: {
                  id: sector.id,
                  name: sector.name,
                  subsectors: sector.subsectors
                }
              } as DropdownMenuItem))
            ]}
          >
            {(item: DropdownMenuItem) => (
              <DropdownItem
                key={item.key}
                href={item.href}
                as={Link}
                {...(item.sector && {
                  onMouseEnter: (e: any) => {
                    if (item.sector) {
                      sectorRefs.current[item.sector.id] = e.currentTarget;
                      item.sector.subsectors?.length && handleSectorHover(item.sector.id, e);
                    }
                  },
                  onMouseLeave: item.sector?.subsectors?.length ? handleSectorLeave : undefined,
                  className: `
                    relative transition-all duration-100
                    ${item.sector && activeSubmenu === item.sector.id ? 'bg-primary/10 text-primary' : ''}
                  `,
                  "aria-haspopup": item.sector?.subsectors?.length ? 'menu' : undefined,
                  "aria-expanded": item.sector && activeSubmenu === item.sector.id,
                })}
                className={item.key === "all-sectors" ? "font-medium" : undefined}
              >
                {item.sector ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate flex-1" title={item.sector.name}>
                      {item.sector.name.toString()}
                    </span>
                    {item.sector.subsectors && item.sector.subsectors.length > 0 && (
                      <Icon
                        name="chevron-right"
                        className={`
                          h-4 w-4 ml-2 transition-colors
                          ${item.sector && activeSubmenu === item.sector.id ? 'text-primary' : 'text-foreground-400'}
                        `}
                      />
                    )}
                  </div>
                ) : (
                  <span className="truncate">{item.label.toString()}</span>
                )}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Submenu hierárquico */}
      <HierarchicalSubmenu
        sector={activeSector!}
        isVisible={!!activeSubmenu && !!activeSector}
        position={submenuPosition}
        onMouseEnter={handleSubmenuEnter}
        onMouseLeave={handleSubmenuLeave}
        isMounted={isMounted}
      />
    </div>
  );
});

HeroUISectorsDropdown.displayName = 'HeroUISectorsDropdown';

export default HeroUISectorsDropdown;