# 🚀 Instruções de Deploy - Lotus

## ⚠️ Problema Atual
O site `https://lt.odois.dev` está rodando uma versão anterior que **NÃO** inclui:
- ✅ Endpoint `/api/propostas` recriado 
- ✅ Endpoint `/api/debug` para diagnóstico
- ✅ Arquivo `/debug.html` para testes
- ✅ Logs de debugging extensivos

## 📦 Arquivos Prontos para Deploy
O build mais recente está em `.next/` e inclui todas as correções.

## 🔧 Variáveis de Ambiente Necessárias

Para produção, você precisa configurar estas variáveis no servidor:

```bash
# Database
DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus

# JWT Secret (OBRIGATÓRIO para auth)
JWT_SECRET_CURRENT=production-jwt-secret-32-chars-minimum-required

# Node Environment
NODE_ENV=production

# Port (opcional - depende do setup)
PORT=3000
```

## 📋 Checklist de Deploy

### 1. **Parar Servidor Atual**
```bash
# No servidor de produção
pm2 stop lotus
# ou
pkill -f "node.*server.js"
```

### 2. **Fazer Upload da Nova Versão**
Copie todo o conteúdo da pasta `.next/` para o servidor.

### 3. **Configurar Variáveis de Ambiente**
```bash
# Criar/editar arquivo .env no servidor
echo "DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus" > .env
echo "JWT_SECRET_CURRENT=production-jwt-secret-32-chars-minimum-required" >> .env
echo "NODE_ENV=production" >> .env
```

### 4. **Iniciar Servidor**
```bash
# Método 1: Direto
cd .next/standalone
NODE_ENV=production node server.js

# Método 2: Com PM2 (recomendado)
pm2 start server.js --name lotus --env production
```

### 5. **Verificar Funcionamento**
Após deploy, acesse:
- `https://lt.odois.dev/debug.html` - Interface de diagnóstico
- `https://lt.odois.dev/api/debug` - API de diagnóstico
- `https://lt.odois.dev/api/propostas?dashboard=true` - Endpoint principal

## 🧪 Testes Após Deploy

### Teste 1: API Debug
```bash
curl "https://lt.odois.dev/api/debug" | jq .
```

### Teste 2: Propostas Endpoint
```bash
curl "https://lt.odois.dev/api/propostas?dashboard=true&limit=3"
```

### Teste 3: Interface Visual
Acesse `https://lt.odois.dev/debug.html` no navegador e teste os botões.

## ❌ Problemas Comuns

### 1. **404 nos Endpoints**
- **Causa**: Versão antiga ainda rodando
- **Solução**: Verificar se fez upload correto e reiniciou servidor

### 2. **500 Internal Server Error**
- **Causa**: Variáveis de ambiente faltando
- **Solução**: Verificar `DATABASE_URL` e `JWT_SECRET_CURRENT`

### 3. **Conexão Database Failed**
- **Causa**: `DATABASE_URL` incorreta ou banco inacessível
- **Solução**: Testar conexão manualmente

### 4. **Auth Failing**
- **Causa**: `JWT_SECRET_CURRENT` não configurado
- **Solução**: Adicionar variável com pelo menos 32 caracteres

## 📞 Suporte
Se continuar com problemas após deploy:
1. Acesse `https://lt.odois.dev/debug.html`
2. Execute todos os testes
3. Copie os logs que aparecem
4. Envie os logs para análise

---
**Status**: ✅ Build Pronto | ❌ Deploy Pendente