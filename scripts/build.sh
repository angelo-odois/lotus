#!/bin/bash

# Script de build para produção com Docker/Coolify

echo "🚀 Iniciando build para produção..."

# Definir variáveis de ambiente
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export REACT_EDITOR=""

# Instalar dependências se não existir node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm ci --only=production
fi

# Limpar build anterior
echo "🧹 Limpando builds anteriores..."
rm -rf .next
rm -rf out

# Build da aplicação
echo "🔨 Building aplicação Next.js..."
npm run build:docker

echo "✅ Build concluído com sucesso!"

# Verificar se o build foi bem-sucedido
if [ -d ".next" ]; then
  echo "✅ Diretório .next criado com sucesso"
else
  echo "❌ Erro: Diretório .next não foi criado"
  exit 1
fi

echo "🎉 Aplicação pronta para produção!"