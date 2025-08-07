# DESIGN SYSTEM - CRESOL PORTAL

Sistema de design padronizado para o Portal de Acesso Interno da Cresol.

## Visão Geral

Este design system garante consistência visual e funcional em todas as páginas admin do portal, utilizando os padrões modernos implementados nas páginas de **Gerenciar Notificações** e **Gerenciamento de Setores**.

---

## Princípios de Design

### 1. **Hierarquia Visual Clara**
- Uso consistente de tipografia e espaçamento
- Cards para organização de conteúdo
- Ícones contextuais em todos os elementos

### 2. **Interação Intuitiva** 
- Feedback visual imediato para todas as ações
- Hover effects e micro-animações
- Estados visuais claros (loading, success, error)

### 3. **Consistência de Marca**
- Paleta Cresol (Laranja #F58220, Verde #005C46)
- Aplicação consistente das cores corporativas
- Manutenção da identidade visual

### 4. **Acessibilidade**
- Contraste adequado em todos os elementos
- Labels descritivos e ícones contextuais  
- Navegação por teclado funcional

---

## Paleta de Cores

### Cores Primárias
```css
--color-primary: #F58220;        /* Laranja Cresol */
--color-primary-dark: #E06D10;
--color-primary-light: #FF9A4D;

```

### Cores Neutras
```css
--color-cresol-gray: #727176;         /* Cinza médio */
--color-cresol-gray-light: #D0D0CE;   /* Cinza claro */  
--color-cresol-gray-dark: #4A4A4A;    /* Cinza escuro */
```

### Cores Semânticas
```css
--color-success: #15803D;        /* Verde sucesso */
--color-warning: #D97706;        /* Amarelo alerta */
--color-error: #DC2626;          /* Vermelho erro */
--color-info: #2563EB;           /* Azul informação */
```

---

## Componentes Base

### 1. **SectionHeader**
```tsx
<SectionHeader 
  title="Gerenciar Notificações"
  description="Envie mensagens e gerencie grupos de notificação"
  icon={<SendIcon />}
  stats={[
    { label: "Total Grupos", value: groups.length },
    { label: "Usuários Ativos", value: users.length, color: "secondary" }
  ]}
  actions={<button className="btn-primary">Nova Ação</button>}
/>
```

### 2. **FormCard**
```tsx
<FormCard
  title="Nova Notificação"
  description="Configure e envie mensagens para grupos ou usuários específicos"
  icon={<SendIcon />}
  onSubmit={handleSubmit}
>
  {/* Conteúdo do formulário */}
</FormCard>
```

### 3. **StatusBadge**
```tsx
<StatusBadge type="priority" value="high" size="md" />
<StatusBadge type="notification-type" value="message" />
<StatusBadge type="status" value="active" />
```

### 4. **EmptyState**
```tsx
<EmptyState
  icon={<GroupIcon />}
  title="Nenhum grupo encontrado"
  description="Organize seus usuários em grupos para facilitar o envio de notificações direcionadas."
  action={{
    label: "Criar Primeiro Grupo",
    onClick: () => setShowCreateGroup(true),
    variant: "secondary"
  }}
/>
```

---

## Layout Patterns

### Background Layout
```css
.page-background {
  background: var(--color-cresol-gray-light) / 30%;
  min-height: 100vh;
}
```

### Container Principal
```css
.main-container {
  max-width: 7xl;
  margin: 0 auto;
  padding: 2rem;
}
```

### Card Moderno
```css
.modern-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid var(--color-cresol-gray-light);
  padding: 2rem;
  transition: all 0.2s ease;
}

.modern-card:hover {
  border-color: var(--color-primary) / 30%;
  transform: translateY(-2px);
}
```

---

## Formulários

### Structure Pattern
```tsx
<div className="space-y-8">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <FormField 
      label="Título da Notificação"
      icon={<EditIcon />}
      required
    >
      <input className="input focus:ring-primary/20 focus:border-primary" />
    </FormField>
  </div>
</div>
```

### Form Labels
```css
.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-cresol-gray-dark);
  margin-bottom: 0.75rem;
}
```

### Input Styling
```css
.input {
  width: 100%;
  border: 1px solid var(--color-cresol-gray-light);
  border-radius: 0.5rem;
  padding: 0.75rem;
  min-height: 44px;
  transition: all 200ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary) / 20%;
}
```

---

## Botões

### Primary Button
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 200ms ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}
```

### Secondary Button  
```css
.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  /* ... resto similar ao primary */
}
```

### Outline Button
```css
.btn-outline {
  background: transparent;
  color: var(--color-cresol-gray-dark);
  border: 1px solid var(--color-cresol-gray-light);
  /* ... resto similar aos outros */
}
```

---

## Sistema de Tags/Badges

### Priority Badges
- **Baixa** - `bg-green-50 text-green-700 border-green-200`
- **Normal** - `bg-blue-50 text-blue-700 border-blue-200`
- **Alta** - `bg-orange-50 text-orange-700 border-orange-200`
- **Urgente** - `bg-red-50 text-red-700 border-red-200`

### Type Badges  
- **Mensagem** - `bg-blue-50 text-blue-700`
- **Sistema** - `bg-gray-50 text-gray-700`
- **Notícia** - `bg-green-50 text-green-700`
- **Evento** - `bg-purple-50 text-purple-700`

---

## Tabs Modernas

```tsx
<div className="border-b border-cresol-gray-light">
  <nav className="-mb-px flex space-x-8">
    <button className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
      active ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-cresol-gray hover:text-cresol-gray-dark'
    }`}>
      <Icon />
      Label
      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Count</span>
    </button>
  </nav>
</div>
```

