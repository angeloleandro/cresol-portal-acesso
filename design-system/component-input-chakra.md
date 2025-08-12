# Input Component - Chakra UI v3 Design System

## Visão Geral

Documentação completa do componente Input baseado no Chakra UI v3 para o Portal Cresol. Este documento serve como referência padrão para padronização de todos os inputs no aplicativo.

## Variantes Disponíveis

### 1. Outline (Padrão)
```tsx
<Input variant="outline" placeholder="Input outline padrão" />
```
- **Aparência**: Borda sólida, fundo transparente
- **Uso**: Formulários padrão, campos obrigatórios
- **Estados**: focus (borda azul), error (borda vermelha), disabled (cinza)

### 2. Filled
```tsx
<Input variant="filled" placeholder="Input preenchido" />
```
- **Aparência**: Fundo cinza claro, sem borda
- **Uso**: Formulários secundários, seções de configuração
- **Estados**: focus (borda sutil), hover (fundo mais escuro)

### 3. Flushed
```tsx
<Input variant="flushed" placeholder="Input sem bordas laterais" />
```
- **Aparência**: Apenas borda inferior
- **Uso**: Formulários minimalistas, interfaces limpas
- **Estados**: focus (borda inferior colorida)

### 4. Unstyled
```tsx
<Input variant="unstyled" placeholder="Input sem estilo" />
```
- **Aparência**: Sem bordas ou fundos
- **Uso**: Customizações específicas, sobreposições

## Tamanhos (Sizes)

### XS - Extra Small
```tsx
<Input size="xs" placeholder="Extra pequeno" />
```
- **Altura**: 24px
- **Padding**: 8px horizontal
- **Font Size**: 12px
- **Uso**: Chips, tags, interfaces compactas

### SM - Small  
```tsx
<Input size="sm" placeholder="Pequeno" />
```
- **Altura**: 32px
- **Padding**: 12px horizontal
- **Font Size**: 14px
- **Uso**: Formulários compactos, filtros

### MD - Medium (Padrão)
```tsx
<Input size="md" placeholder="Médio padrão" />
```
- **Altura**: 40px
- **Padding**: 16px horizontal
- **Font Size**: 16px
- **Uso**: Formulários padrão, a maioria dos casos

### LG - Large
```tsx
<Input size="lg" placeholder="Grande" />
```
- **Altura**: 48px
- **Padding**: 20px horizontal
- **Font Size**: 18px
- **Uso**: Formulários principais, CTAs importantes

## Composição com InputGroup

### InputGroup com Addons
```tsx
<InputGroup>
  <InputLeftAddon>https://</InputLeftAddon>
  <Input placeholder="URL do site" />
  <InputRightAddon>.com</InputRightAddon>
</InputGroup>
```

### InputGroup com Elements
```tsx
<InputGroup>
  <InputLeftElement>
    <Icon name="search" />
  </InputLeftElement>
  <Input placeholder="Buscar..." />
  <InputRightElement>
    <Icon name="close" />
  </InputRightElement>
</InputGroup>
```

## Estados e Interações

### Estados Visuais
```tsx
// Estado normal
<Input placeholder="Estado normal" />

// Estado de foco
<Input placeholder="Estado com foco" _focus={{ borderColor: 'blue.500' }} />

// Estado de erro
<Input placeholder="Estado de erro" isInvalid />

// Estado desabilitado
<Input placeholder="Estado desabilitado" isDisabled />

// Estado readonly
<Input placeholder="Estado somente leitura" isReadOnly />
```

### Loading State
```tsx
<InputGroup>
  <Input placeholder="Carregando..." />
  <InputRightElement>
    <Spinner size="sm" />
  </InputRightElement>
</InputGroup>
```

## Integração com Field

### Field Wrapper
```tsx
<Field label="E-mail" isRequired isInvalid={!!error}>
  <Input 
    type="email" 
    placeholder="seu.email@cresol.com.br"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {error && <FieldErrorText>{error}</FieldErrorText>}
  <FieldHelpText>Digite um e-mail válido</FieldHelpText>
</Field>
```

## Props API Completa

### Input Props
```tsx
interface InputProps {
  // Variantes
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled'
  
  // Tamanhos
  size?: 'xs' | 'sm' | 'md' | 'lg'
  
  // Estados
  isDisabled?: boolean
  isInvalid?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  
  // Tipos HTML
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  
  // Eventos
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  
  // Outros
  placeholder?: string
  value?: string
  defaultValue?: string
  name?: string
  id?: string
  autoComplete?: string
  autoFocus?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  
  // Estilização
  bg?: string
  borderColor?: string
  color?: string
  _hover?: SystemStyleObject
  _focus?: SystemStyleObject
  _disabled?: SystemStyleObject
  _invalid?: SystemStyleObject
}
```

### InputGroup Props
```tsx
interface InputGroupProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  children: ReactNode
}
```

### InputAddon Props
```tsx
interface InputAddonProps {
  bg?: string
  color?: string
  children: ReactNode
}
```

### InputElement Props
```tsx
interface InputElementProps {
  placement?: 'left' | 'right'
  children: ReactNode
}
```

## Casos de Uso Comuns

