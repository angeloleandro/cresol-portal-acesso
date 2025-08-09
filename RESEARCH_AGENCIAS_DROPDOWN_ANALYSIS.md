# Pesquisa: Reestruturação Navbar - Análise do Setor "Agências"

**Data:** 2025-08-08  
**Contexto:** Separação do setor "Agências" do dropdown "Setores" para criar link independente na navbar  
**Arquivos Relacionados:** `/app/components/Navbar.tsx`, `/hooks/useOptimizedNavbar.ts`

## 🎯 Objetivo
Conduzir análise técnica sistemática para implementar dropdown independente "Agências" na navbar, separando-o do dropdown "Setores" atual.

## 📋 Resumo Executivo

A investigação revelou estrutura completa do setor "Agências" no Portal Cresol, confirmando viabilidade técnica para implementação do dropdown independente. O setor "Agências" possui **31 sub-setores** representando agências físicas distribuídas geograficamente, justificando separação devido ao volume significativo e natureza específica.

### Descobertas Principais:
- **Setor "Agências"**: ID = `5463d1ba-c290-428e-b39e-d7ad9c66eb71`
- **31 sub-setores**: Todas agências físicas distribuídas por PR, ES, SP, SC
- **Padrões arquiteturais**: Componentes SectorsDropdown e GalleryDropdown como templates
- **Hook otimizado**: useOptimizedSectors já implementado com cache inteligente

## 🔍 Achados Principais

### 1. Database Analysis - Setor "Agências"

**Status Atual:**
```
✅ SETOR IDENTIFICADO:
- ID: 5463d1ba-c290-428e-b39e-d7ad9c66eb71
- Nome: "Agências" 
- Descrição: "Gerencia a operação e o atendimento nas unidades físicas."
- Total Sub-setores: 31
```

**Sub-setores de Agências:**
- **Região PR (14 agências)**: Ampére, Barracão, Bela Vista da Caroba, Capanema, Ibaiti, Pérola d'Oeste, Pinhal de São Bento, Planalto, Pranchita, Realeza, Santa Izabel d'Oeste, Santo Antônio do Sudoeste
- **Região ES (12 agências)**: Colatina (2 unidades), Governador Lindenberg, Mantenópolis, Marilândia, Muniz Freire, Muqui, Nova Venécia, Pancas, Pinheiros, São Gabriel da Palha, Vila Valério
- **Região SP (4 agências)**: Apiaí, Capão Bonito, Itapeva, São José dos Campos
- **Região SC (2 agências)**: São José do Cedro, São Miguel do Oeste
- **Digital (1 agência)**: Agência Digital Conecta

### 2. Current Implementation Analysis

**Estrutura Atual do Dropdown "Setores":**
```typescript
// hooks/useOptimizedNavbar.ts - useOptimizedSectors()
// Retorna TODOS os 5 setores incluindo "Agências"
sectors: [
  "Administrativo" (5 subsectors),
  "Agências" (31 subsectors), ← ALVO DA SEPARAÇÃO
  "Comunicação & Marketing" (1 subsector),
  "Institucional" (4 subsectors),
  "Negócios" (9 subsectors)
]
```

**Rendering Pattern no SectorsDropdown:**
```typescript
// app/components/Navbar.tsx - linhas 94-124
{sectors.map((sector) => (
  <div key={sector.id}>
    <Link href={`/setores/${sector.id}`}>
      {sector.name} ← Inclui "Agências" aqui
    </Link>
    {sector.subsectors?.map((subsector) => (
      <Link href={`/subsetores/${subsector.id}`}>
        ↳ {subsector.name} ← 31 agências listadas aqui
      </Link>
    ))}
  </div>
))}
```

### 3. Architecture Patterns Analysis

**Template Pattern - SectorsDropdown (linhas 59-127):**
```typescript
const SectorsDropdown = memo(({ pathname, sectors, dropdown }) => (
  <div onMouseEnter={dropdown.handleOpen} onMouseLeave={dropdown.handleClose}>
    <Link href="/setores">Setores</Link>
    {dropdown.isOpen && (
      <div className="dropdown-menu">
        <Link href="/setores">Todos os Setores</Link>
        {sectors.map(sector => (
          // Sector + subsectors rendering
        ))}
      </div>
    )}
  </div>
));
```

