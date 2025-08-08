# Pesquisa: Navegação Hierárquica e Dropdowns Organizacionais

**Data:** 08/08/2025  
**Contexto:** Implementar navegação eficiente Setores → Sub-setores no Portal Cresol  
**Arquivos Relacionados:** 
- `/app/components/Navbar.tsx`
- `/app/setores/[id]/page.tsx`
- `/app/subsetores/[id]/page.tsx` (já implementado)

## 🎯 Objetivo

Pesquisar best practices para navegação hierárquica organizacional focando em:
1. Tornar cards de sub-setores clicáveis na página de setores
2. Adicionar sub-setores no dropdown da navbar  
3. Garantir navegação fluida e acessível entre setores → sub-setores

## 📋 Resumo Executivo

A pesquisa revela que as tendências 2024 para navegação organizacional priorizam **task-oriented navigation** sobre hierarquias departamentais tradicionais. Para o Portal Cresol, recomenda-se implementar uma abordagem híbrida que mantenha a estrutura organizacional mas otimize a experiência do usuário com cards clicáveis intuitivos e dropdown hierárquico no navbar.

**Principais Descobertas:**
- Dropdowns hierárquicos funcionam melhor com **click-based interactions** ao invés de hover (2024)
- Cards clicáveis devem ter **estados visuais claros** com hover effects sutis
- **Accessibility-first approach** é obrigatório (WCAG 2.1)
- **Mobile-first responsive design** com accordions para hierarquia

## 🔍 Achados Principais

### 1. Best Practices Navegação Hierárquica Organizacional

**Status Atual:** Navbar tem dropdown de setores, mas sem sub-setores  
**Best Practices 2024:**

- **Task-Oriented vs. Departmental:** Modern intranets emphasize task-based navigation over strict departmental hierarchies
- **Balanced Hierarchy:** Happy medium between flat (many top-level) and deep (many sub-levels) structures
- **User-Centered Information Architecture:** Content logically categorized with clear hierarchies and intuitive pathways
- **Visual Hierarchy:** Size, color, typography to emphasize important items and guide users

**Recomendações:**
- Implementar dropdown hierárquico no navbar: Setores → Sub-setores
- Manter breadcrumb navigation atual para context awareness
- Usar visual hierarchy para distinguir níveis organizacionais

