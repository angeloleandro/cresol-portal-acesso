# 📱 Guia Termius - Acesso ao Terminal Claude Code

## 🎯 Configuração do Termius para acessar o Terminal Compartilhado

### ✅ **Passo 1: Criar Nova Conexão SSH no Termius**

1. **Abra o Termius** no seu Android
2. **Toque no "+" ou "Add Host"**
3. **Configure os seguintes dados:**
   ```
   Hostname/IP: 172.27.120.254
   Username: angel
   Port: 22
   Password: [sua senha do computador]
   ```
4. **Nome da conexão:** "Claude Code - Cresol Portal"
5. **Salve a configuração**

### ✅ **Passo 2: Conectar e Acessar o Terminal Compartilhado**

1. **Conecte** à sessão SSH criada
2. **Após conectar, execute:**
   ```bash
   tmux attach -t claude-code:cresol-portal
   ```
3. **Pronto!** Você estará no terminal compartilhado

### ✅ **Comandos Úteis no Termius + Tmux**

#### **Navegação Tmux:**
- `Ctrl+b + c` - Nova janela
- `Ctrl+b + n` - Próxima janela  
- `Ctrl+b + p` - Janela anterior
- `Ctrl+b + d` - Desanexar (sair sem fechar)
- `Ctrl+b + ,` - Renomear janela atual

#### **Comandos de Sessão:**
```bash
# Listar sessões tmux
tmux list-sessions

# Atachar à sessão principal
tmux attach -t claude-code

# Atachar à janela específica do projeto
tmux attach -t claude-code:cresol-portal

# Listar janelas da sessão
tmux list-windows -t claude-code
```

### ✅ **Configurações Recomendadas no Termius**

#### **Teclado:**
- Ativar "Extended keyboard"
- Configurar teclas Ctrl+B para tmux
- Ativar "Function keys" se necessário

#### **Terminal:**
- Font size: 12-14 (para mobile)
- Theme: Dark (melhor para bateria)
- Cursor: Block ou Underline

### ✅ **Scripts de Acesso Rápido**

Após conectar via SSH, você pode usar estes comandos:

```bash
# Acesso direto ao projeto
tmux attach -t claude-code:cresol-portal

# Se a sessão não existir, criar
tmux new-session -d -s claude-code -c /home/angel/projetos/cresol-portal-acesso

# Listar todas as sessões disponíveis
tmux ls
```

### ✅ **Dicas Importantes**

1. **Conectividade:** Certifique-se de estar na mesma rede WiFi
2. **Bateria:** Use tema escuro para economizar bateria
3. **Sesão Persistente:** O tmux mantém as sessões mesmo se desconectar
4. **Múltiplos Acessos:** Você pode conectar de vários dispositivos simultaneamente

### ✅ **Resolução de Problemas**

#### **Se não conseguir conectar:**
```bash
# No computador, verificar se SSH está ativo:
sudo systemctl status ssh
sudo systemctl start ssh
```

#### **Se a sessão tmux não existir:**
```bash
# Criar nova sessão para o projeto:
tmux new-session -d -s claude-code -n cresol-portal -c /home/angel/projetos/cresol-portal-acesso
```

#### **IP mudou:**
```bash
# No computador, verificar novo IP:
ip route get 1.1.1.1 | awk '{print $7}' | head -n1
```

### ✅ **Atalhos Úteis no Termius**

- **Swipe para cima:** Mostrar teclado virtual
- **Dois toques:** Selecionar palavra
- **Toque longo:** Menu contextual
- **Pinch to zoom:** Ajustar tamanho da fonte

---

## 🚀 **Teste Rápido:**

1. Configure a conexão SSH no Termius
2. Conecte usando: `angel@172.27.120.254`
3. Execute: `tmux attach -t claude-code:cresol-portal`
4. Você deve ver o terminal compartilhado do projeto!
