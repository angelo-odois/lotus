# Makefile para Lotus Project
.PHONY: help build up down restart logs clean backup

# Variáveis
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = lotus

help: ## Mostrar ajuda
	@echo "Comandos disponíveis para o projeto Lotus:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir containers
	@echo "🏗️  Construindo containers Lotus..."
	docker-compose build --no-cache

up: ## Iniciar todos os serviços
	@echo "🚀 Iniciando serviços Lotus..."
	docker-compose up -d
	@echo ""
	@echo "✅ Serviços iniciados:"
	@echo "🌐 Aplicação Lotus: http://localhost:8090"
	@echo "📁 File Browser: http://localhost:8096"
	@echo "🔧 Traefik Dashboard: http://localhost:8095"
	@echo "🗄️  Redis: localhost:8092"
	@echo ""

dev: ## Iniciar em modo desenvolvimento
	@echo "🔧 Iniciando em modo desenvolvimento..."
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo ""
	@echo "✅ Desenvolvimento iniciado:"
	@echo "🌐 Aplicação: http://localhost:8090"
	@echo "🔧 Dev Server: http://localhost:8097"
	@echo "📁 File Browser: http://localhost:8096"
	@echo "🔧 Traefik: http://localhost:8095"

down: ## Parar todos os serviços
	@echo "⏹️  Parando serviços Lotus..."
	docker-compose down

restart: ## Reiniciar todos os serviços
	@echo "🔄 Reiniciando serviços Lotus..."
	docker-compose restart

logs: ## Mostrar logs de todos os serviços
	docker-compose logs -f

logs-app: ## Mostrar logs apenas da aplicação
	docker-compose logs -f lotus-app

logs-n8n: ## Mostrar logs do N8N
	docker-compose logs -f n8n

status: ## Mostrar status dos containers
	@echo "📊 Status dos containers:"
	docker-compose ps

clean: ## Limpar containers e volumes
	@echo "🧹 Limpando containers e volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

backup: ## Criar backup dos dados
	@echo "💾 Criando backup..."
	mkdir -p ./backups
	docker run --rm -v lotus_lotus-storage:/data -v $(PWD)/backups:/backup alpine tar czf /backup/lotus-backup-$(shell date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "✅ Backup criado em ./backups/"

restore: ## Restaurar backup (uso: make restore BACKUP=arquivo.tar.gz)
	@echo "♻️  Restaurando backup $(BACKUP)..."
	docker run --rm -v lotus_lotus-storage:/data -v $(PWD)/backups:/backup alpine tar xzf /backup/$(BACKUP) -C /data
	@echo "✅ Backup restaurado"

shell-app: ## Acessar shell do container da aplicação
	docker-compose exec lotus-app sh

shell-n8n: ## Acessar shell do container N8N
	docker-compose exec n8n sh

install: ## Instalação inicial completa
	@echo "🎯 Instalação inicial do projeto Lotus..."
	@echo "1️⃣  Criando estrutura de pastas..."
	mkdir -p propostas logs backups n8n-workflows
	@echo "2️⃣  Criando arquivo de senhas..."
	@if [ ! -f .htpasswd ]; then \
		echo "admin:$(shell openssl passwd -apr1 lotus2024)" > .htpasswd; \
		echo "✅ Arquivo .htpasswd criado (admin/lotus2024)"; \
	fi
	@echo "3️⃣  Construindo containers..."
	make build
	@echo "4️⃣  Iniciando serviços..."
	make up
	@echo ""
	@echo "🎉 Instalação concluída!"
	@echo "📋 Próximos passos:"
	@echo "   1. Acesse http://localhost:8090 para testar o formulário"
	@echo "   2. Gerencie arquivos em http://localhost:8096"
	@echo "   3. Importe os workflows da pasta n8n-workflows/"

update: ## Atualizar projeto (pull + rebuild)
	@echo "🔄 Atualizando projeto..."
	git pull
	make build
	make restart
	@echo "✅ Projeto atualizado"

monitor: ## Monitorar recursos dos containers
	docker stats

health: ## Verificar saúde dos serviços
	@echo "🏥 Verificando saúde dos serviços:"
	@echo ""
	@echo "🌐 Lotus App:"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n  Tempo: %{time_total}s\n" http://localhost:8090 || echo "  ❌ Não disponível"
	@echo ""
	@echo "📁 File Browser:"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n  Tempo: %{time_total}s\n" http://localhost:8096 || echo "  ❌ Não disponível"
	@echo ""

setup-prod: ## Configurar para produção
	@echo "🚀 Configurando para produção..."
	@if [ ! -f .env.prod ]; then \
		echo "WEBHOOK_URL=https://n8n.nexuso2.com/webhook/bc635618-3f64-4db0-950e-feefaa899344" > .env.prod; \
		echo "NODE_ENV=production" >> .env.prod; \
		echo "✅ Arquivo .env.prod criado"; \
	fi
	docker-compose -f docker-compose.yml --env-file .env.prod up -d
	@echo "✅ Ambiente de produção configurado"