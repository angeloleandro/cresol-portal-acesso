'use client';

import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Icon } from './icons/Icon';

// Tipo para os itens do menu
interface QuickLinkItem {
  key: string;
  href: string;
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
}

const QuickLinksDropdown = memo(() => {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Limpar timeout quando component é desmontado e remover hover laranja
  useEffect(() => {
    // Remove hover laranja do NextUI
    const removeOrangeHover = () => {
      const dropdownItems = document.querySelectorAll('[aria-label="Menu de Links Rápidos"] [data-slot]');
      dropdownItems.forEach(item => {
        const element = item as HTMLElement;
        element.style.setProperty('background-color', 'transparent', 'important');
      });
    };
    
    if (isDropdownOpen) {
      setTimeout(removeOrangeHover, 10);
    }
    
    return () => {
      if (dropdownHoverTimeoutRef.current) {
        clearTimeout(dropdownHoverTimeoutRef.current);
      }
    };
  }, [isDropdownOpen]);

  // Handlers para hover behavior
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

  // Verificar se algum dos links está ativo
  const isActive = pathname === '/dashboard' || 
                    pathname === '/sistemas' || 
                    pathname === '/eventos' || 
                    pathname === '/noticias';

  // Definir os itens do menu
  const menuItems: QuickLinkItem[] = [
    {
      key: 'calendario',
      href: '/eventos?view=calendar',
      title: 'Calendário',
      description: 'Eventos e compromissos organizacionais',
      icon: 'calendar',
      iconColor: 'text-primary'
    },
    {
      key: 'sistemas', 
      href: '/sistemas',
      title: 'Sistemas',
      description: 'Acesso aos sistemas corporativos',
      icon: 'monitor',
      iconColor: 'text-primary'
    },
    {
      key: 'dashboard',
      href: '/dashboard',
      title: 'Dashboard',
      description: 'Indicadores e métricas em tempo real',
      icon: 'chart-bar-vertical',
      iconColor: 'text-primary'
    },
    {
      key: 'noticias',
      href: '/noticias',
      title: 'Notícias',
      description: 'Últimas notícias e comunicados',
      icon: 'file-text',
      iconColor: 'text-primary'
    }
  ];

  return (
    <div 
      onMouseEnter={handleDropdownMouseEnter}
      onMouseLeave={handleDropdownMouseLeave}
    >
      <Dropdown 
        placement="bottom-start"
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        className="quick-links-dropdown"
        classNames={{
          content: "min-w-[600px] p-0 !bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden focus:outline-none focus:border-none focus:ring-0 transition-all duration-150",
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
            endContent={
              <Icon 
                name="chevron-down" 
                className="h-4 w-4 transition-transform data-[open=true]:rotate-180" 
              />
            }
          >
            Links Rápidos
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Menu de Links Rápidos"
          className="p-0 focus:outline-none"
          itemClasses={{
            base: [
              "p-0",
              "bg-transparent",
              "data-[hover=true]:bg-transparent",
              "data-[hover]:bg-transparent",
              "data-[selectable=true]:focus:bg-transparent",
              "data-[pressed=true]:bg-transparent",
              "data-[focus-visible=true]:bg-transparent",
              "hover:bg-transparent",
              "focus:outline-none",
              "focus:border-none",
              "focus:ring-0",
            ],
          }}
        >
          <DropdownItem
            key="content"
            className="p-0 hover:bg-transparent cursor-default data-[hover=true]:bg-transparent !bg-transparent"
            textValue="Links Rápidos"
          >
            <div className="bg-white">
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3">
                <h3 className="text-sm font-medium text-gray-900">Links Rápidos</h3>
                <Link 
                  href="/sistemas" 
                  className="text-xs text-gray-600 hover:text-primary transition-colors"
                >
                  Ver todos
                </Link>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Grid de Links */}
              <div className="p-2">
                <div className="grid grid-cols-2 gap-0">
                  {menuItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="group flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-50 border border-gray-200">
                        <Icon 
                          name={item.icon as any} 
                          className="h-5 w-5 text-primary" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer com CTA */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Precisa de ajuda?</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Entre em contato com o suporte técnico
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="flat"
                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium px-4 h-8 text-xs"
                  >
                    Explorar
                  </Button>
                </div>
              </div>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
});

QuickLinksDropdown.displayName = 'QuickLinksDropdown';

export default QuickLinksDropdown;