**🔗 Fontes Referências:**
- [Staffbase Intranet Navigation Best Practices](https://staffbase.com/blog/intranet-navigation/) - 2024
- [AgilityPortal Menu Hierarchy Design](https://agilityportal.io/blog/menu-hierarchy-design-navigation-flow-ux-for-intranets) - 2024
- [Nielsen Norman Group Intranet Usability](https://www.nngroup.com/articles/intranet-usability-guidelines/) - 2024

### 2. Dropdown Hierárquico e Mega-Menu Patterns

**Status Atual:** SectorsDropdown implementado com hover interaction  
**Best Practices 2024:**

- **Click vs. Hover (Trending):** "Do we need mega-dropdown hover menus in 2024? Probably not. Opening the menu on tap/click usually causes way less trouble"
- **Timing for Hover:** When used, 0.5s stationary + 0.1s display time
- **Mobile Implementation:** Mega-dropdown = group of accordions with 4 items max per accordion
- **Accessibility:** Hover menus don't work on touchscreens and present screen reader problems

**Recomendações:**
- **Manter hover atual** (funciona bem no desktop corporativo)
- **Adicionar sub-setores** no dropdown existente com indentação visual
- **Implementar click fallback** para acessibilidade
- **Usar accordion pattern** no mobile para hierarquia

**🔗 Fontes Referências:**
- [Smashing Magazine Mega-Dropdowns](https://www.smashingmagazine.com/2021/05/frustrating-design-patterns-mega-dropdown-hover-menus/) - 2024
- [Nielsen Norman Group Mega Menus](https://www.nngroup.com/articles/mega-menus-work-well/) - 2024
- [Toptal Multilevel Menu Design](https://www.toptal.com/designers/ux/multilevel-menu-design) - 2024

### 3. Cards Clicáveis e Navigation Feedback

**Status Atual:** Sub-setores são cards informativos sem navegação  
**Best Practices 2024:**

- **Interactive Visual States:** "Cards meant to be clicked should look and feel interactive, with small effects like shadow changes or slight animations when hovering"
- **2024 Hover Trends:** "Hover effects have become fluid elements that can change and morph while hovering over different objects"
- **Moderation Principle:** "The key is moderation to avoid overwhelming effects, maintaining consistency across projects"
- **Multiple States:** hover states, active states, disabled states

**Recomendações:**
- **Transformar cards de sub-setores** em navigation elements
- **Implementar hover effects sutis:** shadow elevation, border highlight
- **Visual feedback claro:** cursor pointer, transition animations
- **Manter design consistency** com Cresol brand colors

**🔗 Fontes Referências:**
- [Justinmind Card UI Design](https://www.justinmind.com/ui-design/cards) - 2024
- [Eleken Card UI Examples](https://www.eleken.co/blog-posts/card-ui-examples-and-best-practices-for-product-owners) - 2024
- [Medium UX/UI Trends 2024](https://medium.com/codeart-mk/ux-ui-design-trends-2024-3637374ba59b) - 2024

### 4. Accessibility e WCAG 2.1 Compliance

**Status Atual:** Navbar implementa algumas práticas de acessibilidade  
**WCAG 2.1 Requirements:**

- **2.1.1 Keyboard:** All functionality operable through keyboard interface
- **2.1.2 No Keyboard Trap:** Focus can be moved away from any element  
- **2.4.3 Focus Order:** Logical and intuitive focus sequence
- **2.4.7 Focus Visible:** Visible focus indicator at all times
- **3:1 Contrast Ratio:** Between focused and unfocused states

**Recomendações:**
- **Implementar keyboard navigation** completa nos cards e dropdowns
- **ARIA roles e properties** para dropdown hierárquico  
- **Focus management** adequado para navigation
- **Tab order lógico** através da hierarquia organizacional

**🔗 Fontes Referências:**
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) - W3C Official
- [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/) - 2024
- [UXPin WCAG 2.1.1 Explained](https://www.uxpin.com/studio/blog/wcag-211-keyboard-accessibility-explained/) - 2024

### 5. Implementação Técnica Next.js + Tailwind

**Status Atual:** Projeto usa Next.js 14 + Tailwind CSS + TypeScript  
**Implementation Patterns:**

- **Hierarchical Data Structure:** Menu items with nested children arrays
- **React State Management:** useState for dropdown open/close states
- **Conditional Styling:** Tailwind utilities for responsive behavior
- **Headless UI Integration:** Recommended for robust dropdown components

**Recomendações:**
- **Extend existing SectorsDropdown** com sub-setores
- **Usar Headless UI** para melhor accessibility support
- **Implementar data fetching** de sub-setores no useOptimizedSectors hook
- **Manter performance optimization** atual

**🔗 Fontes Referências:**
- [GeeksforGeeks Dropdowns Next.js](https://www.geeksforgeeks.org/create-dropdowns-ui-with-next-js-and-tailwind-css/) - 2024
- [Designly Dropdown Menus](https://blog.designly.biz/easy-dropdown-menus-with-next-js-and-tailwind-css) - 2024
- [Headless UI Documentation](https://headlessui.dev/) - Official

## 📋 Recomendações Específicas

### Imediato (Quick Wins)
1. **Transformar cards de sub-setores em links clicáveis**
   - Adicionar Link wrapper nos cards da página `/setores/[id]`
   - Implementar hover states com Tailwind utilities
   - Manter visual hierarchy existente

2. **Estender SectorsDropdown com sub-setores**
   - Modificar useOptimizedSectors para incluir sub-setores
   - Adicionar indentação visual no dropdown atual
   - Implementar loading states para sub-setores

### Curto prazo (Melhorias importantes)
3. **Implementar keyboard navigation completa**
   - Adicionar ARIA roles nos dropdowns hierárquicos
   - Implementar focus management adequado
   - Testar com screen readers

4. **Otimizar para mobile com accordion pattern**
   - Adaptar dropdown hierárquico para mobile
   - Implementar accordion behavior para sub-setores
   - Manter performance em dispositivos móveis

### Médio prazo (Optimizações estratégicas)
5. **Adicionar breadcrumb navigation melhorada**
   - Incluir sub-setores no breadcrumb atual
   - Implementar navegação por breadcrumb clicável
   - Melhorar context awareness do usuário

6. **Performance optimization**
   - Implementar lazy loading para sub-setores
   - Cachear dados de navegação hierárquica
   - Otimizar bundle size com code splitting

## 🔧 Implementation Roadmap

### Fase 1: Cards Clicáveis (2-3 horas)
```typescript
// Em /app/setores/[id]/page.tsx - linha 382-407
{subsectors.map((subsector) => (
  <Link 
    key={subsector.id}
    href={`/subsetores/${subsector.id}`}
    className="block bg-white rounded-lg border border-cresol-gray-light overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-200"
  >
    <div className="p-6 border-b border-cresol-gray-light">
      <h3 className="text-xl font-semibold text-cresol-gray-dark mb-2">
        {subsector.name}
      </h3>
      {subsector.description && (
        <p className="text-cresol-gray text-sm">
          {subsector.description}
        </p>
      )}
    </div>
    
    <div className="p-4">
      <SubsectorTeam 
        subsectorId={subsector.id}
        subsectorName={subsector.name}
        showFullPage={false}
        maxMembers={4}
      />
    </div>
  </Link>
))}
```

### Fase 2: Dropdown Hierárquico (4-6 horas)
```typescript
// Modificar SectorsDropdown em Navbar.tsx
const SectorsDropdown = memo(({ pathname, sectors, subsectors, dropdown }: {
  pathname: string;
  sectors: Sector[];
  subsectors: { [sectorId: string]: Subsector[] };
  dropdown: ReturnType<typeof useOptimizedDropdown>;
}) => (
  <div className="relative" onMouseEnter={dropdown.handleOpen} onMouseLeave={dropdown.handleClose}>
    <Link href="/setores" className={/* existing classes */}>
      <span>Setores</span>
      <Icon name="chevron-down" className={/* existing classes */} />
    </Link>
    
    {dropdown.isOpen && (
      <div className="absolute left-0 mt-0 w-80 bg-white border border-gray-200 rounded-md py-1 z-10">
        <Link href="/setores" className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white">
          Todos os Setores
        </Link>
        
        {sectors.map((sector) => (
          <div key={sector.id}>
            <Link 
              href={`/setores/${sector.id}`}
              className="block px-4 py-2 text-sm font-medium text-cresol-gray-dark hover:bg-primary hover:text-white"
            >
              {sector.name}
            </Link>
            {subsectors[sector.id]?.map((subsector) => (
              <Link 
                key={subsector.id}
                href={`/subsetores/${subsector.id}`}
                className="block px-8 py-1.5 text-xs text-cresol-gray hover:bg-primary/10 hover:text-primary"
              >
                └ {subsector.name}
              </Link>
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
));
```

### Fase 3: Accessibility Enhancement (2-3 horas)
```typescript
// Adicionar ARIA support e keyboard navigation
const SectorsDropdown = memo(({ /* props */ }) => (
  <div 
    className="relative"
    onMouseEnter={dropdown.handleOpen}
    onMouseLeave={dropdown.handleClose}
  >
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={dropdown.isOpen}
      className={/* existing classes */}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          dropdown.handleToggle();
        }
      }}
    >
      <span>Setores</span>
      <Icon name="chevron-down" className={/* existing classes */} />
    </button>
    
    {dropdown.isOpen && (
      <div 
        role="menu"
        className={/* existing classes */}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            dropdown.handleClose();
          }
        }}
      >
        {/* Menu items with role="menuitem" */}
      </div>
    )}
  </div>
));
```

## ✅ Success Metrics

1. **Usability:** Redução de cliques para acessar sub-setores (2 clicks → 1 click)
2. **Accessibility:** 100% keyboard navigation e screen reader compatibility
3. **Performance:** Tempo de carregamento dropdown ≤ 200ms
4. **User Experience:** Feedback visual claro em hover states
5. **Consistency:** Padrões visuais alinhados com Cresol brand guidelines

## 🎯 Conclusão

A implementação da navegação hierárquica deve seguir uma abordagem progressiva, começando com cards clicáveis (quick win) e evoluindo para dropdown hierárquico completo. O foco deve ser em usabilidade, acessibilidade e consistency com o design system existente do Portal Cresol.

**Próximos Steps:**
- Implementar cards clicáveis nos sub-setores
- Estender dropdown do navbar com hierarquia
- Testar accessibility e keyboard navigation
- Otimizar performance e responsive behavior

---
*Este documento serve como referência técnica para implementação da navegação hierárquica organizacional no Portal Cresol, baseado em best practices 2024 e requirements específicos do projeto.*