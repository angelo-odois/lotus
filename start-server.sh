#!/bin/sh

echo "🚀 Iniciando servidor Lotus..."

# Verificar variáveis obrigatórias
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não definida!"
    exit 1
fi

# Configurações do container
export PORT=3000
export HOSTNAME="0.0.0.0"
export NODE_ENV="production"

echo "✅ Configurações aplicadas: PORT=$PORT, HOSTNAME=$HOSTNAME, NODE_ENV=$NODE_ENV"

# Verificar se o arquivo server.js existe
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Erro: server.js não encontrado em .next/standalone/"
    exit 1
fi

echo "📁 Iniciando aplicação Next.js..."

# Iniciar o servidor
exec node .next/standalone/server.js