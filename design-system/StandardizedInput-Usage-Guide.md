# Guia de Uso - StandardizedInput

Documentação completa do sistema de inputs padronizados baseado em Chakra UI v3 para o Portal Cresol.

## 📋 Índice

1. [Introdução](#introdução)
2. [Instalação e Importação](#instalação-e-importação)
3. [API do Componente](#api-do-componente)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Best Practices](#best-practices)
6. [Migração de Inputs Legados](#migração-de-inputs-legados)
7. [Troubleshooting](#troubleshooting)

## 🎯 Introdução

O `StandardizedInput` é o componente padrão para todos os campos de entrada no Portal Cresol. Baseado nas especificações do Chakra UI v3, oferece consistência visual, acessibilidade e flexibilidade.

### Características Principais

- ✅ **Chakra UI v3 Compliant**: Suporte completo a variantes, tamanhos e composição
- ✅ **Design System Integrado**: Usa tokens de design Cresol
- ✅ **Acessibilidade**: WCAG 2.1 AA compliance por padrão
- ✅ **TypeScript Native**: Tipos completos e IntelliSense
- ✅ **Flexível**: InputGroup, addons, ícones, validação, estados

## 📦 Instalação e Importação

```typescript
// Importação básica
import { StandardizedInput } from '@/app/components/ui/StandardizedInput'

// Importação com Field wrapper
import { StandardizedInput, Field } from '@/app/components/ui/StandardizedInput'

// Importação do Textarea
import { StandardizedTextarea } from '@/app/components/ui/StandardizedInput'
```

## 🔧 API do Componente

### StandardizedInput Props

```typescript
interface StandardizedInputProps {
  // Chakra UI Variants
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  
  // Icons & Visual
  startIcon?: string          // Ícone inicial (nome do ícone)
  endIcon?: string           // Ícone final
  startElement?: ReactNode   // Elemento customizado inicial
  endElement?: ReactNode     // Elemento customizado final
  
  // InputGroup Features
  leftAddon?: string         // Addon esquerdo (texto)
  rightAddon?: string        // Addon direito (texto)
  
  // States & Validation
  isInvalid?: boolean        // Estado de erro
  isDisabled?: boolean       // Estado desabilitado
  isRequired?: boolean       // Campo obrigatório
  isReadOnly?: boolean       // Somente leitura
  
  // Special Features
  type?: 'password' | 'email' | 'url' | 'text' // Tipos especiais
  isClearable?: boolean      // Botão de limpar
  isLoading?: boolean        // Estado de carregamento
  
  // Labels & Help
  label?: string             // Label do campo
  help?: string              // Texto de ajuda
  error?: string             // Mensagem de erro
  
  // HTML Input Props
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  
  // Outros
  id?: string
  name?: string
  className?: string
  autoFocus?: boolean
  autoComplete?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  step?: string | number
  min?: string | number
  max?: string | number
}
```

### Field Wrapper Props

```typescript
interface FieldProps {
  label?: string
  isRequired?: boolean
  help?: string
  error?: string
  children: ReactNode
}
```

## 💡 Exemplos Práticos

### 1. Input Básico

```tsx
<StandardizedInput
  id="name"
  placeholder="Digite seu nome"
  variant="outline"
  size="md"
/>
```

### 2. Input com Ícone

```tsx
<StandardizedInput
  id="email"
  type="email"
  placeholder="email@cresol.com.br"
  startIcon="mail"
  variant="outline"
  size="md"
/>
```

### 3. Input com Label e Validação

```tsx
<StandardizedInput
  id="password"
  label="Senha"
  type="password"
  isRequired
  isInvalid={hasError}
  error={errorMessage}
  help="Mínimo 8 caracteres"
  variant="outline"
  size="md"
/>
```

### 4. Input com Addons

```tsx
<StandardizedInput
  id="website"
  placeholder="meusite"
  leftAddon="https://"
  rightAddon=".com.br"
  variant="outline"
  size="md"
/>
```

### 5. Input Monetário

```tsx
<StandardizedInput
  id="valor"
  type="number"
  placeholder="0,00"
  leftAddon="R$"
  startIcon="dollar-sign"
  variant="outline"
  size="md"
/>
```

### 6. Input de Busca

```tsx
<StandardizedInput
  id="search"
  placeholder="Buscar..."
  startIcon="search"
  isClearable
  variant="filled"
  size="md"
/>
```

### 7. Textarea

```tsx
<StandardizedTextarea
  id="description"
  label="Descrição"
  placeholder="Digite a descrição..."
  rows={4}
  resize="vertical"
  variant="outline"
  size="md"
/>
```

### 8. Input com Field Wrapper

```tsx
<Field
  label="E-mail Corporativo"
  isRequired
  help="Use seu e-mail @cresol.com.br"
  error={emailError}
>
  <StandardizedInput
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    startIcon="mail"
    variant="outline"
  />
</Field>
```

## 🎨 Variantes e Tamanhos

### Variantes Disponíveis

```tsx
// Outline (padrão) - borda visível
<StandardizedInput variant="outline" />

// Filled - fundo preenchido
<StandardizedInput variant="filled" />

// Flushed - apenas borda inferior
<StandardizedInput variant="flushed" />

// Unstyled - sem estilos padrão
<StandardizedInput variant="unstyled" />
```

### Tamanhos Disponíveis

```tsx
// Extra Small
<StandardizedInput size="xs" />

// Small
<StandardizedInput size="sm" />

// Medium (padrão)
<StandardizedInput size="md" />

// Large
<StandardizedInput size="lg" />
```

## 📝 Best Practices

### 1. Consistência Visual

```tsx
// ✅ CORRETO - Use variante e tamanho padrão
<StandardizedInput
  variant="outline"
  size="md"
  startIcon="mail"
/>

// ❌ EVITAR - Misturar variantes sem propósito
<StandardizedInput variant="filled" size="xs" />
```

### 2. Ícones Apropriados

```tsx
// ✅ CORRETO - Ícones contextuais
<StandardizedInput startIcon="user" placeholder="Nome" />
<StandardizedInput startIcon="mail" type="email" />
<StandardizedInput startIcon="lock" type="password" />
<StandardizedInput startIcon="calendar" type="date" />

// ❌ EVITAR - Ícones genéricos ou confusos
<StandardizedInput startIcon="star" placeholder="Nome" />
```

### 3. Labels e Mensagens

```tsx
// ✅ CORRETO - Labels claros e mensagens úteis
<StandardizedInput
  label="E-mail Corporativo"
  help="Use seu e-mail @cresol.com.br"
  error="E-mail deve ser do domínio @cresol.com.br"
/>

// ❌ EVITAR - Labels genéricos
<StandardizedInput label="Campo" />
```

### 4. Validação e Estados

```tsx
// ✅ CORRETO - Estados consistentes
const [email, setEmail] = useState('')
const [error, setError] = useState('')

<StandardizedInput
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  isInvalid={!!error}
  error={error}
  isRequired
/>

// ❌ EVITAR - Estados inconsistentes
<StandardizedInput isInvalid={true} /> // sem error message
```

### 5. Acessibilidade

```tsx
// ✅ CORRETO - IDs únicos e labels associados
<StandardizedInput
  id="user-email"
  label="E-mail"
  autoComplete="email"
  isRequired
/>

// ❌ EVITAR - Sem IDs ou labels
<StandardizedInput placeholder="E-mail" />
```

## 🔄 Migração de Inputs Legados

### Padrão de Migração

```tsx
// ANTES - Input legado
<input
  type="email"
  className="form-input"
  placeholder="E-mail"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// DEPOIS - StandardizedInput
<StandardizedInput
  id="email"
  type="email"
  label="E-mail"
  placeholder="Digite seu e-mail"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  startIcon="mail"
  variant="outline"
  size="md"
/>
```

### Componentes Complexos

```tsx
// ANTES - Input com wrapper customizado
<div className="form-group">
  <label>Nome</label>
  <input type="text" className="form-input" />
  <span className="error">Erro</span>
</div>

// DEPOIS - StandardizedInput com Field
<Field label="Nome" error={error}>
  <StandardizedInput
    id="name"
    type="text"
    startIcon="user"
    variant="outline"
  />
</Field>
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Ícone não aparece

```tsx
// Problema: Nome do ícone incorreto
<StandardizedInput startIcon="email" /> // ❌

// Solução: Use nomes corretos do sistema de ícones
<StandardizedInput startIcon="mail" /> // ✅
```

#### 2. Estilos não aplicados

```tsx
// Problema: Conflito com classes CSS customizadas
<StandardizedInput className="my-custom-input" /> // Pode quebrar

// Solução: Use props do componente
<StandardizedInput variant="outline" size="lg" /> // ✅
```

#### 3. Validação não funciona

```tsx
// Problema: Estados desconectados
<StandardizedInput isInvalid={true} error="" /> // ❌

// Solução: Estados consistentes
<StandardizedInput 
  isInvalid={!!error} 
  error={error} 
/> // ✅
```

#### 4. TypeScript errors

```tsx
// Problema: Tipos incorretos
<StandardizedInput 
  onChange={(e: any) => {}} // ❌
  variant="invalid"         // ❌
/>

// Solução: Use tipos corretos
<StandardizedInput 
  onChange={(e: ChangeEvent<HTMLInputElement>) => {}} // ✅
  variant="outline"                                    // ✅
/>
```

### Performance Tips

1. **Use defaultValue** para inputs não controlados quando possível
2. **Memoize callbacks** em componentes com muitos inputs
3. **Evite re-renders** desnecessários com React.memo()

```tsx
// Performance otimizada
const MemoizedInput = React.memo(({ value, onChange, ...props }) => (
  <StandardizedInput
    value={value}
    onChange={useCallback(onChange, [onChange])}
    {...props}
  />
))
```

## 📊 Checklist de Implementação

### ✅ Antes de Usar

- [ ] Componente importado corretamente
- [ ] Props obrigatórias definidas (id, label quando necessário)
- [ ] Ícones apropriados selecionados
- [ ] Validação implementada se necessário

### ✅ Durante Desenvolvimento

- [ ] Variante e tamanho consistentes
- [ ] Estados de loading/error funcionando
- [ ] Acessibilidade verificada
- [ ] TypeScript sem erros

### ✅ Antes do Deploy

- [ ] Testes funcionais passando
- [ ] Performance verificada
- [ ] Responsividade validada
- [ ] Documentação atualizada

---

## 📞 Suporte

Para dúvidas ou problemas com o StandardizedInput:

1. Consulte esta documentação
2. Verifique exemplos em `/design-system/component-input-chakra.md`
3. Revise o código em `/app/components/ui/StandardizedInput.tsx`
4. Analise implementações existentes no projeto

**Padrão Cresol**: Sempre priorize consistência visual e experiência do usuário ao implementar novos inputs.