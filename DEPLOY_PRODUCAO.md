# Deploy para Produção - Solução do Dashboard

## Problema Identificado
O dashboard em produção (lt.odois.dev) não estava listando as propostas devido à API `/api/propostas` não estar disponível (404).

## Causa Raiz
A aplicação deployada em produção não continha a versão mais recente do código, especificamente faltava a rota `/api/propostas`.

## Solução Verificada
1. ✅ **Banco de dados**: Conexão funcionando corretamente
2. ✅ **Código local**: API `/api/propostas` funcionando perfeitamente
3. ✅ **Build standalone**: Teste local bem-sucedido
4. ✅ **Propostas no banco**: 4 propostas confirmadas

## Comandos para Deploy

### 1. Fazer commit das mudanças
```bash
git add .
git commit -m "fix: add missing /api/propostas route for dashboard

- Dashboard em produção não listava propostas devido à rota API faltante
- Build standalone testado e funcionando corretamente
- Conexão com banco PostgreSQL confirmada
- 4 propostas encontradas no banco de produção

🤖 Generated with Claude Code"
```

### 2. Push para produção
```bash
git push origin main
```

### 3. Variáveis de ambiente necessárias
```bash
DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus
JWT_SECRET_CURRENT=[seu-jwt-secret]
NODE_ENV=production
```

## Testes Realizados

### Build Local
```bash
npm run build  # ✅ Sucesso
```

### Teste Standalone
```bash
cd .next/standalone
DATABASE_URL="postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus" \
NODE_ENV=production \
PORT=3003 \
node server.js
```

### Teste API
```bash
curl "http://localhost:3003/api/propostas"
# ✅ Retornou 4 propostas do banco de produção
```

## Estrutura das APIs Confirmadas
- ✅ `/api/ping` - Funcionando
- ✅ `/api/propostas` - Adicionada e testada
- ✅ `/api/admin/*` - Rotas de administração
- ✅ `/api/proposta` - Criação de propostas

## Dashboard URLs
- **Produção**: https://lt.odois.dev/admin/dashboard
- **Login**: https://lt.odois.dev/admin/login

## Próximos Passos
1. Fazer o deploy seguindo os comandos acima
2. Aguardar build/deploy automático no Coolify
3. Testar dashboard em produção
4. Verificar se as propostas estão sendo listadas corretamente

---
**Status**: ✅ Solução identificada e testada
**Data**: 2025-09-15
**By**: Claude Code