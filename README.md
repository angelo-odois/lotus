# Lotus - Sistema de Propostas Imobiliárias

Sistema completo de geração de propostas imobiliárias com dashboard administrativo e integração WhatsApp.

## 🚀 Funcionalidades

### 📝 Formulário de Proposta
- ✅ Formulário multi-step responsivo
- ✅ Geração automática de PDF com Puppeteer  
- ✅ Integração com WhatsApp via WAHA API
- ✅ Upload de documentos com conversão de PDF para imagem
- ✅ Validação de formulários com Zod
- ✅ Compatibilidade total com Safari

### 🛡️ Dashboard Administrativo
- ✅ Sistema de autenticação seguro
- ✅ Listagem e aprovação de propostas
- ✅ Sistema de busca e paginação
- ✅ Seleção múltipla e exclusão em lote
- ✅ Auditoria completa de ações
- ✅ Proteção CSRF e rate limiting

## 🛠 Tecnologias

- **Next.js 15** - Framework React com Turbopack
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **SQLite + TypeORM** - Banco de dados
- **Puppeteer** - Geração de PDF
- **@sparticuz/chromium** - Chrome para ambientes serverless
- **React Hook Form + Zod** - Validação de formulários
- **JWT** - Autenticação com rotação automática
- **Lucide React** - Ícones

## 📦 Instalação e Configuração

### 1. Clone e Instale
```bash
git clone <repository-url>
cd lotus
npm install
```

### 2. Configure o Banco de Dados
```bash
# Criar banco SQLite e usuários admin
npm run seed
```

### 3. Configure Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite o `.env.local`:
```env
# Obrigatório - JWT Secret (mínimo 32 caracteres)
JWT_SECRET_CURRENT=local-dev-secret-32-chars-minimum

# WhatsApp API (WAHA) - Opcional
WAHA_URL=https://waha.nexuso2.com
WAHA_API_KEY=sua-api-key
WHATSAPP_PHONE=5561999999999
WHATSAPP_SESSION=lotus

# Ambiente
NODE_ENV=development

# Puppeteer (desenvolvimento)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
```

### 4. Instale Chrome para Puppeteer
```bash
npx puppeteer browsers install chrome
```

### 5. Execute o Projeto
```bash
npm run dev
```

## 🌐 URLs da Aplicação

- **Formulário**: http://localhost:3001/
- **Login Admin**: http://localhost:3001/login
- **Dashboard**: http://localhost:3001/proposals (após login)
- **Debug Coolify**: http://localhost:3001/debug-coolify
- **Health Check**: http://localhost:3001/api/health
- **Teste PDF**: http://localhost:3001/api/test-pdf

## 🔐 Credenciais de Acesso

### Usuários Admin (criados pelo seed):
```
Email: admin@lotuscidade.com
Senha: R03ert@

Email: admin@odois.dev  
Senha: @n63L02025
```

## 🐳 Deploy no Coolify

### 1. Variáveis de Ambiente no Coolify
```env
# CRÍTICO - Aplicação não inicia sem essa
JWT_SECRET_CURRENT=lotus-production-jwt-secret-32-chars-minimum-2024-secure-key

# Ambiente
NODE_ENV=production

# Puppeteer para Docker
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Optional - Telemetria
NEXT_TELEMETRY_DISABLED=1

# WhatsApp API (se usado)
WAHA_URL=https://waha.nexuso2.com
WAHA_API_KEY=sua-api-key
WHATSAPP_PHONE=556199999999
WHATSAPP_SESSION=lotus

# Coolify domain
COOLIFY_DOMAIN=lt.odois.dev
```

### 2. Configurações de Deploy
- **Domain**: `lt.odois.dev`
- **Health Check**: `/api/health`
- **Port**: `3000`
- **Resources**: 
  - Memory: 512MB (reserved) / 1GB (limit)
  - CPU: 0.25 (reserved) / 0.5 (limit)

### 3. Volume Configuration
- **Host Path**: `/opt/coolify/lotus/propostas`
- **Container Path**: `/app/propostas`
- **Description**: PDFs gerados pelas propostas

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Sistema de autenticação
│   │   ├── proposals/         # CRUD de propostas + aprovação
│   │   ├── proposta/          # API de geração de PDF
│   │   ├── health/            # Health check
│   │   └── debug-coolify/     # Debug para Coolify
│   ├── login/                 # Página de login
│   ├── proposals/             # Dashboard administrativo
│   ├── debug-coolify/         # Interface debug
│   ├── layout.tsx
│   └── page.tsx               # Formulário principal
├── components/
│   ├── steps/                 # Steps do formulário
│   ├── PropostaForm.tsx       # Formulário principal
│   ├── Navigation.tsx         # Navegação entre steps
│   └── ...
├── lib/
│   ├── auth.ts               # Sistema JWT + cookies
│   ├── database.ts           # Conexão SQLite
│   ├── environment.ts        # Detecção de ambiente
│   ├── audit.ts              # Sistema de auditoria
│   └── queries.ts            # Queries do banco
├── types/
│   └── form.ts               # Tipos TypeScript
└── config/
    └── index.ts              # Configurações
