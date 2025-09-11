#!/bin/sh

echo "🚀 Iniciando servidor Lotus..."
echo "📊 Variáveis de ambiente:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "HOSTNAME: $HOSTNAME"
echo "PWD: $(pwd)"

# Verificar se o arquivo server.js existe
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Erro: server.js não encontrado em .next/standalone/"
    echo "📁 Conteúdo do diretório atual:"
    ls -la
    echo "📁 Conteúdo de .next/:"
    ls -la .next/ || echo "Diretório .next não existe"
    exit 1
fi

echo "✅ server.js encontrado"
echo "📁 Iniciando aplicação..."

# Iniciar o servidor
exec node .next/standalone/server.js