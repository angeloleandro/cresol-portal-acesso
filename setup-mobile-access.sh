#!/bin/bash
# Script para configurar acesso mobile ao terminal Claude Code
# Autor: Claude AI Assistant
# Data: 25/08/2025

echo "📱 CONFIGURANDO ACESSO MOBILE AO TERMINAL CLAUDE CODE"
echo "=================================================="

# Detectar IP local
LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $7}' | head -n1)
echo "🌐 Seu IP local: $LOCAL_IP"

echo ""
echo "🎯 OPÇÕES DISPONÍVEIS:"
echo "1) Configurar SSH para Termux (Android)"
echo "2) Instalar Wetty (Terminal Web)"
echo "3) Configurar Ngrok Tunnel"
echo "4) Mostrar apenas instruções"
echo ""

read -p "Escolha uma opção (1-4): " option

case $option in
    1)
        echo "🔧 CONFIGURANDO SSH PARA ACESSO MOBILE..."
        
        # Verificar se SSH está rodando
        if systemctl is-active --quiet ssh; then
            echo "✅ SSH já está ativo"
        else
            echo "🔄 Iniciando serviço SSH..."
            sudo systemctl start ssh
            sudo systemctl enable ssh
        fi
        
        echo "📋 INSTRUÇÕES PARA O CELULAR:"
        echo "1. Instale o Termux (Android) ou iSH (iOS)"
        echo "2. No app, execute:"
        echo "   pkg install openssh (Termux) ou apk add openssh (iSH)"
        echo "3. Conecte com:"
        echo "   ssh $USER@$LOCAL_IP"
        echo "4. Acesse o terminal compartilhado:"
        echo "   tmux attach -t claude-code:cresol-portal"
        ;;
        
    2)
        echo "🔧 INSTALANDO WETTY (Terminal Web)..."
        
        # Verificar se Node.js está instalado
        if command -v npm &> /dev/null; then
            echo "✅ Node.js encontrado"
            npm install -g wetty
            echo "🚀 Para iniciar o Wetty, execute:"
            echo "   wetty --port 3001 --title 'Claude Code Terminal'"
            echo "   Acesse em: http://$LOCAL_IP:3001"
        else
            echo "❌ Node.js não encontrado. Instale primeiro:"
            echo "   sudo apt install nodejs npm"
        fi
        ;;
        
    3)
        echo "🔧 CONFIGURANDO NGROK TUNNEL..."
        
        if command -v ngrok &> /dev/null; then
            echo "✅ Ngrok encontrado"
            echo "🚀 Para criar tunnel SSH, execute:"
            echo "   ngrok tcp 22"
        else
            echo "📥 Instalando Ngrok..."
            curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
            echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
            sudo apt update && sudo apt install ngrok
            echo "✅ Ngrok instalado! Execute novamente esta opção."
        fi
        ;;
        
    4)
        echo "📋 INSTRUÇÕES RESUMIDAS:"
        echo ""
        echo "🤖 ANDROID (Termux):"
        echo "1. Instale Termux da Play Store"
        echo "2. pkg install openssh"
        echo "3. ssh $USER@$LOCAL_IP"
        echo "4. tmux attach -t claude-code:cresol-portal"
        echo ""
        echo "🍎 iOS (iSH):"
        echo "1. Instale iSH da App Store"
        echo "2. apk add openssh-client"
        echo "3. ssh $USER@$LOCAL_IP"
        echo "4. tmux attach -t claude-code:cresol-portal"
        echo ""
        echo "🌐 WEB (Qualquer dispositivo):"
        echo "1. npm install -g wetty"
        echo "2. wetty --port 3001"
        echo "3. Acesse http://$LOCAL_IP:3001"
        ;;
        
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "📝 DICAS IMPORTANTES:"
echo "• Certifique-se de estar na mesma rede WiFi"
echo "• Se usar dados móveis, considere Ngrok"
echo "• Para sessões longas, use 'tmux detach' (Ctrl+b + d)"
echo "• O terminal compartilhado permite múltiplos acessos simultâneos"

echo ""
echo "✅ Configuração concluída!"
