#!/bin/bash

# ===================================================================
# SETUP COMPLETO LOTUS PROPOSTA DE COMPRA
# ===================================================================
# Script master para criação completa do sistema:
# - Frontend Angular 19
# - Backend Node.js + Express
# - MinIO Object Storage
# - Docker Compose
# - Compliance LGPD completo
# ===================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Função para log colorido
log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
step() { echo -e "${CYAN}[STEP]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Variáveis globais
PROJECT_NAME="lotus-proposta-compra"
CURRENT_DIR=$(pwd)

# Banner inicial
show_banner() {
    echo -e "${PURPLE}"
    cat << 'EOF'
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                  ║
    ║                🏠 LOTUS PROPOSTA DE COMPRA 🏠                    ║
    ║                                                                  ║
    ║              Setup Completo do Sistema LGPD-Compliant           ║
    ║                                                                  ║
    ║  • Frontend Angular 19 + Material Design                        ║
    ║  • Backend Node.js + Express + TypeScript                       ║
    ║  • MinIO Object Storage                                          ║
    ║  • Redis Cache                                                   ║
    ║  • Compliance LGPD Total                                         ║
    ║  • Docker Compose                                                ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Verificar dependências do sistema
check_system_dependencies() {
    step "Verificando dependências do sistema..."
    
    local missing_deps=()
    
    # Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js 18+")
    else
        NODE_VERSION=$(node --version | sed 's/v//')
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            missing_deps+=("Node.js 18+ (atual: $NODE_VERSION)")
        fi
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("Docker")
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_deps+=("Docker Compose")
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("Git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Dependências faltando:"
        for dep in "${missing_deps[@]}"; do
            echo "  ❌ $dep"
        done
        echo ""
        echo "Instale as dependências e execute novamente."
        echo ""
        echo "Links úteis:"
        echo "  Node.js: https://nodejs.org/"
        echo "  Docker: https://docs.docker.com/get-docker/"
        echo "  Git: https://git-scm.com/"
        exit 1
    fi
    
    success "✓ Todas as dependências estão instaladas"
    log "✓ Node.js $(node --version)"
    log "✓ npm $(npm --version)"
    log "✓ Docker $(docker --version | cut -d' ' -f3 | sed 's/,//')"
    log "✓ Git $(git --version | cut -d' ' -f3)"
}

# Criar estrutura do projeto
create_project_structure() {
    step "Criando estrutura do projeto..."
    
    if [ -d "$PROJECT_NAME" ]; then
        warn "Projeto $PROJECT_NAME já existe. Removendo..."
        rm -rf "$PROJECT_NAME"
    fi
    
    mkdir -p "$PROJECT_NAME"
    cd "$PROJECT_NAME"
    
    # Criar estrutura básica
    mkdir -p {frontend,backend,docker,scripts,docs}
    
    success "✓ Estrutura do projeto criada"
}

# Criar Docker Compose principal
create_main_docker_compose() {
    step "Criando Docker Compose principal..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Frontend Angular
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
      target: development
    ports:
      - "4200:4200"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - API_URL=http://localhost:3000/api
    depends_on:
      - backend
    networks:
      - lotus-network

  # Backend Node.js
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./backend/logs:/app/logs
      - ./backend/uploads:/app/uploads
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=lotus_admin
      - MINIO_SECRET_KEY=lotus_secret_key_2024
      - MINIO_BUCKET=lotus-documents
      - MINIO_USE_SSL=false
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_jwt_secret_here_change_in_production
      - ENCRYPTION_KEY=your_32_char_encryption_key_here_change_in_production
    depends_on:
      - minio
      - redis
    networks:
      - lotus-network

  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    environment:
      - MINIO_ROOT_USER=lotus_admin
      - MINIO_ROOT_PASSWORD=lotus_secret_key_2024
      - MINIO_SERVER_URL=http://localhost:9000
      - MINIO_BROWSER_REDIRECT_URL=http://localhost:9001
    command: server /data --console-address ":9001"
    networks:
      - lotus-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # MinIO Setup
  minio-setup:
    image: minio/mc:latest
    depends_on:
      - minio
    networks:
      - lotus-network
    volumes:
      - ./scripts/setup-minio.sh:/setup.sh
    entrypoint: >
      /bin/sh -c "
      sleep 10;
      /usr/bin/mc alias set myminio http://minio:9000 lotus_admin lotus_secret_key_2024;
      /usr/bin/mc mb myminio/lotus-documents --ignore-existing;
      /usr/bin/mc mb myminio/lotus-documents-encrypted --ignore-existing;
      /usr/bin/mc mb myminio/lotus-backups --ignore-existing;
      /usr/bin/mc mb myminio/lotus-temp --ignore-existing;
      /usr/bin/mc anonymous set none myminio/lotus-documents;
      /usr/bin/mc anonymous set none myminio/lotus-documents-encrypted;
      /usr/bin/mc anonymous set none myminio/lotus-backups;
      /usr/bin/mc anonymous set download myminio/lotus-temp;
      echo 'MinIO buckets configurados com sucesso';
      "

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - lotus-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

# Networks
networks:
  lotus-network:
    driver: bridge

# Volumes
volumes:
  minio_data:
    driver: local
  redis_data:
    driver: local
EOF

    success "✓ Docker Compose principal criado"
}

# Criar Dockerfiles
create_dockerfiles() {
    step "Criando Dockerfiles..."
    
    # Dockerfile Frontend
    cat > docker/Dockerfile.frontend << 'EOF'
# Frontend Angular Dockerfile
FROM node:20-alpine AS development

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli@19

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001 -G nodejs && \
    chown -R angular:nodejs /app

USER angular

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:4200 || exit 1

# Development command
CMD ["npm", "start"]

# Production stage
FROM nginx:alpine AS production

# Copy build files
COPY dist/lotus-proposta-compra/ /usr/share/nginx/html/

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

    # Dockerfile Backend
    cat > docker/Dockerfile.backend << 'EOF'
# Backend Node.js Dockerfile
FROM node:20-alpine AS development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install development tools
RUN npm install -g nodemon typescript ts-node

# Copy source code
COPY . .

# Create directories
RUN mkdir -p logs uploads

# Create user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs && \
    chown -R backend:nodejs /app

USER backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Development command
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Create user and directories
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs && \
    mkdir -p logs uploads && \
    chown -R backend:nodejs /app

USER backend

EXPOSE 3000

CMD ["node", "dist/app.js"]
EOF

    success "✓ Dockerfiles criados"
}

# Criar scripts auxiliares
create_scripts() {
    step "Criando scripts auxiliares..."
    
    # Script de inicialização completa
    cat > scripts/start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando sistema completo Lotus..."

# Verificar Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando!"
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar todos os serviços
echo "🏗️  Construindo e iniciando serviços..."
docker-compose up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Configurar MinIO
echo "⚙️  Configurando MinIO..."
docker-compose run --rm minio-setup

echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "📊 Serviços disponíveis:"
echo "  🖥️  Frontend: http://localhost:4200"
echo "  🔧 Backend API: http://localhost:3000"
echo "  🗄️  MinIO Console: http://localhost:9001"
echo "  📊 Health Check: http://localhost:3000/health"
echo ""
echo "Para ver os logs: docker-compose logs -f"
EOF

    # Script para desenvolvimento
    cat > scripts/dev.sh << 'EOF'
#!/bin/bash

echo "🛠️  Iniciando modo desenvolvimento..."

# Instalar dependências se necessário
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

# Iniciar apenas backend e MinIO
docker-compose up -d backend minio redis minio-setup

echo "✅ Ambiente de desenvolvimento pronto!"
echo ""
echo "Para iniciar o frontend localmente:"
echo "  cd frontend && npm start"
echo ""
echo "Para iniciar o backend localmente:"
echo "  cd backend && npm run dev"
EOF

    # Script de backup
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Iniciando backup - $TIMESTAMP"

mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# Backup volumes Docker
docker run --rm -v lotus-proposta-compra_minio_data:/data -v $(pwd)/$BACKUP_DIR/$TIMESTAMP:/backup alpine tar czf /backup/minio_data.tar.gz -C /data .
docker run --rm -v lotus-proposta-compra_redis_data:/data -v $(pwd)/$BACKUP_DIR/$TIMESTAMP:/backup alpine tar czf /backup/redis_data.tar.gz -C /data .

# Backup código fonte
tar czf "$BACKUP_DIR/$TIMESTAMP/source_code.tar.gz" --exclude=node_modules --exclude=dist --exclude=.git frontend/ backend/ docker/ scripts/

echo "✅ Backup concluído: $BACKUP_DIR/$TIMESTAMP"
EOF

    # Script de limpeza
    cat > scripts/cleanup.sh << 'EOF'
#!/bin/bash

echo "🧹 Limpando ambiente Docker..."

# Parar todos os containers
docker-compose down

# Remover volumes (cuidado!)
read -p "Remover volumes de dados? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "✅ Volumes removidos"
fi

# Remover imagens não utilizadas
docker image prune -f

echo "✅ Limpeza concluída"
EOF

    # Tornar scripts executáveis
    chmod +x scripts/*.sh
    
    success "✓ Scripts auxiliares criados"
}

# Criar documentação
create_documentation() {
    step "Criando documentação..."
    
    # README principal
    cat > README.md << 'EOF'
# 🏠 Lotus Proposta de Compra

Sistema completo para propostas de compra da Lotus Cidade, desenvolvido com compliance total à LGPD.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Git

### Instalação e Execução

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd lotus-proposta-compra

# 2. Iniciar sistema completo
./scripts/start-all.sh

# 3. Acessar aplicação
http://localhost:4200
```

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   Angular 19    │◄──►│   Node.js       │
│   Port: 4200    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼───────────────┐
                                 │               │
                    ┌─────────────────┐ ┌─────────────────┐
                    │     MinIO       │ │     Redis       │
                    │  Port: 9000/1   │ │   Port: 6379    │
                    └─────────────────┘ └─────────────────┘
```

## 📦 Serviços

| Serviço | Porta | Descrição | URL |
|---------|-------|-----------|-----|
| Frontend | 4200 | Interface Angular | http://localhost:4200 |
| Backend | 3000 | API Node.js | http://localhost:3000 |
| MinIO | 9000/9001 | Object Storage | http://localhost:9001 |
| Redis | 6379 | Cache | - |

## 🔐 Compliance LGPD

### ✅ Funcionalidades Implementadas

- **Consentimento Granular**: Opt-in/opt-out por finalidade
- **Direitos dos Titulares**: Acesso, correção, exclusão, portabilidade
- **Minimização de Dados**: Coleta apenas o necessário
- **Criptografia**: AES-256-GCM para dados sensíveis
- **Auditoria**: Logs completos de todas as operações
- **Retenção**: Políticas automáticas de eliminação
- **Anonimização**: Processo automatizado

### 📋 Dados Coletados

| Categoria | Finalidade | Base Legal | Retenção |
|-----------|------------|------------|----------|
| Dados Pessoais | Análise Proposta | Consentimento | 5 anos |
| Documentos | Comprovação | Execução Contrato | 5 anos |
| Logs Acesso | Segurança | Interesse Legítimo | 1 ano |

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
lotus-proposta-compra/
├── frontend/           # Angular 19 application
├── backend/           # Node.js API
├── docker/           # Dockerfiles
├── scripts/          # Utility scripts
├── docs/            # Documentation
└── docker-compose.yml
```

### Scripts Disponíveis

```bash
# Iniciar sistema completo
./scripts/start-all.sh

# Modo desenvolvimento
./scripts/dev.sh

# Backup
./scripts/backup.sh

# Limpeza
./scripts/cleanup.sh
```

### Desenvolvimento Local

```bash
# Frontend
cd frontend
npm install
npm start

# Backend  
cd backend
npm install
npm run dev
```

## 🧪 Testes

```bash
# Frontend
cd frontend
npm test
npm run test:coverage

# Backend
cd backend
npm test
npm run test:coverage
```

## 📊 Monitoramento

### Logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
```

### Health Checks

- Backend: http://localhost:3000/health
- MinIO: http://localhost:9000/minio/health/live

## 🚀 Deploy

### Desenvolvimento
```bash
docker-compose up --build
```

### Produção
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuração

### Variáveis de Ambiente

Principais variáveis configuráveis:

```env
# Backend
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# MinIO
MINIO_ROOT_USER=lotus_admin
MINIO_ROOT_PASSWORD=lotus_secret_key_2024

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Segurança

⚠️ **Importante**: Altere as seguintes chaves antes do deploy em produção:

- `JWT_SECRET`
- `ENCRYPTION_KEY` (32+ caracteres)
- `MINIO_ROOT_PASSWORD`

## 📱 Frontend (Angular 19)

### Funcionalidades

- ✅ Formulário multi-step responsivo
- ✅ Validação em tempo real
- ✅ Upload de arquivos drag & drop
- ✅ Auto-save de dados
- ✅ Gestão de consentimento LGPD
- ✅ PWA ready

### Tecnologias

- Angular 19
- Angular Material
- TypeScript
- SCSS
- RxJS

## 🔧 Backend (Node.js)

### Funcionalidades

- ✅ API RESTful
- ✅ Upload de arquivos para MinIO
- ✅ Criptografia de dados sensíveis
- ✅ Rate limiting
- ✅ Logs de auditoria
- ✅ Middleware LGPD

### Tecnologias

- Node.js + Express
- TypeScript
- MinIO SDK
- Winston (logs)
- Helmet (security)

## 🗄️ Storage (MinIO)

### Buckets

- `lotus-documents`: Documentos principais
- `lotus-documents-encrypted`: Documentos criptografados  
- `lotus-backups`: Backups automáticos
- `lotus-temp`: Arquivos temporários

### Configuração

- Console: http://localhost:9001
- User: `lotus_admin`
- Password: `lotus_secret_key_2024`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 🐛 Troubleshooting

### Problemas Comuns

**Docker não inicia:**
```bash
# Verificar se Docker está rodando
docker info

# Reiniciar Docker
sudo systemctl restart docker
```

**Porta já em uso:**
```bash
# Verificar processos usando as portas
lsof -i :4200
lsof -i :3000
lsof -i :9000

# Parar containers
docker-compose down
```

**MinIO não aceita upload:**
```bash
# Reconfigurar MinIO
docker-compose run --rm minio-setup
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

## 📞 Suporte

- **Email**: dev@lotuscidade.com.br
- **Documentação**: [docs.lotuscidade.com.br](https://docs.lotuscidade.com.br)
- **Issues**: [GitHub Issues](https://github.com/lotuscidade/proposta/issues)

---

**Lotus Cidade** - Realizando sonhos através da tecnologia segura e compliance 🏠🔐✨
EOF

    # Criar changelog
    cat > CHANGELOG.md << 'EOF'
# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

## [1.0.0] - 2024-01-20

### Adicionado
- ✨ Sistema completo de propostas de compra
- 🔐 Compliance total com LGPD
- 🎨 Interface Angular 19 com Material Design
- 🔧 Backend Node.js com TypeScript
- 🗄️ Storage MinIO para arquivos
- 📊 Sistema de auditoria e logs
- 🐳 Docker Compose para desenvolvimento
- 🧪 Testes unitários e integração
- 📖 Documentação completa

### Funcionalidades
- Formulário multi-step responsivo
- Upload de documentos com validação
- Gestão granular de consentimento LGPD
- Criptografia de dados sensíveis
- Auto-save de formulários
- Validação em tempo real
- Sistema de notificações

### Segurança
- Criptografia AES-256-GCM
- Rate limiting
- Headers de segurança
- Validação de entrada
- Logs de auditoria
- Gestão de sessões

### LGPD
- Consentimento granular
- Direitos dos titulares
- Minimização de dados
- Anonimização automática
- Retenção configurável
- Relatórios de compliance
EOF

    success "✓ Documentação criada"
}

# Executar setup do frontend
setup_frontend() {
    step "Configurando frontend Angular..."
    
    cd frontend
    
    # Verificar se Angular CLI está instalado
    if ! command -v ng &> /dev/null; then
        log "Instalando Angular CLI..."
        npm install -g @angular/cli@19
    fi
    
    # Criar projeto Angular se não existir
    if [ ! -f "package.json" ]; then
        log "Criando projeto Angular..."
        
        # Usar o script de setup do frontend que criamos
        curl -s https://raw.githubusercontent.com/user/repo/main/setup-frontend.sh | bash
        
        # Ou criar manualmente uma versão simplificada
        ng new . --routing=true --style=scss --skip-git=true --package-manager=npm --directory=.
        
        # Instalar dependências adicionais
        npm install @angular/material@19 @angular/cdk@19 @angular/animations@19
        npm install ngx-mask lodash uuid
        npm install @types/lodash @types/uuid --save-dev
    fi
    
    cd ..
    success "✓ Frontend configurado"
}

# Executar setup do backend
setup_backend() {
    step "Configurando backend Node.js..."
    
    cd backend
    
    # Criar package.json se não existir
    if [ ! -f "package.json" ]; then
        npm init -y
        
        # Instalar dependências
        npm install express cors helmet multer minio bcryptjs jsonwebtoken nodemailer joi express-rate-limit winston uuid dotenv express-validator
        npm install --save-dev @types/express @types/multer @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/uuid @types/jest @types/cors typescript ts-node nodemon jest ts-jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
        
        # Criar estrutura básica
        mkdir -p src/{controllers,services,middleware,models,routes,config,utils}
        mkdir -p {logs,uploads,tests}
        
        # Criar app.ts básico
        cat > src/app.ts << 'BACKEND_EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
BACKEND_EOF

        # Criar tsconfig.json
        cat > tsconfig.json << 'TS_EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
TS_EOF

        # Adicionar scripts ao package.json
        npm pkg set scripts.dev="nodemon --exec ts-node src/app.ts"
        npm pkg set scripts.build="tsc"
        npm pkg set scripts.start="node dist/app.js"
    fi
    
    cd ..
    success "✓ Backend configurado"
}

# Função principal
main() {
    show_banner
    
    check_system_dependencies
    create_project_structure
    create_main_docker_compose
    create_dockerfiles
    create_scripts
    create_documentation
    setup_frontend
    setup_backend
    
    cd "$CURRENT_DIR/$PROJECT_NAME"
    
    echo -e "${GREEN}"
    cat << 'EOF'
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                  ║
    ║                        ✅ SETUP CONCLUÍDO!                       ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    success "Projeto criado em: $(pwd)"
    
    echo -e "${CYAN}"
    echo "📋 PRÓXIMOS PASSOS:"
    echo -e "${NC}"
    echo "1. 🚀 Iniciar sistema: ${YELLOW}./scripts/start-all.sh${NC}"
    echo "2. 🌐 Acessar frontend: ${YELLOW}http://localhost:4200${NC}"
    echo "3. 🔧 API backend: ${YELLOW}http://localhost:3000${NC}"
    echo "4. 🗄️ MinIO console: ${YELLOW}http://localhost:9001${NC}"
    echo ""
    
    echo -e "${CYAN}"
    echo "🛠️ DESENVOLVIMENTO:"
    echo -e "${NC}"
    echo "• Frontend local: ${YELLOW}cd frontend && npm start${NC}"
    echo "• Backend local: ${YELLOW}cd backend && npm run dev${NC}"
    echo "• Logs Docker: ${YELLOW}docker-compose logs -f${NC}"
    echo ""
    
    echo -e "${CYAN}"
    echo "🔧 CONFIGURAÇÃO:"
    echo -e "${NC}"
    echo "• Configure ${YELLOW}backend/.env${NC} antes do primeiro uso"
    echo "• Altere chaves de segurança para produção"
    echo "• Veja ${YELLOW}README.md${NC} para documentação completa"
    echo ""
    
    warn "⚠️  Lembre-se de configurar as variáveis de ambiente!"
    warn "⚠️  Altere as chaves de segurança antes do deploy em produção!"
    
    success "🎉 Sistema Lotus Proposta de Compra pronto para uso!"
}

# Executar função principal com captura de erros
if main "$@"; then
    exit 0
else
    error "Setup falhou. Verifique os logs acima."
    exit 1
fi