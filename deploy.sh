#!/bin/bash

# 🚀 Script de Deploy - Lotus
# Executa o build e prepara arquivos para produção

echo "🏗️  Fazendo build de produção..."
rm -rf .next
npm run build

echo "✅ Build concluído!"
echo ""
echo "📦 Arquivos prontos para deploy em:"
echo "   📁 .next/standalone/ - Servidor Node.js"
echo "   📁 .next/static/ - Assets estáticos"
echo "   📁 public/ - Arquivos públicos"
echo ""
echo "🔧 Variáveis de ambiente necessárias no servidor:"
echo "   DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus"
echo "   JWT_SECRET_CURRENT=production-jwt-secret-32-chars-minimum-required"
echo "   NODE_ENV=production"
echo ""
echo "🧪 Após deploy, teste em:"
echo "   🌐 https://lt.odois.dev/debug.html"
echo "   📡 https://lt.odois.dev/api/debug"
echo "   🔍 https://lt.odois.dev/api/propostas?dashboard=true"
echo ""
echo "📋 Ver instruções completas: cat DEPLOY_INSTRUCTIONS.md"