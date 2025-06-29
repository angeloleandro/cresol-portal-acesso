# 🎨 Guia de Estilo e Padronização de UI/UX
## Portal Cresol - Sistema de Design Unificado

---

## 📋 Índice

1. [Filosofia de Design](#filosofia-de-design)
2. [Paleta de Cores](#paleta-de-cores)
3. [Tipografia](#tipografia)
4. [Componentes](#componentes)
5. [Layout e Grid](#layout-e-grid)
6. [Iconografia](#iconografia)
7. [Tom de Voz](#tom-de-voz)
8. [Estados de Interação](#estados-de-interação)
9. [Diretrizes Técnicas](#diretrizes-técnicas)

---

## 🎯 Filosofia de Design

### Princípios Fundamentais

**Organização Minimalista**: O design deve ser moderno, minimalista e extremamente organizado. A interface deve ser limpa, com foco no conteúdo e na clareza.

**Profissionalismo**: Transmitir confiança, seriedade e competência através de um design corporativo refinado.

**Humanização**: Apesar do tom profissional, manter uma linguagem acessível e humanizada para criar conexão com os usuários.

**Consistência**: Padronização rigorosa de todos os elementos visuais para garantir uma experiência unificada.

**Acessibilidade**: Design inclusivo que atende às necessidades de todos os usuários.

---

## 🎨 Paleta de Cores

### Cores Primárias

```css
/* Laranja Cresol - Cor principal da marca */
--color-primary: #F58220;
--color-primary-dark: #E06D10;
--color-primary-light: #FF9A4D;

/* Verde Cresol - Uso limitado e estratégico */
--color-secondary: #005C46;
--color-secondary-dark: #004935;
--color-secondary-light: #007A5E;
```

### Cores Neutras Corporativas

```css
/* Sistema de cinzas profissional */
--color-gray: #727176;
--color-gray-light: #D0D0CE;
--color-gray-dark: #4A4A4A;

/* Cor específica para títulos */
--color-title: #616160;

/* Cores base */
--color-white: #FFFFFF;
--color-black: #000000;
```

### Cores Semânticas (Estados)

```css
/* Sucesso */
--color-success-background: #F0F9F4;
--color-success-text: #15803D;
--color-success-border: #BBF7D0;

/* Aviso */
--color-warning-background: #FFFBEB;
--color-warning-text: #D97706;
--color-warning-border: #FDE68A;

/* Erro */
--color-error-background: #FEF2F2;
--color-error-text: #DC2626;
--color-error-border: #FECACA;

/* Informação */
--color-info-background: #EFF6FF;
--color-info-text: #2563EB;
--color-info-border: #BFDBFE;
```

### Regras de Uso

1. **Proibido usar valores hardcoded**: Sempre referenciar através de variáveis CSS
2. **Laranja como protagonista**: Usar `--color-primary` para elementos de destaque e ações principais
3. **Verde com parcimônia**: Reservar `--color-secondary` apenas para elementos estratégicos
4. **Cinzas para hierarquia**: Usar a escala de cinzas para criar hierarquia visual
5. **Cores semânticas para feedback**: Usar apenas para indicar estados (sucesso, erro, aviso)

---

## ✍️ Tipografia

### Família de Fontes

```css
/* Fonte principal - Inter (Google Fonts) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Hierarquia Tipográfica

#### Títulos e Cabeçalhos

```css
/* H1 - Títulos principais */
.heading-1 {
  font-size: 2.5rem; /* 40px */
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-title);
}

/* H2 - Títulos de seção */
.heading-2 {
  font-size: 2rem; /* 32px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-title);
}

/* H3 - Subtítulos */
.heading-3 {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-title);
}

/* H4 - Títulos de componentes */
.heading-4 {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-title);
}
```

#### Texto Corpo

```css
/* Texto principal */
.body-text {
  font-size: 1rem; /* 16px */
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-gray-dark);
}

/* Texto pequeno */
.body-text-small {
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-gray);
}

/* Texto de destaque */
.body-text-bold {
  font-size: 1rem; /* 16px */
  font-weight: 600;
  line-height: 1.6;
  color: var(--color-gray-dark);
}
```

#### Labels e Elementos de Interface

```css
/* Labels de formulário */
.form-label {
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-gray-dark);
}

/* Texto de badges */
.badge-text {
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.025em;
}
```

---

## 🧩 Componentes

### 4.1. Botões

#### Regras Gerais
- Usar arredondamento padrão: `var(--border-radius-medium)`
- Transições suaves: `transition-colors duration-200`
- Altura mínima: 44px (acessibilidade para touch)

#### Variações

**Primário:**
```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-medium);
  transition: all 200ms ease-in-out;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 130, 32, 0.3);
}
```

**Secundário:**
```css
.btn-secondary {
  background-color: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-medium);
  transition: all 200ms ease-in-out;
}