**Template Pattern - GalleryDropdown (linhas 130-172):**
```typescript
const GalleryDropdown = memo(({ pathname, dropdown }) => (
  <div onMouseEnter={dropdown.handleOpen} onMouseLeave={dropdown.handleClose}>
    <button>Galeria</button>
    {dropdown.isOpen && (
      <div className="dropdown-menu">
        <Link href="/galeria">Galeria de Imagens</Link>
        <Link href="/videos">Galeria de Vídeos</Link>
      </div>
    )}
  </div>
));
```

## 🏗️ Architectural Planning

### 1. Component Architecture Design

**AgenciesDropdown Component Pattern:**
```typescript
const AgenciesDropdown = memo(({ pathname, agenciesSubsectors, dropdown }) => (
  <div onMouseEnter={dropdown.handleOpen} onMouseLeave={dropdown.handleClose}>
    <Link href="/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71">
      Agências
    </Link>
    {dropdown.isOpen && (
      <div className="dropdown-menu">
        <Link href="/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71">
          Todas as Agências
        </Link>
        <div className="border-t border-gray-100 mt-1 pt-1">
          {agenciesSubsectors.map(agency => (
            <Link href={`/subsetores/${agency.id}`}>
              {agency.name}
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
));
```

### 2. Hook Modifications Strategy

**New Hook - useOptimizedAgencies:**
```typescript
export function useOptimizedAgencies(userRole?: string, userId?: string) {
  const [agenciesSubsectors, setAgenciesSubsectors] = useState<Subsector[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencies = useCallback(async () => {
    // Cache key específico para agências
    const cacheKey = `agencies_${userRole}_${userId}`;
    
    // Query específica para setor Agências
    const { data } = await supabase
      .from('subsectors')
      .select('id, name, description, sector_id')
      .eq('sector_id', '5463d1ba-c290-428e-b39e-d7ad9c66eb71')
      .order('name');
      
    setAgenciesSubsectors(data || []);
  }, [userRole, userId]);

  return { agenciesSubsectors, loading };
}
```

**Modified Hook - useOptimizedSectors (filtered):**
```typescript
export function useOptimizedSectors(userRole?: string, userId?: string, excludeAgencies = false) {
  // Existing implementation with filter option
  const sectorsData = data || [];
  
  if (excludeAgencies) {
    // Filter out "Agências" sector
    const filteredSectors = sectorsData.filter(
      sector => sector.id !== '5463d1ba-c290-428e-b39e-d7ad9c66eb71'
    );
    setSectors(filteredSectors);
  } else {
    setSectors(sectorsData);
  }
}
```

### 3. Navbar Integration Plan

**Desktop Menu Modification (linha 517):**
```typescript
// Current structure
<nav className="flex space-x-4 mr-4">
  <Link href="/home">Home</Link>
  <SectorsDropdown sectors={sectors} /> ← Modificar para excluir Agências
  <AgenciesDropdown agenciesSubsectors={agenciesSubsectors} /> ← NOVO
  <GalleryDropdown />
  <Link href="/eventos?view=calendar">Calendário</Link>
  <Link href="/sistemas">Sistemas</Link>
</nav>
```

**Mobile Menu Integration (linha 635):**
```typescript
// Adicionar dropdown móvel para Agências após Setores
<div>
  {/* Existing Setores mobile dropdown */}
</div>

<div> ← NOVO mobile dropdown para Agências
  <div className="flex items-center justify-between py-2" onClick={toggleMobileAgencies}>
    <Link href="/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71">Agências</Link>
    {agenciesSubsectors.length > 0 && (
      <Icon name="chevron-down" className={`h-4 w-4 ${isMobileAgenciesOpen ? 'rotate-180' : ''}`} />
    )}
  </div>
  {/* Render agencies list */}
</div>
```

## 📋 Technical Requirements

### 1. Performance Considerations

**Cache Strategy:**
- **Separate cache**: Agências terão cache independente com TTL específico
- **Reduced payload**: Hook SectorsDropdown terá 31 items a menos (62% redução no volume)
- **Parallel loading**: Agências e Setores podem ser carregados em paralelo

**Bundle Impact:**
- **Component size**: +~2KB para AgenciesDropdown component
- **Hook overhead**: +~1KB para useOptimizedAgencies hook
- **Net performance**: Melhoria devido à separação de concerns

### 2. Query Optimization

