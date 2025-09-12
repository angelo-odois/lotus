#!/bin/sh

echo "🚀 Iniciando servidor Lotus..."
echo "📊 Variáveis de ambiente:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "HOSTNAME: $HOSTNAME"
echo "JWT_SECRET_CURRENT: ${JWT_SECRET_CURRENT:0:10}..." # Mostrar só os primeiros 10 chars
echo "PWD: $(pwd)"

# Verificar variáveis obrigatórias
if [ -z "$JWT_SECRET_CURRENT" ]; then
    echo "❌ ERRO: JWT_SECRET_CURRENT não definida!"
    echo "⚠️ Esta variável é obrigatória para a aplicação funcionar"
    exit 1
fi

# Forçar configurações corretas para container
export PORT=3000
export HOSTNAME="0.0.0.0"
export NODE_ENV="production"

echo "🔧 Configurações aplicadas:"
echo "PORT: $PORT"
echo "HOSTNAME: $HOSTNAME" 
echo "NODE_ENV: $NODE_ENV"

# Verificar se o arquivo server.js existe
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Erro: server.js não encontrado em .next/standalone/"
    echo "📁 Conteúdo do diretório atual:"
    ls -la
    echo "📁 Conteúdo de .next/:"
    ls -la .next/ || echo "Diretório .next não existe"
    exit 1
fi

# Criar diretórios necessários e verificar permissões
mkdir -p /app/propostas
mkdir -p /app/database

echo "📁 Verificando permissões dos diretórios:"
ls -la /app/

# Testar se consegue criar arquivo no diretório do banco
echo "🗄️  Testando escrita no diretório do banco:"
touch /app/database/test.db && rm /app/database/test.db
if [ $? -eq 0 ]; then
    echo "✅ Diretório do banco está acessível"
else
    echo "❌ ERRO: Não é possível escrever no diretório do banco"
    exit 1
fi

echo "✅ server.js encontrado"
echo "📁 Iniciando aplicação Next.js..."

# Iniciar o servidor com configurações forçadas
exec node .next/standalone/server.js