### 1. Login Form
```tsx
<VStack spacing={4}>
  <Field label="E-mail" isRequired>
    <Input 
      type="email" 
      placeholder="seu.email@cresol.com.br"
      variant="outline"
      size="md"
    />
  </Field>
  
  <Field label="Senha" isRequired>
    <InputGroup>
      <Input 
        type={showPassword ? 'text' : 'password'}
        placeholder="Sua senha"
        variant="outline"
        size="md"
      />
      <InputRightElement>
        <IconButton
          variant="ghost"
          onClick={togglePassword}
          icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
        />
      </InputRightElement>
    </InputGroup>
  </Field>
</VStack>
```

### 2. Search Input
```tsx
<InputGroup>
  <InputLeftElement>
    <SearchIcon color="gray.400" />
  </InputLeftElement>
  <Input 
    placeholder="Buscar sistemas, eventos, notícias..."
    variant="outline"
    size="md"
  />
</InputGroup>
```

### 3. Currency Input
```tsx
<InputGroup>
  <InputLeftAddon>R$</InputLeftAddon>
  <Input 
    type="number"
    placeholder="0,00"
    variant="outline"
    size="md"
  />
</InputGroup>
```

### 4. Form with Validation
```tsx
<Field label="Nome completo" isRequired isInvalid={!!errors.name}>
  <Input 
    placeholder="Digite seu nome completo"
    value={name}
    onChange={(e) => setName(e.target.value)}
    variant="outline"
    size="md"
  />
  {errors.name && <FieldErrorText>{errors.name}</FieldErrorText>}
  <FieldHelpText>Mínimo 2 caracteres</FieldHelpText>
</Field>
```

## Acessibilidade

### Requisitos WCAG 2.1 AA
- ✅ Contraste mínimo 4.5:1 para texto
- ✅ Foco visível com outline
- ✅ Labels associados via htmlFor/id
- ✅ Estados de erro anunciados por screen readers
- ✅ Navegação por teclado (Tab, Shift+Tab)
- ✅ Suporte a aria-invalid, aria-describedby

### Implementação de Acessibilidade
```tsx
<Field 
  label="E-mail"
  isRequired
  isInvalid={!!error}
  id="email-field"
>
  <Input 
    id="email-input"
    type="email"
    aria-describedby={error ? "email-error" : "email-help"}
    aria-invalid={!!error}
    aria-required
  />
  {error && (
    <FieldErrorText id="email-error" role="alert">
      {error}
    </FieldErrorText>
  )}
  <FieldHelpText id="email-help">
    Digite um e-mail válido
  </FieldHelpText>
</Field>
```

## Customização Cresol

### Cores da Marca
```tsx
// Primary (Laranja Cresol)
<Input 
  _focus={{ 
    borderColor: 'primary.500',
    boxShadow: '0 0 0 1px var(--colors-primary-500)'
  }}
/>

// Secondary (Verde Cresol)
<Input 
  _focus={{ 
    borderColor: 'secondary.500',
    boxShadow: '0 0 0 1px var(--colors-secondary-500)'
  }}
/>
```

### Tema Personalizado
```tsx
const inputTheme = {
  baseStyle: {
    field: {
      borderColor: 'gray.200',
      _hover: { borderColor: 'gray.300' },
      _focus: { 
        borderColor: 'primary.500',
        boxShadow: '0 0 0 1px var(--colors-primary-500)'
      }
    }
  }
}
```

## Migração de Inputs Existentes

### Antes (Input Atual)
```tsx
<input
  type="email"
  className="input"
  placeholder="E-mail"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Depois (Chakra Input)
```tsx
<Field label="E-mail" isRequired>
  <Input
    type="email"
    variant="outline"
    size="md"
    placeholder="E-mail"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</Field>
```

## Performance e Otimização

### Debouncing para Search
```tsx
const [searchValue, setSearchValue] = useState('')
const debouncedSearch = useDebounce(searchValue, 300)

<Input
  placeholder="Buscar..."
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
/>
```

### Lazy Loading para Large Lists
```tsx
<Input
  placeholder="Filtrar itens..."
  onChange={(e) => filterItems(e.target.value)}
  variant="outline"
  size="sm"
/>
```

## Testes

### Casos de Teste Essenciais
```tsx
// Teste básico de renderização
test('renders input with placeholder', () => {
  render(<Input placeholder="Test input" />)
  expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
})

// Teste de interação
test('calls onChange when typing', () => {
  const handleChange = jest.fn()
  render(<Input onChange={handleChange} />)
  
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'test' }
  })
  
  expect(handleChange).toHaveBeenCalled()
})

// Teste de acessibilidade
test('has proper aria attributes when invalid', () => {
  render(<Input isInvalid aria-describedby="error" />)
  
  const input = screen.getByRole('textbox')
  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input).toHaveAttribute('aria-describedby', 'error')
})
```

---

## Resumo

Este documento estabelece o padrão Chakra UI v3 para todos os inputs no Portal Cresol, garantindo:

- ✅ **Consistência visual** em toda aplicação
- ✅ **Acessibilidade** WCAG 2.1 AA
- ✅ **Flexibilidade** com variantes e tamanhos
- ✅ **Composição** poderosa com InputGroup
- ✅ **Performance** otimizada
- ✅ **Manutenibilidade** através de padrões claros
- ✅ **Identidade Cresol** preservada

**Todos os novos inputs devem seguir este padrão.**