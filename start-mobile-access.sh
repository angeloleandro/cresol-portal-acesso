#!/bin/bash
# Script para iniciar serviços de acesso mobile ao Claude Code Terminal

echo "🚀 INICIANDO SERVIÇOS DE ACESSO MOBILE..."

# Verificar se Wetty já está rodando
if pgrep -f "wetty.*3001" > /dev/null; then
    echo "✅ Wetty já está rodando na porta 3001"
else
    echo "🔄 Iniciando Wetty..."
    nohup wetty --port 3001 --title "Claude Code Terminal - Cresol Portal" > wetty.log 2>&1 &
    sleep 2
    echo "✅ Wetty iniciado!"
fi

# Obter IP local
LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $7}' | head -n1)

echo ""
echo "📱 COMO ACESSAR NO CELULAR:"
echo "==============================================="
echo ""
echo "🌐 NAVEGADOR (Mais fácil):"
echo "   http://$LOCAL_IP:3001"
echo ""
echo "🤖 TERMUX (Android):"
echo "   1. pkg install openssh"
echo "   2. ssh angel@$LOCAL_IP"
echo "   3. tmux attach -t claude-code:cresol-portal"
echo ""
echo "🍎 iSH (iOS):"
echo "   1. apk add openssh-client"
echo "   2. ssh angel@$LOCAL_IP" 
echo "   3. tmux attach -t claude-code:cresol-portal"
echo ""
echo "📝 IMPORTANTE:"
echo "• Celular deve estar na mesma rede WiFi"
echo "• Para sair do tmux: Ctrl+b depois d"
echo "• Para voltar: tmux attach -t claude-code"
echo ""
echo "🔍 Status dos serviços:"
echo "• Wetty (Web): $(pgrep -f wetty > /dev/null && echo "✅ Rodando" || echo "❌ Parado")"
echo "• SSH: $(systemctl is-active --quiet ssh && echo "✅ Ativo" || echo "❌ Inativo")"
echo "• Tmux Claude: $(tmux has-session -t claude-code 2>/dev/null && echo "✅ Ativo" || echo "❌ Inativo")"
