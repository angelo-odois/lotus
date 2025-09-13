# 🚀 Deploy no Coolify - Lotus

## ⚠️ **CRÍTICO - Variáveis Obrigatórias**

O projeto **NÃO FUNCIONARÁ** sem estas variáveis no Coolify:

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
- [ ] **Health Check**: `/api/health` (NÃO `/`)
- [ ] **Port**: `3000`
- [ ] **Timeout**: 180s (startup) / 30s (health)

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

### ❌ **Health Check falhando**
```bash
# PROBLEMA: Health check configurado para "/"
# SOLUÇÃO: Configure para "/api/health"
health_check_path: /api/health
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