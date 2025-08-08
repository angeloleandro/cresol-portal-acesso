# Configuração MCP para VS Code GitHub Copilot

Este projeto está configurado para usar servidores MCP (Model Context Protocol) com o GitHub Copilot no VS Code.

## ⚠️ Importante

O VS Code não suporta MCP diretamente como o Claude Desktop. Em vez disso, ele usa o **GitHub Copilot Agent Mode** para integração com servidores MCP.

## 📦 Pré-requisitos

1. **VS Code** instalado
2. **GitHub Copilot** (extensão paga)
3. **GitHub Copilot Chat** (extensão)
4. **Node.js** instalado (para servidores MCP)

## 🔧 Configuração

### 1. Instale as extensões necessárias

```bash
code --install-extension github.copilot
code --install-extension github.copilot-chat
```

### 2. Configure as variáveis de ambiente

Edite o arquivo `.env.local` e configure seus tokens:

```bash
# GitHub Token (para o servidor GitHub MCP)
GITHUB_TOKEN=seu_token_github_aqui

# Supabase Access Tokens (para os servidores Supabase MCP)
SUPABASE_ACCESS_TOKEN=seu_token_supabase_aqui
SUPABASE_ACCESS_TOKEN_CRESOL=seu_token_supabase_cresol_aqui
```

### 3. Exporte as variáveis no terminal

```bash
export GITHUB_TOKEN=seu_token_github_aqui
export SUPABASE_ACCESS_TOKEN=seu_token_supabase_aqui
export SUPABASE_ACCESS_TOKEN_CRESOL=seu_token_supabase_cresol_aqui
```

### 4. Configuração já está feita!

Os arquivos de configuração já estão criados:
- `.vscode/settings.json` - Configuração do workspace
- `~/.config/Code/User/settings.json` - Configuração global do usuário

## 🚀 Como usar

1. **Abra o VS Code** neste projeto
2. **Abra o GitHub Copilot Chat** (Ctrl+Shift+I ou View → Command Palette → GitHub Copilot Chat)
3. **Use o Agent Mode** digitando `@agent` no chat
4. **Os servidores MCP estarão disponíveis** através do agent

## 🛠️ Servidores MCP Configurados

- **GitHub** - Interação com repositórios GitHub
- **Supabase Prisma IA** - Acesso ao projeto Prisma IA
- **Supabase Thais Silva Terapeuta** - Acesso ao projeto (somente leitura)
- **Supabase Cresol** - Acesso ao projeto principal Cresol

## 🔍 Verificação da configuração

Execute o script de verificação:

```bash
./check-mcp-config.sh
```

## 📚 Recursos úteis

- [VS Code GitHub Copilot MCP Documentation](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub Token Creation](https://github.com/settings/tokens)
- [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens)

## ❓ Solução de problemas

### MCP servers não aparecem
1. Verifique se as variáveis de ambiente estão exportadas
2. Reinicie o VS Code
3. Verifique se o GitHub Copilot está ativo

### Tokens não funcionam
1. Verifique se os tokens têm as permissões corretas
2. Para GitHub: permissões de repo, read:user
3. Para Supabase: permissões de acesso ao projeto

### Agent não responde
1. Certifique-se de usar `@agent` no chat
2. Verifique se o GitHub Copilot está ativo
3. Tente recarregar a janela do VS Code
