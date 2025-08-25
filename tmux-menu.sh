#!/bin/bash
# Script de menu interativo para acessar sessões tmux via Termius
# Compatível com o workflow que você já usa

echo "🎯 MENU DE SESSÕES TMUX - CLAUDE CODE"
echo "====================================="

# Função para mostrar sessões disponíveis
show_sessions() {
    echo ""
    echo "📋 Sessões Disponíveis:"
    tmux list-sessions 2>/dev/null | nl -w2 -s') '
    echo ""
}

# Função para mostrar janelas de uma sessão
show_windows() {
    local session_name="$1"
    echo ""
    echo "🪟 Janelas da sessão '$session_name':"
    tmux list-windows -t "$session_name" 2>/dev/null | nl -w2 -s') '
    echo ""
}

# Menu principal
main_menu() {
    while true; do
        clear
        echo "🎯 MENU DE SESSÕES TMUX - CLAUDE CODE"
        echo "====================================="
        
        # Mostrar sessões
        show_sessions
        
        echo "Opções:"
        echo "p) Listar e escolher sessão (como você faz normalmente)"
        echo "c) Ir direto para claude-code"
        echo "r) Ir para cresol-portal-acesso"
        echo "w) Mostrar janelas de uma sessão"
        echo "n) Criar nova sessão"
        echo "q) Sair"
        echo ""
        
        read -p "Digite sua escolha (p/c/r/w/n/q): " choice
        
        case $choice in
            p|P)
                echo ""
                echo "📋 Escolha a sessão pelo número:"
                sessions=($(tmux list-sessions -F '#{session_name}' 2>/dev/null))
                
                if [ ${#sessions[@]} -eq 0 ]; then
                    echo "❌ Nenhuma sessão encontrada!"
                    read -p "Pressione Enter para continuar..."
                    continue
                fi
                
                for i in "${!sessions[@]}"; do
                    echo "$((i+1))) ${sessions[i]}"
                done
                echo ""
                
                read -p "Digite o número da sessão: " session_num
                
                if [[ "$session_num" =~ ^[0-9]+$ ]] && [ "$session_num" -ge 1 ] && [ "$session_num" -le "${#sessions[@]}" ]; then
                    selected_session="${sessions[$((session_num-1))]}"
                    echo "🚀 Conectando à sessão: $selected_session"
                    tmux attach-session -t "$selected_session"
                    exit 0
                else
                    echo "❌ Número inválido!"
                    read -p "Pressione Enter para continuar..."
                fi
                ;;
                
            c|C)
                echo "🚀 Conectando à sessão claude-code..."
                if tmux has-session -t claude-code 2>/dev/null; then
                    tmux attach-session -t claude-code
                    exit 0
                else
                    echo "❌ Sessão claude-code não encontrada!"
                    read -p "Pressione Enter para continuar..."
                fi
                ;;
                
            r|R)
                echo "🚀 Conectando à sessão cresol-portal..."
                if tmux has-session -t claude-code 2>/dev/null; then
                    tmux attach-session -t claude-code:cresol-portal
                    exit 0
                else
                    echo "❌ Sessão não encontrada!"
                    read -p "Pressione Enter para continuar..."
                fi
                ;;
                
            w|W)
                echo ""
                read -p "Digite o nome da sessão para ver janelas: " session_name
                if tmux has-session -t "$session_name" 2>/dev/null; then
                    show_windows "$session_name"
                    echo "Para conectar a uma janela específica:"
                    echo "tmux attach -t $session_name:NOME_DA_JANELA"
                else
                    echo "❌ Sessão '$session_name' não encontrada!"
                fi
                read -p "Pressione Enter para continuar..."
                ;;
                
            n|N)
                echo ""
                read -p "Nome da nova sessão: " new_session
                read -p "Diretório inicial (Enter para atual): " start_dir
                
                if [ -z "$start_dir" ]; then
                    start_dir="$(pwd)"
                fi
                
                echo "🚀 Criando sessão '$new_session' em '$start_dir'..."
                tmux new-session -d -s "$new_session" -c "$start_dir"
                echo "✅ Sessão criada! Conectando..."
                tmux attach-session -t "$new_session"
                exit 0
                ;;
                
            q|Q)
                echo "👋 Saindo..."
                exit 0
                ;;
                
            *)
                echo "❌ Opção inválida!"
                read -p "Pressione Enter para continuar..."
                ;;
        esac
    done
}

# Verificar se tmux está instalado
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux não está instalado!"
    exit 1
fi

# Executar menu principal
main_menu
