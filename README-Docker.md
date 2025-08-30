# 🐳 Lotus - Docker Setup

Sistema completo dockerizado para o projeto Lotus com formulário de propostas, geração de PDF e storage organizado.

## 🚀 Início Rápido

### Instalação Completa
```bash
make install
```

### Comandos Principais
```bash
# Iniciar projeto
make up

# Parar projeto  
make down

# Ver logs
make logs

# Backup
make backup
```

## 📋 Serviços Incluídos

| Serviço | Porta | Descrição | Acesso |
|---------|-------|-----------|---------|
| **Lotus App** | 3000 | Formulário principal | http://localhost:3000 |
| **N8N** | 5678 | Automação e PDF | http://localhost:5678 |
| **File Browser** | 8081 | Gerenciar arquivos | http://localhost:8081 |
| **Traefik** | 8080 | Dashboard proxy | http://localhost:8080 |
| **PostgreSQL** | 5432 | Banco N8N | Interno |
| **Redis** | 6379 | Cache | Interno |

## 🏗️ Estrutura de Arquivos

```
lotus/
├── 📄 index.html              # Formulário principal
├── 🎨 styles.css              # Estilos
├── ⚡ script.js              # JavaScript
├── 🖼️ logo.svg               # Logo da Lotus
├── 📁 propostas/             # 📂 Propostas geradas
│   └── LP202408291445-joao-silva/
│       ├── 📄 proposta-LP202408291445.pdf
│       ├── 📋 dados-proposta.json
│       └── 📁 documentos/
│           ├── RG_rg-frente.jpg
│           ├── CPF_cpf-verso.jpg
│           └── Comp_Renda_holerite.pdf
├── 🐳 docker-compose.yml     # Configuração Docker
├── 🐳 Dockerfile            # Build da aplicação
├── ⚙️ nginx.conf            # Configuração Nginx
└── 📋 Makefile              # Comandos automatizados
```

## 🔧 Configuração Inicial

### 1. Credenciais Padrão
- **N8N**: `admin` / `lotus2024`
- **Propostas**: `admin` / `lotus2024`
- **PostgreSQL**: `n8n` / `n8n_password`

### 2. Importar Workflows N8N
1. Acesse http://localhost:5678
2. Faça login com `admin/lotus2024`
3. Importe os arquivos:
   - `n8n-local-storage.json` (recomendado)
   - `n8n-storage-workflow.json` (avançado)

### 3. Configurar Webhook
1. No N8N, ative o workflow importado
2. Copie a URL do webhook
3. Atualize `script.js` se necessário

## 📂 Storage e Backup

### Volumes Persistentes
- `lotus-storage`: Arquivos do sistema
- `n8n-data`: Dados do N8N
- `postgres-data`: Banco de dados
- `./propostas`: Propostas locais

### Backup Automático
- **Backup diário** automático
- **Retenção**: 10 backups mais recentes
- **Localização**: `./backups/`

### Backup Manual
```bash
# Criar backup
make backup

# Restaurar backup
make restore BACKUP=lotus-backup-20240829-143022.tar.gz
```

## 🌐 Ambientes

### Desenvolvimento
```bash
make dev
```
- Live reload
- Logs detalhados
- CORS habilitado
- PhpMyAdmin incluído

### Produção
```bash
make setup-prod
```
- Otimizações de performance
- Logs minimizados
- Segurança reforçada
- Cache habilitado

## 🔍 Monitoramento

### Verificar Status
```bash
make status      # Status dos containers
make health      # Teste de conectividade
make monitor     # Recursos dos containers
```

### Logs Específicos
```bash
make logs-app    # Logs da aplicação
make logs-n8n    # Logs do N8N
```

### Acesso Shell
```bash
make shell-app   # Shell do container Lotus
make shell-n8n   # Shell do container N8N
```

## 🛡️ Segurança

### Features Implementadas
- ✅ Autenticação básica para propostas
- ✅ Headers de segurança (XSS, CSRF, etc.)
- ✅ Bloqueio de arquivos sensíveis
- ✅ Rate limiting (Nginx)
- ✅ Rede isolada entre containers

### Configurações Adicionais
- Backup automático criptografado
- Logs de auditoria
- Monitoramento de recursos
- Restore point automático

## 🔧 Personalização

### Alterar Portas
Edite `docker-compose.yml`:
```yaml
ports:
  - "NOVA_PORTA:80"
```

### Adicionar Domínio
1. Configure DNS para apontar para o servidor
2. Atualize `nginx.conf` com o novo `server_name`
3. Configure SSL se necessário

### Variables de Ambiente
Crie `.env`:
```env
WEBHOOK_URL=https://sua-url-n8n.com/webhook/...
NODE_ENV=production
N8N_ENCRYPTION_KEY=sua-chave-secreta
```

## 🆘 Troubleshooting

### Problemas Comuns

**Container não inicia:**
```bash
make down && make clean && make build && make up
```

**PDF não gera:**
- Verifique logs do N8N: `make logs-n8n`
- Teste webhook manualmente
- Verifique API keys

**Arquivos não salvam:**
- Verifique permissões: `ls -la propostas/`
- Verifique espaço em disco: `df -h`

**Acesso negado:**
- Verifique `.htpasswd`
- Teste credenciais `admin/lotus2024`

### Reset Completo
```bash
make clean
rm -rf propostas/* logs/* backups/*
make install
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique logs: `make logs`
2. Teste saúde: `make health`
3. Verifique status: `make status`

---

**🏗️ Desenvolvido para Lotus Cidade**  
*Arquitetura autoral • Sustentabilidade • Exclusividade*