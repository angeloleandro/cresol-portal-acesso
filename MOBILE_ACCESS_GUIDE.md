# 📱 Guia de Acesso Mobile ao Terminal Claude Code

## 🎯 Opções para acessar o terminal compartilhado no celular:

### ✅ **Opção 1: SSH via Termux (Android) ou iSH (iOS)**

#### **Android - Termux:**
1. Instale o Termux na Play Store
2. No Termux, instale SSH:
   ```bash
   pkg update && pkg install openssh
   ```
3. Conecte ao seu computador:
   ```bash
   ssh angel@SEU_IP_LOCAL
   ```
4. Acesse a sessão tmux:
   ```bash
   tmux attach -t claude-code:cresol-portal
   ```

#### **iOS - iSH Shell:**
1. Instale o iSH na App Store
2. Configure SSH similar ao Termux

### ✅ **Opção 2: VS Code Server + GitHub Codespaces**

#### **Configuração do VS Code Server:**
1. Instale a extensão "Remote - SSH" no VS Code
2. Configure tunnel do VS Code:
   ```bash
   code tunnel --accept-server-license-terms
   ```
3. Acesse via navegador mobile em `https://vscode.dev`

### ✅ **Opção 3: Tmate (Terminal Sharing)**

#### **Configuração Tmate:**
```bash
# Instalar tmate
sudo apt install tmate  # Ubuntu/Debian
brew install tmate      # macOS

# Criar sessão compartilhada
tmate new-session -d -s cresol-claude
tmate send-keys -t cresol-claude "cd /home/angel/projetos/cresol-portal-acesso" Enter
tmate send-keys -t cresol-claude "tmux attach -t claude-code:cresol-portal" Enter

# Obter link de acesso
tmate show-messages | grep "web session"
```

### ✅ **Opção 4: Servidor Web Terminal**

#### **Wetty (Web Terminal):**
```bash
npm install -g wetty
wetty --port 3001 --title "Claude Code Terminal"
```
Acesse via navegador: `http://SEU_IP:3001`

### ✅ **Opção 5: Ngrok Tunnel (Mais Simples)**

#### **Setup Ngrok:**
```bash
# Instalar ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Expor SSH via tunnel
ngrok tcp 22
```

## 🚀 **Configuração Recomendada (Mais Fácil):**

### **Script Automatizado:**
