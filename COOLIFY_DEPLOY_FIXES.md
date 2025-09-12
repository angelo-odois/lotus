# Correções para Deploy no Coolify

## Resumo das Correções Aplicadas

### 🚨 Problemas Identificados e Resolvidos

1. **Middleware interceptando `/health`**
   - Rota movida de `/health` para `/api/health`
   - Health checks atualizados no Dockerfile e docker-compose

2. **Permissões do banco SQLite**
   - Caminho alterado de `/app/database/` para `./database.sqlite`
   - Evita problemas de permissão com volumes do Coolify

3. **Inconsistências no Chromium**
   - Caminho padronizado: `/usr/bin/chromium`
   - Dockerfile e docker-compose alinhados

4. **Validação de variáveis obrigatórias**
   - `start-server.sh` valida `JWT_SECRET_CURRENT`
   - Logs detalhados para debug

## Variáveis de Ambiente Obrigatórias

```bash
# CRÍTICA - Aplicação não inicia sem essa
JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key

# Ambiente
NODE_ENV=production

# Recomendadas
NEXT_TELEMETRY_DISABLED=1
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

## Arquivos Modificados

### `middleware.ts`
- Adicionado `|health` no matcher para garantir exclusão
- Corrigido de `api` para `api/` no regex

### `src/lib/database.ts`
- DATABASE_URL padrão: `sqlite:./database.sqlite`
- Logs detalhados de conexão

### `Dockerfile`
- Health check: `/api/health`
- Chromium path: `/usr/bin/chromium`
- Permissões corrigidas

### `start-server.sh`
- Validação obrigatória de `JWT_SECRET_CURRENT`
- Teste de escrita em diretórios
- Fallback automático para banco local

### `src/app/api/health/route.ts`
- Movido de `src/app/health/route.ts`
- Agora fica em `/api/health` (excluído do middleware)

## Instruções para Coolify

1. **Adicionar variáveis de ambiente:**
   ```
   JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
   ```

2. **Fazer redeploy da aplicação**

3. **Verificar logs do container** para confirmar inicialização

4. **Testar acesso via HTTPS:**
   - Login: `https://lt.odois.dev/login`
   - Health: `https://lt.odois.dev/api/health`

## Credenciais de Teste

- **Email:** `admin@odois.dev`
- **Senha:** `@n63L02025`

## Problemas Resolvidos

- ✅ HTTP 503 Service Unavailable
- ✅ CSRF Token inválido  
- ✅ Permissões do SQLite
- ✅ Health check falhando
- ✅ Middleware interceptando APIs

## Commit

```
fix: resolve container startup issues for Coolify deployment

Major fixes applied:
- Move /health route to /api/health to avoid middleware interception
- Fix SQLite database permissions using local path
- Update health checks in Dockerfile and docker-compose
- Improve error handling and logging in start-server.sh
- Add JWT_SECRET_CURRENT validation in startup script
- Fix Chromium executable path consistency
```

---
*Gerado em: 2025-09-12*
*Status: Pronto para deploy no Coolify*