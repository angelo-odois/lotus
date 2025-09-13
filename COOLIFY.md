# 🚀 Deploy no Coolify - Lotus

## ⚠️ **CRÍTICO - Variáveis Obrigatórias**

O projeto **NÃO FUNCIONARÁ** sem estas variáveis no Coolify:

## 🛡️ **IMPORTANTE - Proteção contra variáveis automáticas**

O Coolify define automaticamente variáveis como `SERVICE_FQDN_LOTUS_APP` e `SERVICE_URL_LOTUS_APP` que **QUEBRAM** o acesso ao domínio `lt.odois.dev`. 

✅ **SOLUÇÃO**: O projeto já tem proteção automática contra essas variáveis.

```env
# 🔐 OBRIGATÓRIO - PostgreSQL Database
DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus

# 🌐 OBRIGATÓRIO - Ambiente
NODE_ENV=production


# 🔧 OPCIONAL - Telemetria
NEXT_TELEMETRY_DISABLED=1
```

## 📋 **Checklist de Deploy**

### ✅ **1. Configurações no Coolify**
- [ ] **Domain**: `lt.odois.dev`
- [ ] **Health Check Path**: `/api/ping` (endpoint super simples)
- [ ] **Health Check Method**: `GET`
- [ ] **Health Check Response Text**: `ok`
- [ ] **Health Check Timeout**: `60s`
- [ ] **Port**: `3000`
- [ ] **Startup Timeout**: `300s` (5 minutos)

### ✅ **2. Variáveis de Ambiente**
Copie **EXATAMENTE** estas variáveis para o Coolify:

```env
DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus
JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### ✅ **3. Volume Configuration**
- **Host Path**: `/opt/coolify/lotus/propostas`
- **Container Path**: `/app/propostas`
- **Description**: PDFs gerados pelas propostas

### ✅ **4. Resources**
- **Memory**: 512MB (reserved) / 1GB (limit)
- **CPU**: 0.25 (reserved) / 0.5 (limit)

## 🔍 **Troubleshooting**

### ❌ **"DATABASE_URL is required"**
```bash
# SOLUÇÃO: Adicione a variável no Coolify
DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus
```

### ❌ **Erro 404 - Failed to load resource**

**DISPONÍVEIS MÚLTIPLOS ENDPOINTS PARA DEBUG:**

1. **`/api/ping`** - JSON simples {"status":"ok"}
2. **`/api/health`** - Texto simples "OK" 
3. **`/api/coolify-debug`** - Info detalhada do ambiente
4. **`/api`** - Endpoint raiz da API

**CONFIGURAÇÃO RECOMENDADA NO COOLIFY:**

```bash
# Use estas configurações EXATAS:
Domain: lt.odois.dev
Port: 3000
Health Check Path: /api/ping
Health Check Method: GET
Health Check Timeout: 30s
Startup Timeout: 180s

# NÃO defina health_check_response_text - deixe vazio!
```

**DEBUGGING 404 - TESTE ESTAS URLs:**

```bash
# 1. Primeiro teste o health check:
curl https://lt.odois.dev/api/ping

# 2. Teste o debug específico do Coolify:
curl https://lt.odois.dev/api/coolify-debug

# 3. Teste a página principal:
curl https://lt.odois.dev/

# 4. Teste a API raiz:
curl https://lt.odois.dev/api
```

**TROUBLESHOOTING AVANÇADO:**
```bash
# 1. VERIFICAR se o container está rodando:
# Logs devem mostrar: "Ready in XXXms"

# 2. TESTAR INTERNAMENTE no Coolify:
# Se possível, exec no container:
curl http://localhost:3000/api/health
curl http://localhost:3000/api/status  
curl http://localhost:3000/api/ping

# 3. VERIFICAR PORTA:
# Coolify deve usar porta 3000 (não 80)

# 4. TIMEOUT MAIS ALTO:
# Startup: 600s (10 minutos)
# Health: 120s (2 minutos)
```

### ❌ **Container não inicia**
```bash
# VERIFIQUE: Logs do container no Coolify
# CAUSA COMUM: DATABASE_URL faltando ou incorreta
```

### ❌ **Erro de banco de dados**
```bash
# VERIFIQUE: DATABASE_URL correta
# TESTE: curl https://lt.odois.dev/api/setup
# ERRO COMUM: "database 'lotus' does not exist"
```

### ❌ **Acesso ao domínio lt.odois.dev não funciona**
```bash
# PROBLEMA: Coolify define automaticamente SERVICE_FQDN_LOTUS_APP e SERVICE_URL_LOTUS_APP
# CAUSA: Essas variáveis interferem na detecção de HTTPS e cookies
# SOLUÇÃO: O projeto já remove essas variáveis automaticamente no start-server.sh

# VERIFICAR logs do container:
# "⚠️  Coolify auto-var detected (ignored): SERVICE_FQDN_LOTUS_APP=..."
# "🛡️  Removendo variáveis automáticas do Coolify que podem causar problemas..."
```

## 🧪 **Testes Após Deploy**

Execute estes testes após deploy:

```bash
# 1. Health check
curl https://lt.odois.dev/api/health

# 2. Debug info
curl https://lt.odois.dev/api/debug-coolify

# 3. Test PDF
curl https://lt.odois.dev/api/test-pdf

# 4. Login admin
curl -X POST https://lt.odois.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@odois.dev","password":"@n63L02025","csrfToken":"test"}'
```

## 🎯 **Respostas Esperadas**

### ✅ **Health Check**
```json
{
  "status": "ok",
  "timestamp": "2025-09-13T...",
  "environment": "production",
  "version": "1.0.0"
}
```

### ✅ **Debug Coolify**
```json
{
  "success": true,
  "debug": {
    "environment": {
      "NODE_ENV": "production",
      "COOLIFY_DOMAIN": "lt.odois.dev"
    },
    "computed": {
      "isHTTPS": true,
      "cookieName": "__Host-session"
    }
  }
}
```

## 🔄 **Processo de Deploy**

1. **Configure as variáveis** no Coolify
2. **Faça o deploy** da aplicação
3. **Aguarde ~3 minutos** para inicialização
4. **Teste os endpoints** acima
5. **Acesse** https://lt.odois.dev/login

## 📞 **Suporte**

Se o deploy falhar:

1. **Verifique os logs** do container no Coolify
2. **Confirme as variáveis** de ambiente
3. **Teste o health check** manualmente
4. **Verifique se o domínio** está resolvendo

---

**Status**: 🔧 Configuração corrigida
**Última atualização**: 2025-09-13