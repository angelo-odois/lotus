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
echo "JWT_SECRET_CURRENT: ${JWT_SECRET_CURRENT:0:10}..." # Mostrar só os primeiros 10 chars
echo "PWD: $(pwd)"

# Verificar variáveis obrigatórias
if [ -z "$JWT_SECRET_CURRENT" ]; then
    echo "❌ ERRO: JWT_SECRET_CURRENT não definida!"
    echo "⚠️ Esta variável é obrigatória para a aplicação funcionar"
    echo "📝 Adicione no Coolify: JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key"
    exit 1
fi

# Validar tamanho mínimo do JWT secret
if [ ${#JWT_SECRET_CURRENT} -lt 32 ]; then
    echo "❌ ERRO: JWT_SECRET_CURRENT deve ter pelo menos 32 caracteres!"
    echo "⚠️ Tamanho atual: ${#JWT_SECRET_CURRENT}"
    echo "📝 Use: JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key"
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

# Criar diretórios necessários e corrigir permissões
echo "📁 Criando diretórios e corrigindo permissões..."
mkdir -p /app/propostas /app/database

# Como user nextjs pode não ter sudo, vamos tentar alternativas
echo "🔧 Corrigindo permissões dos diretórios:"
# Se não conseguir mudar permissões, usar diretório local
if [ ! -w "/app/database" ]; then
    echo "⚠️  Diretório /app/database não tem permissão de escrita"
    echo "🔄 Usando banco local na raiz do projeto..."
    export DATABASE_URL="sqlite:./database.sqlite"
fi

echo "📁 Verificando permissões dos diretórios:"
ls -la /app/ | head -20

# Testar onde consegue escrever
echo "🗄️  Testando escrita no diretório do banco:"
if [ -w "/app/database" ]; then
    touch /app/database/test.db && rm /app/database/test.db
    echo "✅ Diretório /app/database está acessível"
else
    echo "⚠️  Usando banco local: $DATABASE_URL"
    touch ./test.db && rm ./test.db
    echo "✅ Diretório local está acessível"
fi

echo "✅ server.js encontrado"
echo "📁 Iniciando aplicação Next.js..."

# Iniciar o servidor com configurações forçadas
exec node .next/standalone/server.js