**Efficient Queries:**
```sql
-- Current query (busca todos os setores + subsectors)
SELECT s.*, sub.* FROM sectors s 
LEFT JOIN subsectors sub ON s.id = sub.sector_id 
ORDER BY s.name, sub.name;

-- New optimized queries (parallel)
-- Query 1: Setores sem Agências
SELECT s.*, sub.* FROM sectors s 
LEFT JOIN subsectors sub ON s.id = sub.sector_id 
WHERE s.id != '5463d1ba-c290-428e-b39e-d7ad9c66eb71'
ORDER BY s.name, sub.name;

-- Query 2: Apenas subsectors de Agências
SELECT * FROM subsectors 
WHERE sector_id = '5463d1ba-c290-428e-b39e-d7ad9c66eb71' 
ORDER BY name;
```

### 3. TypeScript Interfaces

**New Interfaces Needed:**
```typescript
interface AgencySubsector {
  id: string;
  name: string; 
  description?: string;
  sector_id: string;
}

interface AgenciesDropdownProps {
  pathname: string;
  agenciesSubsectors: AgencySubsector[];
  dropdown: ReturnType<typeof useOptimizedDropdown>;
}
```

## 🔗 Implementation Roadmap

### Phase 1: Backend/Hook Layer (2-3 hours)
1. **Create useOptimizedAgencies hook** with caching
2. **Modify useOptimizedSectors** to support excludeAgencies flag
3. **Update cache keys** and invalidation logic
4. **Test data fetching** and performance

### Phase 2: Component Layer (2-3 hours) 
1. **Create AgenciesDropdown component** following GalleryDropdown pattern
2. **Implement mobile version** with state management
3. **Update TypeScript interfaces** and props
4. **Add hover/click interactions** consistent with existing dropdowns

### Phase 3: Navbar Integration (1-2 hours)
1. **Integrate AgenciesDropdown** in desktop navbar
2. **Add mobile menu section** for Agências 
3. **Update state management** (add mobile toggle states)
4. **Test responsive behavior** and interactions

### Phase 4: Testing & Validation (1-2 hours)
1. **Validate all 31 agencies** load correctly
2. **Test mobile/desktop** switching behavior
3. **Verify performance improvements** with separate caching
4. **Cross-browser compatibility** testing

### Phase 5: Optimization (1 hour)
1. **Code splitting** if needed for bundle optimization
2. **Cache warming strategies** for first load
3. **Error handling** and fallback states
4. **Accessibility testing** and improvements

## 📊 Expected Results

### Performance Improvements
- **SectorsDropdown payload**: Redução de ~62% (31 items menos)
- **Initial load**: Parallel fetching de Setores e Agências
- **Cache efficiency**: Cache dedicado para dados de Agências
- **Memory usage**: Melhor gerenciamento de estado com separação

### UX Benefits
- **Better organization**: Agências claramente separadas dos outros setores
- **Improved navigation**: Acesso direto às 31 agências sem scrolling
- **Visual clarity**: Dropdown "Setores" mais focado (4 setores vs 5)
- **Mobile experience**: Melhor usabilidade em dispositivos móveis

### Maintenance Benefits
- **Separation of concerns**: Agências gerenciadas independentemente
- **Scalability**: Facilita futuras expansões (filtros por região, busca)
- **Code clarity**: Componentes especializados e focused responsibility
- **Testing**: Testes independentes para cada dropdown

## 🔧 Next Steps

### Imediato (Alta Prioridade):
1. **Implementar useOptimizedAgencies hook** com cache dedicado
2. **Criar AgenciesDropdown component** seguindo patterns existentes
3. **Modificar SectorsDropdown** para excluir setor Agências

### Curto Prazo (Melhorias importantes):
1. **Integrar mobile navigation** para Agências dropdown  
2. **Implementar testes automatizados** para novos componentes
3. **Otimizar performance** com estratégias de cache avançadas

### Médio Prazo (Optimizações estratégicas):
1. **Adicionar filtros regionais** para agências (PR, ES, SP, SC)
2. **Implementar busca interna** dentro do dropdown Agências
3. **Considerar lazy loading** para lista grande de agências

---

**🔗 Fontes e Referências**

**Database**: Supabase - Portal Cresol  
**Setor Target**: "Agências" (ID: `5463d1ba-c290-428e-b39e-d7ad9c66eb71`)  
**Subsectors**: 31 agências físicas + 1 agência digital  
**Patterns**: SectorsDropdown, GalleryDropdown, useOptimizedDropdown  
**Hooks**: useOptimizedSectors, useOptimizedDropdown, useOptimizedNavbar