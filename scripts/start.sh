#!/bin/bash

# Script de startup otimizado para produção

echo "🚀 Iniciando aplicação Lotus..."

# Verificar se .next existe
if [ ! -d ".next" ]; then
  echo "❌ Diretório .next não encontrado!"
  exit 1
fi

# Definir variáveis de ambiente
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export PORT=3000
export HOSTNAME="0.0.0.0"

# Criar diretório para PDFs se não existir
mkdir -p /app/propostas

echo "✅ Ambiente configurado"
echo "📂 Diretório propostas: $(ls -la propostas 2>/dev/null || echo 'criado')"
echo "🌐 Iniciando servidor na porta $PORT..."

# Iniciar aplicação
exec npm start