---

## Cards Grid

### Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-xl border border-cresol-gray-light hover:border-secondary/30 transition-all p-6 group">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Hover Effects
```css
.card-hover {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary) / 30%;
}
```

---

## Ícones

### Uso Contextual
- **Notificações** - Send, Bell, Mail icons  
- **Grupos** - Users, Group, Team icons
- **Setores** - Building, Organization icons
- **Sistema** - Settings, Gear, Config icons
- **Dados** - Chart, Stats, Analytics icons

### Sizes
- **sm**: 16px (w-4 h-4)
- **md**: 20px (w-5 h-5) 
- **lg**: 24px (w-6 h-6)
- **xl**: 32px (w-8 h-8)

---

## Responsividade

### Breakpoints
```css
/* Mobile First Approach */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Tablet - 768px+ */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop - 1024px+ */ 
@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Animações e Transições

### Standard Transitions
```css
.smooth-transition {
  transition: all 200ms ease-in-out;
}

.hover-lift {
  transition: transform 200ms ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}
```

### Micro-interactions
```css
.button-press {
  transition: all 100ms ease;
}

.button-press:active {
  transform: scale(0.98);
}
```

---

## Checklist de Implementação

### ✅ Aplicado nas Páginas
- [x] Gerenciar Notificações - Totalmente modernizada
- [x] Gerenciamento de Setores - Já estava moderna
- [ ] Outras páginas admin (aplicar gradualmente)

### ✅ Componentes Criados
- [x] StatusBadge
- [x] FormCard  
- [x] EmptyState
- [x] SectionHeader

### Próximos Passos
1. Aplicar padrões em outras páginas admin
2. Expandir biblioteca de componentes reutilizáveis
3. Documentar mais patterns conforme necessário
4. Criar testes visuais para consistência

---

## Referências de Uso

### Página de Referência Principal
Ver: `/admin/notifications/page.tsx` - implementação completa dos padrões

### Componentes Base
Ver: `/components/ui/` - componentes reutilizáveis criados

---

*Este design system é um documento vivo e deve ser atualizado conforme novos padrões são implementados e refinados.*