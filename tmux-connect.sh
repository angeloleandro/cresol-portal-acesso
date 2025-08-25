#!/bin/bash
# Script simples para replicar o comportamento que você já usa
# Mostra sessões numeradas e permite escolher como você faz com 'p'

echo "🔗 SESSÕES TMUX DISPONÍVEIS:"
echo "=============================="

# Listar sessões com números
sessions=($(tmux list-sessions -F '#{session_name}' 2>/dev/null))

if [ ${#sessions[@]} -eq 0 ]; then
    echo "❌ Nenhuma sessão tmux encontrada!"
    echo "💡 Para criar uma nova sessão:"
    echo "   tmux new-session -d -s nome-da-sessao"
    exit 1
fi

echo ""
for i in "${!sessions[@]}"; do
    session_name="${sessions[i]}"
    session_info=$(tmux list-sessions | grep "^$session_name:")
    echo "$((i+1))) $session_info"
done

echo ""
echo "📱 COMO USAR NO TERMIUS:"
echo "• Digite o número da sessão desejada"
echo "• Ou pressione 'q' para sair"
echo ""

while true; do
    read -p "Digite o número da sessão (1-${#sessions[@]}) ou 'q' para sair: " choice
    
    if [[ "$choice" == "q" || "$choice" == "Q" ]]; then
        echo "👋 Saindo..."
        exit 0
    fi
    
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#sessions[@]}" ]; then
        selected_session="${sessions[$((choice-1))]}"
        echo ""
        echo "🚀 Conectando à sessão: $selected_session"
        echo "💡 Para sair: Ctrl+b depois d"
        echo ""
        sleep 1
        tmux attach-session -t "$selected_session"
        exit 0
    else
        echo "❌ Número inválido! Digite um número entre 1 e ${#sessions[@]}"
    fi
done
