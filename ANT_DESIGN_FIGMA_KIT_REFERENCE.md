# Ant Design Figma Kit - Referência Completa

## 📋 Visão Geral

**Ant Design** é uma linguagem de design e biblioteca React para interfaces de usuário empresariais, desenvolvida pela Ant Financial. O **Ant Design Figma Kit** é um sistema de design abrangente que contém todos os componentes, tokens e patterns do ecossistema Ant Design.

### Informações Básicas
- **Status**: Mantido ativamente (versão atual baseada no Ant Design v5.24+)
- **Disponibilidade**: Versões gratuitas e comerciais na Figma Community
- **Acesso**: [Figma Community - Ant Design Open Source](https://www.figma.com/community/file/831698976089873405/ant-design-open-source)
- **Framework**: Focado em React, com suporte para outros frameworks
- **Licença**: Open Source (MIT) para versão community
- **Website Oficial**: [antforfigma.com](https://antforfigma.com)

---

## 🎨 Design System & Filosofia

### Princípios de Design
- **Enterprise-class UI**: Voltado para aplicações corporativas e administrativas
- **Consistência**: Padrões visuais e de interação consistentes
- **Eficiência**: Workflow otimizado para produtividade
- **Acessibilidade**: Conformidade com padrões WCAG
- **Internacionalização**: Suporte nativo para múltiplos idiomas

### Arquitetura do Design System
- **Atomic Design**: Componentes organizados em hierarquia atômica
- **Design Tokens**: Sistema baseado em tokens (Seed, Map, Alias)
- **Component Variants**: Múltiplas variações para cada componente
- **Auto Layout**: Todos os componentes usam Auto Layout do Figma
- **Variables**: Integração completa com Variables do Figma

---

## 🌈 Sistema de Cores

### Hierarquia de Design Tokens
**Estrutura de 3 camadas**:
1. **Seed Tokens**: Valores base/primitivos
2. **Map Tokens**: Derivados dos Seed Tokens
3. **Alias Tokens**: Tokens semânticos derivados dos Map Tokens

### Paletas de Cores Base
**12 paletas base com 10 variações cada**:
- **Blue (Daybreak Blue)**: `#1677ff` - Cor primária padrão
- **Red**: Tons de vermelho para errors/danger
- **Orange**: Tons de laranja para warnings
- **Yellow**: Tons de amarelo para avisos leves
- **Green**: Tons de verde para success
- **Cyan**: Tons de ciano
- **Purple**: Tons de roxo/violeta
- **Magenta**: Tons de magenta
- **Pink**: Tons de rosa
- **Volcano**: Tons de vermelho-alaranjado
- **Geek Blue**: Azul tecnológico
- **Lime**: Verde-amarelado

### Cores Semânticas e Funcionais

#### Brand Colors
- **Primary**: Cor principal da marca (padrão: Daybreak Blue)
- **Secondary**: Cor secundária

#### Functional Colors
- **Success**: Verde (`#52c41a`) - Ações bem-sucedidas
- **Warning**: Laranja (`#faad14`) - Avisos e alertas
- **Error**: Vermelho (`#ff4d4f`) - Erros e estados críticos
- **Info**: Azul (`#1677ff`) - Informações neutras

#### Layout Colors
- **Background**: Cor de fundo principal
- **Surface**: Superfícies elevadas (cards, modals)
- **Border**: Bordas e divisores
- **Text Primary**: Texto principal
- **Text Secondary**: Texto secundário
- **Text Disabled**: Texto desabilitado

### Algoritmo de Cores
O Ant Design usa um algoritmo específico para gerar paletas:
- **Input**: Uma cor base (ex: `#6514ce`)
- **Output**: 10 variações da cor (50, 100, 200, ..., 900)
- **Modos**: Light e Dark automáticos
- **Ferramenta**: [Ant Design Palette Generator](https://ant.design/docs/spec/colors)

---

## 📝 Sistema de Tipografia

### Hierarquia Tipográfica

#### Font Families
- **UI Font**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans'`
- **Figma UI Font**: `SF Pro Text` (macOS) / `Segoe UI` (Windows)
- **Code Font**: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier`
- **Figma Code Font**: `Courier Prime`

#### Escalas de Tamanho
- **Heading 1**: `38px` / `46px` line-height
- **Heading 2**: `30px` / `38px` line-height
- **Heading 3**: `24px` / `32px` line-height
- **Heading 4**: `20px` / `28px` line-height
- **Heading 5**: `16px` / `24px` line-height
- **Body Large**: `16px` / `24px` line-height
- **Body**: `14px` / `22px` line-height
- **Caption**: `12px` / `20px` line-height

#### Font Weights
- **Normal**: `400` (texto regular)
- **Strong**: `600` (texto forte/headers)

### Tokens Tipográficos
- **fontSizeHeading1-5**: Tamanhos dos headings
- **fontSizeBase**: `14px` - Tamanho base do sistema
- **lineHeight**: Altura de linha por token
- **fontFamily**: Família de fontes
- **fontWeightStrong**: Peso forte (600)
- **fontWeightNormal**: Peso normal (400)

---

## 📐 Sistema de Espaçamento e Layout

### Grid System
- **Unidade Base**: `4px` (pode ser customizada)
- **Container**: Larguras responsivas predefinidas
- **Breakpoints**: `xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1600px`

### Espaçamento
**Escala baseada em múltiplos de 4px**:
- **XS**: `4px`
- **SM**: `8px`
- **MD**: `12px` (padrão)
- **LG**: `16px`
- **XL**: `20px`
- **XXL**: `24px`

### Border Radius
- **Small**: `2px`
- **Base**: `6px`
- **Large**: `8px`

### Sombras (Shadows)
- **Shadow 1**: Elevação mínima
- **Shadow 2**: Elevação padrão para cards
- **Shadow 3**: Elevação alta para modals/popovers

---

## 🧩 Componentes Disponíveis

### General (4 componentes)
- **Button**: Botão básico com múltiplas variantes
- **FloatButton**: Botão flutuante para ações rápidas
- **Icon**: Sistema de ícones (usa Ant Design Icons)
- **Typography**: Componentes de texto (Title, Text, Paragraph)

### Layout (5 componentes)
- **Divider**: Separadores horizontais e verticais
- **Flex**: Container flexível com propriedades flex
- **Grid**: Sistema de grid responsivo (Row, Col)
- **Layout**: Layout principal (Header, Sider, Content, Footer)
- **Space**: Espaçamento automático entre elementos
- **Splitter**: Divisores redimensionáveis

### Navigation (6 componentes)
- **Anchor**: Navegação âncora para seções
- **Breadcrumb**: Navegação hierárquica (migalhas de pão)
- **Dropdown**: Menus dropdown
- **Menu**: Sistema de navegação principal
- **Pagination**: Paginação de dados
- **Steps**: Indicador de progresso em etapas
- **Tabs**: Abas/guias para organização de conteúdo

### Data Entry (18 componentes)
- **AutoComplete**: Campo de autocompletar
- **Cascader**: Seleção em cascata
- **Checkbox**: Caixas de seleção
- **ColorPicker**: Seletor de cores
- **DatePicker**: Seletor de datas (Date, Week, Month, Quarter, Year, Range)
- **Form**: Sistema de formulários com validação
- **Input**: Campos de texto (Text, Password, TextArea, Search)
- **InputNumber**: Campo numérico
- **Mentions**: Menções (@usuario)
- **Radio**: Botões de rádio
- **Rate**: Avaliação com estrelas
- **Select**: Dropdown de seleção
- **Slider**: Controle deslizante
- **Switch**: Interruptor on/off
- **TimePicker**: Seletor de horário
- **Transfer**: Transferência entre listas
- **TreeSelect**: Seleção em árvore
- **Upload**: Upload de arquivos

### Data Display (20 componentes)
- **Avatar**: Imagens de perfil/usuário
- **Badge**: Emblemas e contadores
- **Calendar**: Calendário completo
- **Card**: Cartões de conteúdo
- **Carousel**: Carrossel de conteúdo
- **Collapse**: Painéis colapsáveis
- **Descriptions**: Lista de descrições
- **Empty**: Estado vazio
- **Image**: Componente de imagem otimizado
- **List**: Listas de dados
- **Popover**: Balões informativos
- **QRCode**: Geração de QR Code
- **Segmented**: Controle segmentado
- **Statistic**: Exibição de estatísticas
- **Table**: Tabelas de dados complexas
- **Tag**: Tags e labels
- **Timeline**: Linha do tempo
- **Tooltip**: Dicas contextuais
- **Tour**: Tour guiado pela interface
- **Tree**: Estrutura em árvore

### Feedback (12 componentes)
- **Alert**: Alertas e avisos
- **Drawer**: Gavetas laterais
- **Message**: Mensagens de feedback temporárias
- **Modal**: Janelas modais
- **Notification**: Notificações do sistema
- **Popconfirm**: Confirmação em popover
- **Progress**: Barras e círculos de progresso
- **Result**: Páginas de resultado (success, error, 404)
- **Skeleton**: Placeholders de carregamento
- **Spin**: Indicadores de carregamento
- **Watermark**: Marca d'água

### Other (2 componentes)
- **Affix**: Elementos fixos na tela
- **App**: Wrapper de aplicação
- **ConfigProvider**: Provedor de configuração global

---

## 🎯 Variantes e Estados dos Componentes

### Tipos de Variante (Type)
- **primary**: Estilo primário (azul padrão)
- **default**: Estilo padrão/neutro
- **dashed**: Estilo tracejado
- **link**: Estilo de link
- **text**: Apenas texto, sem fundo

### Tamanhos (Size)
- **small**: Pequeno
- **middle**: Médio (padrão)
- **large**: Grande

### Estados Interativos
- **default**: Estado padrão
- **hover**: Estado de hover
- **active**: Estado ativo/pressionado
- **focus**: Estado de foco
- **disabled**: Estado desabilitado
- **loading**: Estado de carregamento

### Estados de Validação
- **success**: Sucesso (verde)
- **warning**: Aviso (amarelo/laranja)
- **error**: Erro (vermelho)
- **validating**: Validando

### Formas (Shape)
- **default**: Forma padrão
- **round**: Cantos completamente arredondados
- **circle**: Formato circular

---

## 🌙 Temas e Customização

### Algoritmo de Temas
O Ant Design 5.x introduziu um novo algoritmo de temas:

```javascript
// Exemplo de configuração de tema
import { ConfigProvider, theme } from 'antd';

const App = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm, // ou theme.defaultAlgorithm
      token: {
        colorPrimary: '#6514ce',
        borderRadius: 8,
      },
    }}
  >
    {/* Seu app */}
  </ConfigProvider>
);
```

### Temas Disponíveis
- **Default Algorithm**: Tema claro padrão
- **Dark Algorithm**: Tema escuro
- **Compact Algorithm**: Tema compacto (menor espaçamento)

### Customização no Figma
1. **Variables Panel**: Acesse as variáveis do design system
2. **Color Collections**: Modifique as coleções de cores
3. **Typography Collection**: Ajuste tipografia
4. **Spacing Collection**: Configure espaçamentos
5. **Component Variables**: Customize componentes específicos

---

## ⚙️ Configuração e Integração

### Instalação do React
```bash
npm install antd
# ou
yarn add antd
```

### Configuração Básica
```javascript
import { Button, DatePicker } from 'antd';

