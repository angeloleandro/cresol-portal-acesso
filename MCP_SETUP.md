# MCP Server Configuration for VS Code

Este documento explica como configurar e usar os servidores MCP (Model Context Protocol) no VS Code para este projeto.

## Configuração Implementada

### Servidores MCP Configurados

Foram configurados os seguintes servidores MCP que correspondem às capacidades do Claude Code:

#### 1. **Supabase (supabase-cresol)**
- **Função**: Integração direta com o banco de dados Supabase do projeto
- **Recursos**: Queries, migrações, gerenciamento de tabelas
- **Configuração**: Usa as credenciais específicas do projeto Cresol

#### 2. **Playwright**
- **Função**: Automação de browser e testes E2E
- **Recursos**: Screenshots, interação com páginas, testes visuais
- **Uso**: Testes automatizados e validação de UI

#### 3. **Filesystem**
- **Função**: Acesso ao sistema de arquivos local
- **Recursos**: Leitura, escrita e navegação de arquivos
- **Escopo**: Limitado ao diretório do projeto

#### 4. **Figma**
- **Função**: Integração com designs do Figma
- **Recursos**: Extração de dados de design, geração de código a partir de designs
- **Configuração**: Requer FIGMA_API_KEY

#### 5. **GitHub**
- **Função**: Integração com repositórios GitHub
- **Recursos**: Issues, PRs, commits, informações de repositório
- **Configuração**: Requer GITHUB_TOKEN

#### 6. **Context7**
- **Função**: Documentação atualizada de bibliotecas
- **Recursos**: Documentação oficial de frameworks e bibliotecas
- **Uso**: Consulta de padrões e melhores práticas

#### 7. **Magic UI**
- **Função**: Geração de componentes UI modernos
- **Recursos**: Componentes React/Vue/Angular com design systems
- **Uso**: Criação rápida de interfaces

#### 8. **Memory**
- **Função**: Sistema de memória persistente
- **Recursos**: Armazenamento de contexto entre sessões
- **Uso**: Manter histórico de decisões e padrões

#### 9. **MUI (Material-UI)**
- **Função**: Integração com Material-UI
- **Recursos**: Componentes, documentação, padrões
- **Uso**: Desenvolvimento com Material Design

#### 10. **Chakra UI**
- **Função**: Integração com Chakra UI
- **Recursos**: Sistema de design modular
- **Uso**: Componentes e temas Chakra

## Arquivos de Configuração

### Global (`/home/angel/.config/Code/User/settings.json`)
- Configuração global do VS Code
- Aplicado a todos os projetos
- Usa variáveis de ambiente para credenciais

### Workspace (`.vscode/mcp.json`)
- Configuração específica do projeto
- Compartilhada com a equipe via git
- Inclui inputs seguros para credenciais

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente:

```bash
# GitHub
export GITHUB_TOKEN="seu_token_aqui"

# Figma
export FIGMA_API_KEY="sua_chave_figma_aqui"

# Supabase (já configuradas no projeto)
export SUPABASE_ACCESS_TOKEN_CRESOL="token_do_cresol"
export SUPABASE_SERVICE_ROLE_KEY="chave_service_role"
```

## Como Usar

### 1. Ativar MCP Servers
- Abra o VS Code
- Acesse a view de Extensions (Ctrl+Shift+X)
- Procure por "MCP" na lista de servidores
- Ative os servidores desejados

### 2. Usar no Chat do Copilot
- Abra o chat do GitHub Copilot
- Use `@mcp` seguido do nome do servidor
- Exemplos:
  ```
  @mcp:supabase-cresol Execute a query SELECT * FROM profiles LIMIT 5
  @mcp:playwright Take a screenshot of the homepage
  @mcp:figma Get design tokens from the current file
  ```

### 3. Gerenciar Servidores
Na view de Extensions, você pode:
- **Start/Stop/Restart**: Controlar servidores
- **Show Output**: Ver logs para debug
- **Show Configuration**: Ver configuração atual
- **Uninstall**: Remover servidores

## Recursos por Servidor

### Supabase
```
- Execute SQL queries
- List tables and schemas
- Manage migrations
- Get project info
- View logs
```

### Playwright
```
- Navigate to URLs
- Take screenshots
- Click elements
- Fill forms
- Run tests
```

### Figma
```
- Get design data
- Extract components
- Download assets
- Process comments
```

### Context7
```
- Get library documentation
- Find code examples
- Check best practices
```

## Troubleshooting

### Problemas Comuns

1. **Servidor não inicia**
   - Verificar se o npx está instalado
   - Verificar variáveis de ambiente
   - Ver logs com "Show Output"

2. **Credenciais inválidas**
   - Verificar tokens de API
   - Regenerar chaves se necessário
   - Verificar permissões

3. **Performance lenta**
   - Desativar servidores não utilizados
   - Verificar logs para erros
   - Reiniciar servidores

### Logs e Debug
- Use "Show Output" para ver logs detalhados
- Logs ficam em: `~/.vscode/extensions/*/logs/`
- Verifique conectividade de rede para servidores externos

## Segurança

- Nunca commitar API keys no código
- Use variáveis de ambiente ou inputs seguros
- Revise permissões de tokens regularmente
- Mantenha servidores atualizados

## Atualizações

Os servidores MCP são automaticamente atualizados quando configurados com `-y` flag no npx. Para forçar atualizações:

```bash
npx clear-npx-cache
```

Depois reinicie os servidores no VS Code.