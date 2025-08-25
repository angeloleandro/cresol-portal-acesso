#!/bin/bash
# Script para facilitar o acesso ao terminal compartilhado Claude Code
# para o projeto cresol-portal-acesso

PROJECT_DIR="/home/angel/projetos/cresol-portal-acesso"
SESSION_NAME="claude-code"
WINDOW_NAME="cresol-portal"

echo "🚀 Configurando terminal compartilhado Claude Code para cresol-portal-acesso"

# Verificar se a sessão existe
if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "📝 Criando nova sessão $SESSION_NAME..."
    tmux new-session -d -s $SESSION_NAME -c $PROJECT_DIR
fi

# Verificar se a janela específica do projeto existe
if ! tmux list-windows -t $SESSION_NAME | grep -q $WINDOW_NAME; then
    echo "📝 Criando nova janela $WINDOW_NAME..."
    tmux new-window -t $SESSION_NAME -n $WINDOW_NAME -c $PROJECT_DIR
fi

echo "✅ Configuração concluída!"
echo ""
echo "Para acessar o terminal compartilhado:"
echo "  tmux attach -t $SESSION_NAME"
echo ""
echo "Para acessar diretamente a janela do projeto:"
echo "  tmux attach -t $SESSION_NAME:$WINDOW_NAME"
echo ""
echo "Para listar janelas disponíveis:"
echo "  tmux list-windows -t $SESSION_NAME"
echo ""
echo "Comandos úteis no tmux:"
echo "  Ctrl+b + c       : Nova janela"
echo "  Ctrl+b + n       : Próxima janela"
echo "  Ctrl+b + p       : Janela anterior"
echo "  Ctrl+b + ,       : Renomear janela"
echo "  Ctrl+b + \"      : Dividir painel horizontalmente"
echo "  Ctrl+b + %       : Dividir painel verticalmente"
echo "  Ctrl+b + d       : Desanexar da sessão"