```

## 🔧 Scripts Disponíveis

```bash
npm run dev           # Desenvolvimento com Turbopack
npm run build         # Build de produção
npm run build:docker  # Build para Docker
npm run start         # Servidor de produção  
npm run lint          # ESLint
npm run seed          # Popular banco com dados iniciais
```

## 🛡️ Segurança Implementada

### ✅ Autenticação & Autorização
- JWT com rotação automática (7 dias)
- Cookies HttpOnly + Secure + SameSite=Lax
- Middleware proteção de rotas
- Usuários pré-criados (sem cadastro público)

### ✅ CSRF Protection
- Double-submit pattern
- Token obrigatório em todas as mutações
- Validação servidor + cliente

### ✅ Rate Limiting
- 5 tentativas por IP+email / 15min
- Lockout temporal (10min)
- Exponential backoff

### ✅ Headers de Segurança
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: no-referrer
- Strict-Transport-Security (produção)
- CSP restritiva para páginas admin

### ✅ Proteção de Dados
- Inputs sanitizados e validados (Zod)
- Emails ofuscados em logs
- Sem dados sensíveis em APIs
- Timing attacks mitigados

### ✅ Auditoria
- Logs de segurança estruturados
- Eventos de login/aprovação/exclusão
- Stack trace omitido em produção

## 🔄 Fluxo do Sistema

### 1. Fluxo da Proposta
1. **Preenchimento** - Cliente preenche formulário multi-step
2. **Validação** - Campos obrigatórios validados por step  
3. **Geração** - PDF gerado via Puppeteer com dados + documentos
4. **Armazenamento** - Proposta salva no banco + PDF na pasta
5. **Envio** - WhatsApp enviado automaticamente (se configurado)

### 2. Fluxo Administrativo
1. **Login** - Autenticação obrigatória
2. **Dashboard** - Visualização de todas as propostas
3. **Busca/Filtro** - Localização de propostas específicas
4. **Aprovação** - Mudança de status para "aprovada"
5. **Exclusão** - Remoção de propostas não aprovadas (individual/lote)
6. **Auditoria** - Log de todas as ações

## 🧪 Testes de Funcionalidade

### Teste Local Completo
```bash
# 1. Iniciar aplicação
npm run dev

# 2. Testar formulário
curl http://localhost:3001/ 

# 3. Testar geração de PDF
curl http://localhost:3001/api/test-pdf

# 4. Testar login admin
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@odois.dev","password":"@n63L02025","csrfToken":"test"}'

# 5. Testar health check
curl http://localhost:3001/api/health

# 6. Testar debug do Coolify
curl http://localhost:3001/api/debug-coolify
```

## 🐛 Troubleshooting

### Problema: PDF não gera
```bash
# Verificar Chrome
npx puppeteer browsers install chrome

# Testar PDF isoladamente  
curl http://localhost:3001/api/test-pdf
```

### Problema: Banco não conecta
```bash
# Recriar banco
rm -f database.sqlite
npm run seed
```

### Problema: Login falha
```bash
# Verificar variável JWT
echo $JWT_SECRET_CURRENT

# Recriar usuários
npm run seed
```

### Problema: WhatsApp não envia
```bash
# Testar conectividade WAHA
curl -H "Authorization: Bearer $WAHA_API_KEY" $WAHA_URL/api/sessions
```

## 🚀 Recursos e Otimizações

### ✅ Performance
- Next.js 15 com Turbopack (desenvolvimento)
- Chromium Alpine (menor footprint em Docker)  
- Multi-stage build otimizado
- Volume persistente para PDFs
- Health check automático

### ✅ Compatibilidade
- Safari desktop e mobile
- Chromium/Chrome em Docker
- Fallback para Chromium do sistema
- Detecção automática de ambiente (local/Docker/Vercel)

### ✅ Monitoramento
- Health check endpoint: `/api/health`
- Debug específico Coolify: `/debug-coolify`
- Logs estruturados com timestamp
- Auditoria completa de ações

## 📊 Métricas Esperadas

- **Tempo de boot**: ~10 segundos (local) / ~30 segundos (Docker)
- **Geração de PDF**: ~3-8 segundos
- **Memória em uso**: ~150-400MB
- **CPU em uso**: ~10-30% durante geração de PDF

## 🔒 Considerações de Produção

### ✅ Segurança
- Container rootless (Docker)
- No-sandbox mode (necessário para Chromium)
- Variáveis sensíveis via env vars
- Volumes isolados
- Network bridge isolada

### ✅ Backup
- Database SQLite em volume persistente
- PDFs armazenados em volume separado
- Logs estruturados para monitoramento

## 📝 Licença

Projeto privado - Lotus Cidade © 2025

---

**Status**: ✅ Pronto para produção
**Última atualização**: 2025-09-12
**Versão**: 1.0.0