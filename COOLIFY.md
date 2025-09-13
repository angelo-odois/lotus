# 🚀 Deploy no Coolify - Lotus

## ⚠️ **CRÍTICO - Variáveis Obrigatórias**

O projeto **NÃO FUNCIONARÁ** sem estas variáveis no Coolify:

## 🛡️ **IMPORTANTE - Proteção contra variáveis automáticas**

O Coolify define automaticamente variáveis como `SERVICE_FQDN_LOTUS_APP` e `SERVICE_URL_LOTUS_APP` que **QUEBRAM** o acesso ao domínio `lt.odois.dev`. 

✅ **SOLUÇÃO**: O projeto já tem proteção automática contra essas variáveis.

```env
# 🔐 OBRIGATÓRIO - JWT Secret (mínimo 32 caracteres)
JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key

# 🌐 OBRIGATÓRIO - Ambiente
NODE_ENV=production

# 🐳 OBRIGATÓRIO - Puppeteer para Docker
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 🔧 RECOMENDADO - Domain
COOLIFY_DOMAIN=lt.odois.dev

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
JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
COOLIFY_DOMAIN=lt.odois.dev
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

### ❌ **"JWT_SECRET_CURRENT is required"**
```bash
# SOLUÇÃO: Adicione a variável no Coolify
JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key
```

### ❌ **Health Check falhando ("no available server")**
```bash
# PROBLEMA: Coolify não consegue acessar o health check
# SOLUÇÕES:
# 1. Use o endpoint simples: /api/ping
# 2. Configure "Health Check Response Text": ok
# 3. Aumente timeout: 60s
# 4. Startup timeout: 300s (5 minutos)

# CONFIGURAÇÃO CORRETA:
health_check_path: /api/ping
health_check_method: GET
health_check_response_text: ok
health_check_timeout: 60
startup_timeout: 300
```

### ❌ **Container não inicia**
```bash
# VERIFIQUE: Logs do container no Coolify
# CAUSA COMUM: JWT_SECRET_CURRENT faltando ou muito curto (< 32 chars)
```

### ❌ **PDF não gera**
```bash
# VERIFIQUE: Variáveis do Puppeteer
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
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