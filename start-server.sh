#!/bin/sh

echo "🚀 Iniciando servidor Lotus..."

# COOLIFY PROTECTION: Remover variáveis automáticas problemáticas
# Essas variáveis são definidas automaticamente pelo Coolify e podem quebrar a aplicação
echo "🛡️  Removendo variáveis automáticas do Coolify que podem causar problemas..."
unset SERVICE_FQDN_LOTUS_APP
unset SERVICE_URL_LOTUS_APP
unset SERVICE_FQDN
unset SERVICE_URL

echo "📊 Variáveis de ambiente:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "HOSTNAME: $HOSTNAME"
echo "COOLIFY_DOMAIN: $COOLIFY_DOMAIN"
echo "DATABASE_URL: ${DATABASE_URL%%@*}@[HIDDEN]" # Mostrar só o início da URL
echo "PWD: $(pwd)"

# Verificar variáveis obrigatórias
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não definida!"
    echo "⚠️ Esta variável é obrigatória para a aplicação funcionar"
    echo "📝 Adicione no Coolify: DATABASE_URL=postgres://postgres:password@host:5432/lotus"
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

# Testar conexão com PostgreSQL
echo "🔗 Testando conexão com PostgreSQL..."
echo "DATABASE_URL configurado: ${DATABASE_URL%%@*}@[HIDDEN]"

echo "✅ server.js encontrado"
echo "📁 Iniciando aplicação Next.js..."

# Iniciar o servidor com configurações forçadas
exec node .next/standalone/server.js