const App = () => (
  <div>
    <Button type="primary">Primary Button</Button>
    <DatePicker />
  </div>
);
```

### CSS Variables
O Ant Design 5.x usa CSS-in-JS com tokens CSS:
```css
:root {
  --ant-color-primary: #1677ff;
  --ant-color-success: #52c41a;
  --ant-color-warning: #faad14;
  --ant-color-error: #ff4d4f;
  --ant-border-radius-base: 6px;
  --ant-font-size-base: 14px;
}
```

### Design Tokens no Figma
```javascript
// Estrutura de tokens
{
  "seed": {
    "colorPrimary": "#1677ff"
  },
  "map": {
    "colorPrimary1": "#e6f4ff",
    "colorPrimary6": "#1677ff"
  },
  "alias": {
    "colorBgContainer": "#ffffff"
  }
}
```

---

## 🔧 Estratégias de Navegação e Busca

### Como Navegar Eficientemente no Kit

#### 1. Estrutura de Páginas no Figma
- **🏠 Cover**: Página inicial com informações do kit
- **🎨 Design System**: Tokens, cores, tipografia
- **🧩 Components**: Todos os componentes organizados por categoria
- **📱 Templates**: Templates e layouts pré-construídos
- **📋 Changelog**: Histórico de atualizações

#### 2. Navegação por Categorias
**Método Recomendado**: Use a navegação lateral do Figma
1. Abra o painel de navegação (Pages)
2. Expanda a seção "Components"
3. Categorias organizadas alfabeticamente:
   - Data Display
   - Data Entry
   - Feedback
   - General
   - Layout
   - Navigation
   - Other

#### 3. Busca Inteligente de Componentes
**Estratégias de Busca**:

**Por Funcionalidade**:
- `input` → Input, InputNumber, AutoComplete, Mentions
- `select` → Select, TreeSelect, Cascader
- `button` → Button, FloatButton
- `date` → DatePicker, TimePicker, Calendar
- `table` → Table, List, Descriptions
- `modal` → Modal, Drawer, Popconfirm

**Por Estado/Tipo**:
- `primary` → Componentes com variante primary
- `disabled` → Estados desabilitados
- `loading` → Estados de carregamento
- `error` → Estados de erro

**Por Layout**:
- `flex` → Flex, Space
- `grid` → Grid (Row, Col)
- `layout` → Layout components

#### 4. Atalhos de Teclado no Figma
- `Ctrl/Cmd + F`: Busca global
- `Ctrl/Cmd + /`: Busca de componentes
- `Ctrl/Cmd + Shift + O`: Assets panel
- `Alt/Option + 1`: Layers panel

#### 5. Uso do Assets Panel
1. Abra o Assets panel (`Alt/Option + Shift + O`)
2. Use filtros:
   - **Components**: Todos os componentes
   - **Colors**: Paleta de cores
   - **Typography**: Estilos de texto
   - **Grids**: Sistemas de grid
   - **Effects**: Sombras e efeitos

### Como Baixar Assets e Componentes

#### 1. Duplicando o Kit
**Método Recomendado para Customização**:
1. Acesse o kit na Community
2. Clique em "Duplicate" ou "Get a copy"
3. O kit será adicionado aos seus arquivos
4. Personalize conforme necessário

#### 2. Copiando Componentes Específicos
1. Selecione o componente desejado
2. `Ctrl/Cmd + C` para copiar
3. Cole em seu arquivo de design
4. O componente manterá todas as variantes e propriedades

#### 3. Exportando Assets
**Para Ícones e Imagens**:
1. Selecione o elemento
2. Menu Export (painel direito)
3. Escolha formato (SVG, PNG, JPG)
4. Configure escala e qualidade
5. Export

#### 4. Usando Design Tokens
1. Acesse a página "Design System"
2. Copie tokens de cor/tipografia
3. Use como referência para CSS variables
4. Implemente no código React

### Dicas de Produtividade

#### 1. Criando Bibliotecas Locais
1. Selecione componentes frequentemente usados
2. Clique com botão direito → "Add to library"
3. Publique como biblioteca interna
4. Use em múltiplos projetos

#### 2. Usando Plugins Recomendados
- **Ant Design to Code**: Conversão para React
- **Design Tokens**: Exportação de tokens
- **Batch Styler**: Edição em lote de estilos
- **Content Reel**: Preenchimento automático de dados

#### 3. Workflow de Design Eficiente
1. **Planejamento**: Defina componentes necessários
2. **Busca**: Use estratégias de busca otimizadas
3. **Customização**: Aplique brand colors/fonts
4. **Validação**: Teste variantes e estados
5. **Handoff**: Use plugins para dev handoff

---

## 🚀 Integração Código-Design

### Design Tokens para Desenvolvimento

#### Exportando Tokens
```json
{
  "color": {
    "primary": {
      "50": "#e6f4ff",
      "100": "#bae0ff",
      "500": "#1677ff",
      "900": "#0c1b3f"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px"
  }
}
```

#### Implementação React
```tsx
import { ConfigProvider } from 'antd';

const customTheme = {
  token: {
    colorPrimary: '#6514ce',
    colorSuccess: '#52c41a',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI',
  },
  components: {
    Button: {
      colorPrimary: '#6514ce',
      algorithm: true,
    },
  },
};

export const App = () => (
  <ConfigProvider theme={customTheme}>
    <YourApp />
  </ConfigProvider>
);
```

### Plugins e Ferramentas

#### Figma to Code
- **Ant Design Dev Mode**: Inspect design specs
- **AI Design to Code**: Conversão automática
- **Figma Dev Mode**: Handoff nativo do Figma

#### Ferramentas de Design
- **Figma Variables**: Sincronização de tokens
- **Component Properties**: Controle de variantes
- **Auto Layout**: Layouts responsivos

---

## ♿ Acessibilidade e Melhores Práticas

### Padrões de Acessibilidade
- **WCAG 2.1 AA**: Conformidade completa
- **Keyboard Navigation**: Navegação por teclado
- **Screen Reader**: Compatibilidade com leitores de tela
- **Color Contrast**: Contraste adequado (4.5:1 mínimo)
- **Focus Management**: Indicadores de foco visíveis

### Implementação Acessível
```tsx
// Exemplo de uso acessível
<Form
  layout="vertical"
  aria-label="Formulário de cadastro"
>
  <Form.Item
    label="Email"
    name="email"
    rules={[{ required: true, message: 'Email é obrigatório' }]}
  >
    <Input
      type="email"
      placeholder="Digite seu email"
      aria-describedby="email-help"
    />
  </Form.Item>
</Form>
```

### Diretrizes de UX
1. **Feedback Claro**: Use mensagens descritivas
2. **Estados Consistentes**: Mantenha padrões visuais
3. **Progressão Lógica**: Fluxos intuitivos
4. **Tolerância a Erros**: Prevenção e recovery
5. **Eficiência**: Minimize cliques/etapas

---

## 📖 Recursos e Documentação

### Links Oficiais
- **Ant Design**: [ant.design](https://ant.design)
- **Figma Kit**: [antforfigma.com](https://antforfigma.com)
- **GitHub**: [github.com/ant-design/ant-design](https://github.com/ant-design/ant-design)
- **Documentação**: [ant.design/docs](https://ant.design/docs/react/introduce)

### Figma Community
- **Ant Design Open Source**: Kit gratuito básico
- **Ant Design System for Figma**: Kit comercial completo
- **Templates**: Layouts pré-construídos
- **Icons**: Biblioteca de ícones oficial

### Ferramentas Relacionadas
- **Ant Design Pro**: Framework admin
- **Ant Design Mobile**: Versão mobile
- **Ant Design Charts**: Biblioteca de gráficos
- **Ant Design X**: Componentes experimentais

### Comunidade e Suporte
- **GitHub Issues**: Reportar bugs
- **Stack Overflow**: Tag `antd`
- **Discord**: Comunidade oficial
- **Figma Community**: Discussões de design

---

## 🔄 Versionamento e Atualizações

### Versões Principais
- **v5.x (Atual)**: Design tokens, CSS-in-JS
- **v4.x (Legacy)**: Less variables
- **v3.x (Descontinuada)**: Versão clássica

### Changelog Figma Kit
- **v5.24+**: Componentes Ant Design X
- **v5.20**: Variables do Figma
- **v5.15**: Dark theme otimizado
- **v5.10**: Component properties

### Migração entre Versões
1. **Backup**: Faça backup do projeto atual
2. **Duplicate**: Duplique o novo kit
3. **Compare**: Compare componentes alterados
4. **Update**: Atualize componentes gradualmente
5. **Test**: Teste funcionalidade e design

---

## ⚠️ Limitações e Considerações

### Limitações do Kit Figma
1. **Funcionalidade**: Apenas representação visual
2. **Lógica**: Sem validação ou lógica de negócio
3. **Data**: Não conecta com APIs reais
4. **Performance**: Apenas simulação visual

### Diferenças Figma vs Código
- **Pixel Perfect**: Algumas diferenças de rendering
- **Interações**: Limitadas no Figma
- **Responsividade**: Behavior diferente
- **Estados**: Alguns estados não representados

### Melhores Práticas
1. **Consistência**: Mantenha alinhamento design-dev
2. **Comunicação**: Documente customizações
3. **Testing**: Teste em diferentes dispositivos
4. **Updates**: Mantenha versões sincronizadas
5. **Handoff**: Use ferramentas adequadas

### Quando Usar Ant Design
✅ **Ideal para**:
- Aplicações administrativas
- Dashboards corporativos
- Sistemas internos
- Produtos B2B
- MVPs rápidos

❌ **Evitar em**:
- Sites marketing
- Produtos consumer
- Designs únicos/criativos
- Aplicações mobile-first

---

## 📚 Guia de Referência Rápida

### Componentes Mais Utilizados
1. **Button** → Ações primárias
2. **Input** → Entrada de dados
3. **Table** → Listagem de dados
4. **Form** → Formulários complexos
5. **Modal** → Ações secundárias
6. **Menu** → Navegação principal
7. **Card** → Agrupamento de conteúdo
8. **DatePicker** → Seleção de datas
9. **Select** → Seleção de opções
10. **Pagination** → Paginação de listas

### Atalhos Figma Essenciais
- `R` → Rectangle tool
- `F` → Frame tool
- `Shift + A` → Auto Layout
- `Ctrl/Cmd + D` → Duplicate
- `Alt/Option + Drag` → Duplicate while dragging
- `Ctrl/Cmd + G` → Group
- `Ctrl/Cmd + Shift + G` → Ungroup
- `Ctrl/Cmd + K` → Components
- `Ctrl/Cmd + Alt/Option + K` → Create component

### Tokens CSS Principais
```css
--ant-color-primary: #1677ff;
--ant-color-success: #52c41a;
--ant-color-warning: #faad14;
--ant-color-error: #ff4d4f;
--ant-font-size-base: 14px;
--ant-border-radius-base: 6px;
--ant-padding-xs: 4px;
--ant-padding-sm: 8px;
--ant-padding-md: 12px;
--ant-padding-lg: 16px;
```

---

*Documento criado em: Janeiro 2025*  
*Baseado no Ant Design v5.24+ e Ant Design System for Figma*  
*Para atualizações, consulte [ant.design](https://ant.design) e [antforfigma.com](https://antforfigma.com)*