# Padrões de Modal - Portal Cresol

## Última Atualização
**Data**: 28/01/2025 - 11:30 (Brasília)

## Visão Geral
Este documento estabelece os padrões para implementação de modais no Portal Cresol, garantindo consistência visual e funcional em toda a aplicação.

## Princípios de Design

### 1. Estrutura Minimalista
- Cabeçalho fixo com título e descrição opcional
- Corpo rolável para conteúdo extenso
- Rodapé fixo com botões de ação
- Sem elementos decorativos desnecessários

### 2. Botões Profissionais
- **Tamanho pequeno**: `px-3 py-1.5 text-sm`
- **Alinhamento à direita** no rodapé
- **Gap de 2** entre botões (`gap-2`)
- **Cores consistentes**:
  - Cancelar: Branco com borda cinza
  - Confirmar: Cor primária (laranja Cresol)
  - Perigo: Vermelho para ações destrutivas

### 3. Animações Suaves
- **Fade in** para backdrop: `animate-in fade-in duration-200`
- **Zoom in** para modal: `animate-in zoom-in-95 duration-200`
- **Backdrop blur**: `backdrop-blur-sm` para melhor foco

## Estrutura Padrão

### Componente Base (StandardModal)
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
  
  {/* Modal Container */}
  <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[size] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
    
    {/* Header - Fixed */}
    <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <button className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
    
    {/* Body - Scrollable */}
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {children}
    </div>
    
    {/* Footer - Fixed */}
    <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-lg">
      <div className="flex items-center justify-end gap-2">
        <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
          Cancelar
        </button>
        <button className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</div>
```

## Tamanhos Disponíveis

| Tamanho | Classe         | Uso Recomendado                    |
|---------|----------------|-------------------------------------|
| Small   | `max-w-md`     | Confirmações, alertas simples      |
| Medium  | `max-w-lg`     | Formulários pequenos, edições      |
| Large   | `max-w-2xl`    | Formulários complexos, detalhes    |
| XLarge  | `max-w-4xl`    | Tabelas, conteúdo extenso          |

## Componentes Padronizados

### 1. ConfirmationModal
- Modal de confirmação com ícone indicativo
- Suporte a tipos: delete, warning, info
- Input opcional para confirmação de texto
- Botões pequenos profissionais

### 2. StandardModal
- Componente base reutilizável
- Props configuráveis para título, descrição, tamanho
- Componentes auxiliares: ModalButton, ModalFooter
- Controle de overflow e scroll

### 3. Modais Chakra UI
- EventModal, NewsModal, MessageModal
- Mantém estrutura Chakra com botões pequenos
- Footer com `bg-gray-50` e `py-3`
- Botões com `size="sm"` e padding customizado

## Padrões de Implementação

### Estados de Loading
```tsx
{isLoading ? (
  <svg className="animate-spin h-3 w-3" ... />
  <span>Processando...</span>
) : (
  buttonText
)}
```

### Validação de Formulário
- Desabilitar botão de ação quando formulário inválido
- Mostrar erros em alerts ou inline
- Manter foco no primeiro campo com erro

### Acessibilidade
- Sempre incluir `aria-label` em botões de ícone
- Usar `role` apropriado para regiões
- Suporte a navegação por teclado (Escape para fechar)
- Focar primeiro elemento interativo ao abrir

## Migração de Modais Existentes

### Checklist de Atualização
1. ✅ Estrutura com header/body/footer separados
2. ✅ Botões pequenos (`px-3 py-1.5 text-sm`)
3. ✅ Rodapé com `bg-gray-50` e padding reduzido
4. ✅ Animações de entrada (`animate-in`)
5. ✅ Backdrop com blur (`backdrop-blur-sm`)
6. ✅ Scroll apenas no body
7. ✅ Altura máxima de 90vh

### Modais Atualizados
- ✅ StandardModal (componente base)
- ✅ ConfirmationModal
- ✅ UserEditModal
- ✅ EventModal (Chakra)
- ✅ NewsModal (Chakra)
- ✅ MessageModal
- ✅ CollectionModal
- ✅ RoleModal

## Boas Práticas

### Performance
- Lazy load modais grandes
- Usar portal/teleport para renderização
- Limpar event listeners ao desmontar

### UX
- Fechar com Escape e clique no backdrop
- Manter estado do formulário ao reabrir (quando apropriado)
- Feedback visual para ações em progresso
- Mensagens de erro claras e acionáveis

### Manutenção
- Reutilizar StandardModal quando possível
- Manter consistência de espaçamento
- Documentar props customizadas
- Testar em diferentes tamanhos de tela

## Exemplos de Uso

### Modal Simples
```tsx
import { StandardModal, ModalButton, ModalFooter } from '@/app/components/ui/StandardModal';

<StandardModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título do Modal"
  description="Descrição opcional"
  size="md"
  footer={
    <ModalFooter>
      <ModalButton variant="secondary" onClick={handleClose}>
        Cancelar
      </ModalButton>
      <ModalButton variant="primary" onClick={handleSave}>
        Salvar
      </ModalButton>
    </ModalFooter>
  }
>
  {/* Conteúdo do modal */}
</StandardModal>
```

### Modal de Confirmação
```tsx
<ConfirmationModal
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="Confirmar Exclusão"
  message="Tem certeza que deseja excluir este item?"
  type="delete"
  confirmButtonText="Excluir"
  cancelButtonText="Cancelar"
/>
```

## Notas de Implementação

- Todos os modais devem seguir estes padrões para manter consistência
- Exceções devem ser documentadas e justificadas
- Atualizações futuras devem preservar a estrutura base
- Testes devem validar acessibilidade e responsividade