.btn-secondary:hover {
  background-color: rgba(245, 130, 32, 0.05);
}
```

### 4.2. Badges

Badges são usadas para destacar informações importantes ou status de forma concisa.

#### Regras Gerais
- **Uso de Cores**: Devem utilizar exclusivamente as cores semânticas da paleta global
- **Arredondamento**: Aplicar `border-radius: 9999px` (totalmente arredondado)
- **Tipografia**: Utilizar `.badge-text` com peso médio

#### Variações e Uso

**Sucesso:**
```css
.badge-success {
  background-color: var(--color-success-background);
  color: var(--color-success-text);
  border: 1px solid var(--color-success-border);
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
```
*Uso: Para indicar a conclusão bem-sucedida de uma ação.*

**Aviso:**
```css
.badge-warning {
  background-color: var(--color-warning-background);
  color: var(--color-warning-text);
  border: 1px solid var(--color-warning-border);
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
```
*Uso: Para alertar sobre uma informação que requer atenção.*

**Erro:**
```css
.badge-error {
  background-color: var(--color-error-background);
  color: var(--color-error-text);
  border: 1px solid var(--color-error-border);
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
```
*Uso: Para sinalizar falhas ou status críticos.*

### 4.3. Cards

#### Card Padrão
```css
.card {
  background-color: var(--color-white);
  border-radius: var(--border-radius-large);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid rgba(210, 210, 206, 0.8);
  transition: all 200ms ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
```

#### Card de Status
```css
.card-status {
  background-color: rgba(249, 250, 251, 0.7);
  border: 1px solid rgba(210, 210, 206, 0.8);
  border-radius: var(--border-radius-large);
  padding: 1rem;
  text-align: center;
  transition: all 200ms ease-in-out;
}

.card-status:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### 4.4. Formulários

#### Input Padrão
```css
.input {
  width: 100%;
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-medium);
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-gray-dark);
  background-color: var(--color-white);
  transition: all 200ms ease-in-out;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(245, 130, 32, 0.1);
}
```

### 4.5. Estados de Carregamento

#### Spinner
```css
.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--color-gray-light);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 4.6. Alertas e Mensagens

#### Alert de Erro
```css
.alert-error {
  background-color: var(--color-error-background);
  color: var(--color-error-text);
  border: 1px solid var(--color-error-border);
  border-radius: var(--border-radius-medium);
  padding: 1rem;
  margin: 1rem 0;
}
```

---

## 📐 Layout e Grid

### Sistema de Grid Responsivo

#### Breakpoints
```css
/* Mobile First */
.container {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  margin: 0 auto;
}

/* Tablet - 768px */
@media (min-width: 48rem) {
  .container {
    max-width: 48rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* Desktop - 1024px */
@media (min-width: 64rem) {
  .container {
    max-width: 64rem;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

/* Large Desktop - 1280px */
@media (min-width: 80rem) {
  .container {
    max-width: 80rem;
  }
}
```

### Sistema de Espaçamento

#### Escala de Espaçamento (Baseada em múltiplos de 4px)
```css
:root {
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
}
```

### Bordas e Arredondamentos

```css
:root {
  --border-radius-small: 0.25rem;   /* 4px */
  --border-radius-medium: 0.5rem;   /* 8px */
  --border-radius-large: 0.75rem;   /* 12px */
  --border-radius-xl: 1rem;         /* 16px */
  --border-radius-full: 9999px;     /* Totalmente arredondado */
}
```

---

## 🎯 Iconografia

### Princípios dos Ícones

1. **Consistência Visual**: Todos os ícones devem seguir o mesmo estilo (outline, peso 1.5)
2. **Tamanho Padrão**: 24x24px como base, com variações em 16px, 20px, 32px
3. **Uso Estratégico**: Utilizar apenas quando agregarem valor à compreensão
4. **Mapeamento Centralizado**: Todos os ícones ficam em `/app/components/icons/`

### Mapa de Ícones do Sistema

#### Ícones de Usuário
- `UserIcon` - Usuário genérico
- `UserAddIcon` - Adicionar usuário
- `UserRemoveIcon` - Remover usuário
- `UserGroupIcon` - Grupo de usuários
- `UserCircleIcon` - Avatar circular
- `UserSquareIcon` - Avatar quadrado

#### Ícones de Interface
- `BellIcon` - Notificações
- `SearchIcon` - Busca
- `CloseIcon` - Fechar (X)
- `PlusIcon` - Adicionar
- `PencilIcon` - Editar
- `TrashIcon` - Excluir
- `CheckIcon` - Confirmar
- `ArrowLeftIcon` - Voltar

#### Ícones de Navegação
- `ExternalLinkIcon` - Link externo
- `FolderIcon` - Pasta
- `LinkIcon` - Link interno
- `MonitorIcon` - Sistema/Monitor

#### Ícones de Status
- `ClockIcon` - Tempo/Pendente
- `TriangleAlertIcon` - Aviso
- `SaveIcon` - Salvar

### Uso dos Ícones
```css
.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: currentColor;
  stroke-width: 1.5;
}

.icon-small {
  width: 1rem;
  height: 1rem;
}

.icon-large {
  width: 2rem;
  height: 2rem;
}
```

---

## 🗣️ Tom de Voz

### Diretrizes de Comunicação

#### Características da Linguagem
1. **Profissional**: Manter sempre um tom corporativo e respeitoso
2. **Clara**: Usar linguagem simples e direta, evitando jargões desnecessários
3. **Humanizada**: Apesar do profissionalismo, ser acessível e empática
4. **Confiável**: Transmitir segurança e competência em todas as comunicações

#### Exemplos Práticos

**✅ Correto:**
- "Sua solicitação foi enviada com sucesso"
- "Complete seu perfil para ter acesso completo ao sistema"
- "Encontramos alguns problemas. Tente novamente em alguns momentos"

**❌ Evitar:**
- "Solicitação enviada!" (muito informal)
- "Erro 404 - Not Found" (muito técnico)
- "Ops! Algo deu errado :(" (tom muito casual)

#### Mensagens de Sistema

**Carregamento:**
- "Carregando informações..."
- "Processando sua solicitação..."

**Sucesso:**
- "Operação realizada com sucesso"
- "Suas alterações foram salvas"

**Erro:**
- "Não foi possível completar a operação"
- "Verifique sua conexão e tente novamente"

**Vazio:**
- "Nenhum resultado encontrado"
- "Ainda não há informações disponíveis"

---

## ⚡ Estados de Interação

### Hover Effects

#### Botões
```css
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 200ms ease-out;
}
```

#### Cards
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 200ms ease-out;
}
```

### Focus States
```css
.interactive-element:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 130, 32, 0.2);
  border-color: var(--color-primary);
}
```

### Disabled States
```css
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## 🔧 Diretrizes Técnicas

### Implementação CSS

#### Variáveis CSS Obrigatórias
```css
:root {
  /* Cores */
  --color-primary: #F58220;
  --color-primary-dark: #E06D10;
  --color-secondary: #005C46;
  --color-gray: #727176;
  --color-gray-light: #D0D0CE;
  --color-gray-dark: #4A4A4A;
  --color-title: #616160;
  
  /* Espaçamento */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  /* Bordas */
  --border-radius-medium: 0.5rem;
  --border-radius-large: 0.75rem;
  
  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Classes Utilitárias Padrão

#### Layout
```css
.container { max-width: 80rem; margin: 0 auto; padding: 0 2rem; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.grid-responsive { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
```

#### Texto
```css
.text-primary { color: var(--color-primary); }
.text-title { color: var(--color-title); }
.text-muted { color: var(--color-gray); }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
```

### Organização de Arquivos CSS

1. **globals.css** - Variáveis, reset e classes base
2. **components.css** - Estilos de componentes específicos
3. **utilities.css** - Classes utilitárias reutilizáveis

### Boas Práticas Obrigatórias

1. **Zero Hardcoding**: Nunca usar valores diretos de cores, sempre variáveis
2. **Mobile First**: Sempre desenvolver primeiro para mobile
3. **Acessibilidade**: Manter contraste mínimo 4.5:1
4. **Performance**: Otimizar animações e transições
5. **Consistência**: Seguir rigorosamente este guia em todos os componentes

---

## 📝 Checklist de Implementação

### Para Novos Componentes
- [ ] Utiliza variáveis CSS para cores
- [ ] Implementa hover states apropriados
- [ ] É responsivo (mobile-first)
- [ ] Segue a hierarquia tipográfica
- [ ] Usa espaçamento consistente
- [ ] Inclui estados de loading/erro quando aplicável
- [ ] Atende critérios de acessibilidade

### Para Refatoração de Componentes Existentes
- [ ] Substitui cores hardcoded por variáveis
- [ ] Padroniza espaçamentos usando a escala definida
- [ ] Atualiza tipografia para hierarquia padrão
- [ ] Implementa estados de interação consistentes
- [ ] Otimiza para responsividade

---

## 🎯 Resultado Esperado

Ao seguir este guia, o Portal Cresol manterá:

- **Identidade Visual Unificada**: Aparência consistente em todo o sistema
- **Experiência Profissional**: Design corporativo que transmite confiança
- **Interface Moderna**: Layout limpo e organizado com foco na usabilidade
- **Manutenibilidade**: Código padronizado e facilmente escalável
- **Acessibilidade**: Interface inclusiva para todos os usuários

---

*Documento criado em Janeiro de 2025 | Versão 1.0*
*Para dúvidas ou sugestões de melhorias, consulte a equipe de desenvolvimento* 