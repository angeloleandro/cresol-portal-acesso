# HeroUI Figma Kit - Referência Completa

## 📋 Visão Geral

**HeroUI** (anteriormente NextUI) é uma biblioteca de componentes React moderna, rápida e acessível, construída sobre Tailwind CSS e React Aria. O **HeroUI Figma Kit** é um recurso de design abrangente que contém a base do sistema de design HeroUI.

### Informações Básicas
- **Status**: Em desenvolvimento contínuo
- **Disponibilidade**: Gratuito na Figma Community
- **Acesso**: [Figma Community - HeroUI Kit](https://www.figma.com/community/file/1267584376234254760/heroui-figma-kit-community)
- **Framework**: Otimizado para React
- **Licença**: Uso pessoal e comercial permitido

---

## 🎨 Design System

### Filosofia do Design
- **Acessibilidade**: Foco em WCAG e boas práticas
- **Responsividade**: Design mobile-first
- **Modernidade**: Componentes contemporâneos e elegantes
- **Performance**: Otimizado para velocidade e eficiência
- **Flexibilidade**: Altamente customizável

---

## 🌈 Sistema de Cores

### Cores Comuns (Common Colors)
Cores consistentes entre temas:
- **White**: `#FFFFFF`
- **Black**: `#000000`

### Paletas de Cores Base
Cada paleta possui escala de 50-900:
- **Blue**: Azul padrão
- **Purple**: Roxo/Violeta  
- **Green**: Verde
- **Red**: Vermelho
- **Pink**: Rosa
- **Yellow**: Amarelo
- **Cyan**: Ciano
- **Zinc**: Cinza neutro

### Cores Semânticas
Adaptam-se dinamicamente aos temas (light/dark):

#### Layout Colors
- **Background**: Cor de fundo principal
- **Foreground**: Cor de texto principal  
- **Divider**: Cor dos separadores
- **Focus**: Cor de foco/destaque

#### Content Colors  
- **Content1**: Texto primário
- **Content2**: Texto secundário
- **Content3**: Texto terciário
- **Content4**: Texto quaternário

#### Brand Colors
- **Default**: Cor padrão (escala 50-900)
- **Primary**: Cor primária da marca (escala 50-900)
- **Secondary**: Cor secundária (escala 50-900)
- **Success**: Verde de sucesso (escala 50-900)
- **Warning**: Amarelo de aviso (escala 50-900)
- **Danger**: Vermelho de erro (escala 50-900)

### Exemplo de Configuração de Cores
```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              DEFAULT: "#006FEE",
              foreground: "#FFFFFF"
            },
            danger: {
              DEFAULT: "#F31260",
              foreground: "#FFFFFF"
            }
          }
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ECEDEE",
            primary: {
              DEFAULT: "#006FEE", 
              foreground: "#FFFFFF"
            }
          }
        }
      }
    })
  ]
}
```

---

## 📝 Sistema de Tipografia

### Escalas de Fonte
- **tiny**: `0.75rem` (12px)
- **small**: `0.875rem` (14px)  
- **medium**: `1rem` (16px)
- **large**: `1.125rem` (18px)

### Alturas de Linha (Line Heights)
- **tiny**: `1rem`
- **small**: `1.25rem`
- **medium**: `1.5rem`  
- **large**: `1.75rem`

### Famílias de Fonte
Integração com system fonts e fontes web modernas, seguindo as melhores práticas de performance.

---

## 📐 Sistema de Espaçamento e Layout

### Border Radius
- **small**: `8px`
- **medium**: `12px`
- **large**: `14px`

### Border Width  
- **small**: `1px`
- **medium**: `2px` (padrão)
- **large**: `3px`

### Opacidades
- **Disabled Opacity**: `0.5`
- **Hover Opacity Light**: `0.8`
- **Hover Opacity Dark**: `0.9`

### Dividers
- **Weight**: `1px` (padrão)

### Sistema de Sombras
Sombras em três níveis (small, medium, large) com variações para temas claro e escuro, usando RGB com opacidades variadas para profundidade e sutileza.

---

## 🧩 Componentes Disponíveis

### Input & Forms
- **Input**: Campo de texto básico
- **Textarea**: Área de texto multilinha
- **Select**: Dropdown de seleção
- **Checkbox**: Caixa de seleção
- **Checkbox Group**: Grupo de checkboxes
- **Radio Group**: Grupo de radio buttons
- **Switch**: Interruptor on/off
- **Slider**: Controle deslizante
- **Number Input**: Campo numérico
- **Input OTP**: Campo de código OTP

### Date & Time
- **Date Input**: Entrada de data
- **Date Picker**: Seletor de data
- **Date Range Picker**: Seletor de período
- **Time Input**: Entrada de tempo
- **Calendar**: Calendário completo
- **Range Calendar**: Calendário de período

### Navegação
- **Navbar**: Barra de navegação
- **Breadcrumbs**: Migalhas de pão
- **Pagination**: Paginação
- **Tabs**: Abas/Guias
- **Link**: Links customizados

### Layout & Containers
- **Card**: Cartões de conteúdo
- **Divider**: Separadores visuais
- **Spacer**: Espaçadores
- **Scroll Shadow**: Sombra de scroll

### Overlays & Modals
- **Modal**: Janelas modais
  - **ModalContent**: Wrapper do conteúdo
  - **ModalHeader**: Cabeçalho do modal
  - **ModalBody**: Corpo do modal  
  - **ModalFooter**: Rodapé do modal
- **Dropdown**: Menus dropdown
- **Popover**: Balões informativos
- **Tooltip**: Dicas contextuais
- **Drawer**: Gavetas laterais

### Data Display
- **Table**: Tabelas de dados
- **Avatar**: Imagens de perfil
  - **AvatarGroup**: Grupo de avatares
  - **AvatarIcon**: Ícone de fallback
- **Badge**: Emblemas e indicadores
- **Chip**: Tags removíveis
- **Code**: Código formatado
- **Snippet**: Trechos de código copiáveis
- **User**: Componente de usuário completo
- **Image**: Imagens responsivas

### Actions & Interactive
- **Button**: Botões de ação
- **Accordion**: Painéis expansíveis
- **Listbox**: Lista selecionável

### Feedback & Status
- **Alert**: Alertas e avisos
- **Toast**: Notificações temporárias
- **Progress**: Barras de progresso
- **Circular Progress**: Progresso circular
- **Spinner**: Indicadores de carregamento
- **Skeleton**: Placeholders de carregamento

### Search & Filter
- **Autocomplete**: Campo de autocompletar

### Utility
- **Kbd**: Teclas do teclado
- **Form**: Wrapper de formulário

---

## 🎯 Variantes e Estados dos Componentes

### Variantes Principais
- **solid**: Preenchimento sólido
- **bordered**: Apenas bordas
- **light**: Cor suave/clara
- **flat**: Sem elevação
- **faded**: Opacidade reduzida
- **shadow**: Com sombra

### Estados Interativos
- **default**: Estado padrão
- **hover**: Estado de hover
- **pressed**: Estado pressionado
- **focus**: Estado de foco
- **disabled**: Estado desabilitado
- **loading**: Estado de carregamento

### Tamanhos (Sizes)
- **sm**: Pequeno
- **md**: Médio (padrão)
- **lg**: Grande

### Cores Temáticas
- **default**: Cor padrão
- **primary**: Cor primária
- **secondary**: Cor secundária
- **success**: Verde de sucesso
- **warning**: Amarelo de aviso
- **danger**: Vermelho de erro

---

## 🌙 Temas e Modo Escuro

### Sistema de Temas
- **Light Theme**: Tema claro padrão
- **Dark Theme**: Tema escuro
- **System**: Detecção automática do sistema
- **Custom Themes**: Temas personalizados

### Configuração de Tema
```javascript
// Exemplo de configuração de tema personalizado
{
  themes: {
    "custom-theme": {
      extend: "dark",
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          foreground: "#FFFFFF"
        },
        focus: "#FF6B35"
      }
    }
  }
}
```

---

## ⚙️ Configuração e Customização

### Instalação do Plugin Tailwind
```bash
npm install @heroui/react @heroui/theme
```

### Configuração Básica
```javascript
// tailwind.config.js
const {heroui} = require("@heroui/theme");

module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()]
}
```

### CSS Variables
As variáveis CSS seguem o formato:
```css
--heroui-colorname-shade
/* Exemplo: */
--heroui-primary-500
--heroui-background
--heroui-foreground
```

### Prefix Personalizado
```javascript
plugins: [
  heroui({
    prefix: "myui", // Muda de --heroui para --myui
  })
]
```

---

## 🔧 Tokens de Design

### Estrutura dos Tokens
- **Layout Tokens**: Espaçamento, tipografia, bordas
- **Color Tokens**: Todas as cores do sistema
- **Component Tokens**: Tokens específicos de componentes
- **Semantic Tokens**: Tokens com significado semântico

### Exemplo de Tokens CSS
```css
:root {
  /* Layout */
  --heroui-spacing-unit: 4px;
  --heroui-radius-small: 8px;
  --heroui-radius-medium: 12px;
  --heroui-radius-large: 14px;
  
  /* Typography */
  --heroui-font-size-tiny: 0.75rem;
  --heroui-font-size-small: 0.875rem;
  --heroui-font-size-medium: 1rem;
  --heroui-font-size-large: 1.125rem;
  
  /* Colors */
  --heroui-primary: 0 111 238;
  --heroui-primary-foreground: 255 255 255;
  --heroui-secondary: 156 163 175;
  --heroui-success: 34 197 94;
  --heroui-warning: 251 191 36;
  --heroui-danger: 244 63 94;
}
```

---

## 🎨 Ícones e Assets

### Sistema de Ícones
O HeroUI não inclui um sistema de ícones próprio, mas é comumente usado com:

- **Heroicons**: Ícones SVG criados pelos makers do Tailwind CSS
- **Lucide**: Biblioteca de ícones SVG moderna
- **React Icons**: Coleção massiva de ícones
- **Tabler Icons**: Ícones SVG gratuitos

### Recomendações de Ícones
```bash
# Heroicons (recomendado)
npm install @heroicons/react

# Lucide React
npm install lucide-react

# React Icons
npm install react-icons
```

### Uso de Ícones com HeroUI
```jsx
import {Button} from "@heroui/react";
import {PlusIcon} from "@heroicons/react/24/outline";

<Button 
  color="primary" 
  startContent={<PlusIcon className="w-5 h-5" />}
>
  Adicionar
</Button>
```

---

## 📱 Responsividade

### Breakpoints
HeroUI herda os breakpoints do Tailwind CSS:
- **sm**: `640px`
- **md**: `768px`
- **lg**: `1024px`
- **xl**: `1280px`
- **2xl**: `1536px`

### Design Mobile-First
Todos os componentes são projetados com abordagem mobile-first:
- Layout flexível e adaptável
- Touch-friendly (pelo menos 44px de área tocável)
- Performance otimizada para dispositivos móveis
- Gestos nativos suportados

---

## ♿ Acessibilidade

### Padrões Seguidos
- **WCAG 2.1 AA**: Conformidade com diretrizes
- **React Aria**: Base em componentes acessíveis
- **Keyboard Navigation**: Navegação completa por teclado
- **Screen Reader**: Suporte a leitores de tela
- **Focus Management**: Gerenciamento inteligente de foco

### Recursos de Acessibilidade
- **ARIA Labels**: Labels semânticos
- **Role Attributes**: Atributos de função apropriados
- **Color Contrast**: Contraste adequado entre cores
- **Focus Visible**: Indicadores de foco visíveis
- **Reduced Motion**: Respeito às preferências de animação

---

## 🚀 Performance

### Otimizações Incluídas
- **Tree Shaking**: Importação apenas do necessário
- **Bundle Splitting**: Divisão inteligente do código
- **CSS-in-JS**: Estilos otimizados
- **Server-Side Rendering**: Suporte a SSR/SSG
- **Lazy Loading**: Carregamento sob demanda

### Métricas de Performance
- **Bundle Size**: Minimizado e otimizado
- **Runtime Performance**: Renderização eficiente
- **Memory Usage**: Uso de memória controlado
- **Animation Performance**: 60fps em animações

---

## 📖 Guias de Uso

### Melhores Práticas
1. **Componentes**: Use os componentes base antes de customizar
2. **Temas**: Prefira customização via temas a overrides CSS
3. **Cores**: Use cores semânticas em vez de hardcoded
4. **Espaçamento**: Utilize o sistema de spacing consistente
5. **Acessibilidade**: Teste sempre com leitores de tela

### Exemplo de Implementação Completa
```jsx
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@heroui/react";

function MyComponent() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <h4 className="font-bold text-large">Exemplo HeroUI</h4>
        </CardHeader>
        <CardBody>
          <Input
            type="email"
            label="Email"
            placeholder="Digite seu email"
            className="mb-4"
          />
          <Button 
            color="primary" 
            onPress={onOpen}
            className="w-full"
          >
            Abrir Modal
          </Button>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Confirmar Ação</h3>
              </ModalHeader>
              <ModalBody>
                <p>Deseja continuar com esta ação?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
```

---

## 🛠️ Ferramentas Recomendadas

### Design
- **Figma**: Para design e prototipagem
- **HeroUI Figma Kit**: Kit oficial de componentes
- **Color Tools**: 
  - Eva Design System
  - Smart Watch
  - Palette
  - Color Box

### Desenvolvimento
- **VS Code**: Editor recomendado
- **Tailwind CSS Extension**: Para autocompletar
- **ESLint**: Para qualidade de código
- **Prettier**: Para formatação
- **TypeScript**: Para tipagem estática

### Testes
- **Jest**: Framework de testes
- **Testing Library**: Para testes de componentes
- **Storybook**: Para documentação de componentes
- **Cypress**: Para testes E2E

---

## 📚 Recursos e Links

### Documentação Oficial
- **Site Principal**: [heroui.com](https://heroui.com)
- **Documentação**: [heroui.com/docs](https://heroui.com/docs)
- **Figma Kit**: [Figma Community](https://www.figma.com/community/file/1267584376234254760/heroui-figma-kit-community)

### Repositórios
- **GitHub Principal**: [nextui-org/nextui](https://github.com/nextui-org/nextui)
- **Figma Plugin**: Ferramentas de integração

### Comunidade
- **Discord**: Comunidade ativa
- **GitHub Issues**: Suporte e bugs
- **Twitter**: Updates e novidades

---

## 🔄 Histórico de Mudanças

### Marcos Importantes
- **2024**: Rebrand de NextUI para HeroUI
- **Janeiro 2024**: Atualização do Figma Kit
- **2023**: Lançamento da v2 com React Aria

### Status Atual
- **Versão**: v2.x (estável)
- **Figma Kit**: Em desenvolvimento contínuo
- **Suporte**: Ativo e mantido
- **Roadmap**: Atualizações regulares

---

## ⚠️ Notas e Limitações

### Considerações Importantes
1. **Em Desenvolvimento**: O Figma Kit está em constante evolução
2. **React Only**: Focado especificamente em React
3. **Tailwind CSS**: Dependência obrigatória do Tailwind
4. **Node.js**: Requer ambiente Node.js moderno

### Compatibilidade
- **React**: 18+
- **TypeScript**: 4.9+
- **Tailwind CSS**: 3.0+
- **Node.js**: 16+

---

*Documento criado em: Janeiro 2025*  
*Baseado no HeroUI Figma Kit Community v2024*  
*Para atualizações, consulte a documentação oficial em heroui.com*