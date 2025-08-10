# Guia de Migração de Botões - Portal Cresol

## StandardizedButton: Padrão Oficial

O `StandardizedButton` é o **único componente de botão** que deve ser usado no Portal Cresol. Localizado em `/app/components/admin/StandardizedButton.tsx`.

## Tabela de Equivalências

### Classes CSS → Props StandardizedButton

| **Classe CSS Atual** | **StandardizedButton Equivalente** | **Exemplo** |
|----------------------|-------------------------------------|-------------|
| `btn-primary` | `variant="primary"` | ✅ Ação principal |
| `bg-primary text-white` | `variant="primary"` | ✅ Botão laranja Cresol |
| `bg-gray-600 text-white` | `variant="secondary"` | ✅ Ação secundária |
| `bg-red-600 text-white` | `variant="danger"` | ❌ Ações destrutivas |
| `border border-primary text-primary` | `variant="outline"` | ⚪ Ação alternativa |
| `bg-transparent text-primary` | `variant="ghost"` | 👻 Ação sutil |
| `text-primary hover:text-primary-dark` | `variant="link"` | 🔗 Link de ação |
| `bg-green-600 text-white` | `variant="success"` | ✅ Confirmações |
| `bg-yellow-500 text-white` | `variant="warning"` | ⚠️ Avisos |
| `bg-blue-600 text-white` | `variant="info"` | ℹ️ Informacional |

### Tamanhos

| **Classes CSS** | **StandardizedButton** | **Uso** |
|-----------------|------------------------|---------|
| `px-2 py-1 text-xs` | `size="xs"` | Elementos compactos |
| `px-3 py-2 text-sm` | `size="sm"` | Espaços reduzidos |
| `px-4 py-2.5 text-sm` | `size="md"` | **Padrão principal** |
| `px-6 py-3 text-base` | `size="lg"` | Para destaque |
| `px-8 py-4 text-lg` | `size="xl"` | CTAs principais |

### Modificadores

| **Classe CSS** | **StandardizedButton** | **Exemplo** |
|----------------|------------------------|-------------|
| `w-full` | `fullWidth={true}` | Largura total |
| `disabled:opacity-50` | `disabled={true}` | Estado desabilitado |
| `flex items-center` | `icon={<Icon />}` | Com ícone |

## Padrões de Migração

### ANTES (❌ Inconsistente)
```tsx
<button className="btn-primary flex items-center">
  <Icon name="calendar" />
  Adicionar ao calendário
</button>

<button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5">
  Compartilhar
</button>
```

### DEPOIS (✅ Padronizado)
```tsx
<StandardizedButton 
  variant="primary"
  icon={<Icon name="calendar" className="h-5 w-5" />}
  iconPosition="left"
>
  Adicionar ao calendário
</StandardizedButton>

<StandardizedButton 
  variant="outline"
  icon={<Icon name="share" className="h-5 w-5" />}
  iconPosition="left"
>
  Compartilhar
</StandardizedButton>
```

## Recursos Avançados

### Estados de Loading
```tsx
<StandardizedButton 
  variant="primary"
  loading={isSubmitting}
  disabled={!isValid}
>
  {isSubmitting ? 'Salvando...' : 'Salvar'}
</StandardizedButton>
```

### Como Link
```tsx
<StandardizedButton 
  as={Link}
  href="/admin/users"
  variant="secondary"
>
  Gerenciar Usuários
</StandardizedButton>
```

### Com Link Externo
```tsx
<StandardizedButton 
  href="https://external-site.com"
  target="_blank"
  variant="outline"
  icon={<Icon name="external-link" className="h-4 w-4" />}
>
  Site Externo
</StandardizedButton>
```

## Ícones

### ANTES (❌ Formato antigo)
```tsx
<MinimalistButton icon="users" variant="primary">
  Usuários
</MinimalistButton>
```

### DEPOIS (✅ Formato correto)
```tsx
<StandardizedButton 
  variant="primary"
  icon={<Icon name="users" className="h-4 w-4" />}
  iconPosition="left"
>
  Usuários
</StandardizedButton>
```

## Componentes Substituídos

### ❌ REMOVIDOS
- `MinimalistButton` → Use `StandardizedButton`
- Botões customizados com classes hardcoded → Use `StandardizedButton`
- `btn-*` classes CSS → Use variants do `StandardizedButton`

## Arquivos Migrados

### ✅ CONCLUÍDO
- `/app/eventos/[id]/page.tsx` - Botões de ação principal
- `/app/components/NotificationCenter.tsx` - Sistema de notificações
- `/app/admin/analytics/page.tsx` - Eliminou MinimalistButton

### ⏳ PENDENTE (Prioridade Baixa)
- `/app/components/Navbar.tsx` - Botões de navegação (funcionalidade específica)
- `/app/components/VideoGallery/VideoGallery.EmptyState.tsx` - Estados vazios

## Design System

### Cores Cresol
- **Primary**: `#F58220` (Laranja Cresol) - Ações principais
- **Secondary**: Cinza escuro - Ações secundárias
- **Danger**: Vermelho - Ações destrutivas
- **Success**: Verde - Confirmações

### Acessibilidade
- Focus states automáticos
- Support para screen readers
- Estados disabled apropriados
- Contraste adequado (WCAG 2.1 AA)

## Validação

### Checklist de Migração
- [ ] Import `StandardizedButton` adicionado
- [ ] Todas as props mapeadas corretamente
- [ ] Ícones no formato `<Icon name="..." className="h-X w-X" />`
- [ ] Variant apropriada para o contexto
- [ ] Size adequado para o espaço
- [ ] Funcionalidade preservada
- [ ] Estilos visuais mantidos

### Teste de Regressão
1. Verificar se todos os botões mantêm funcionalidade original
2. Confirmar que estilos visuais são consistentes
3. Testar estados (hover, focus, disabled)
4. Validar acessibilidade
5. Confirmar responsividade

---

**Responsável**: Sistema de Modernização Frontend - Portal Cresol  
**Data**: 2025-01-10  
**Status**: ✅ Migração Crítica Concluída