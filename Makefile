# Lotus Proposta System - Makefile

.PHONY: help setup build up down logs clean install-deps

# Default target
help:
	@echo "Lotus Proposta System - Comandos disponíveis:"
	@echo ""
	@echo "  setup          - Configuração inicial completa do projeto"
	@echo "  build          - Build das imagens Docker"
	@echo "  up             - Inicia todos os serviços"
	@echo "  down           - Para todos os serviços"
	@echo "  logs           - Mostra logs dos serviços"
	@echo "  clean          - Remove volumes e imagens"
	@echo "  install-deps   - Instala dependências do backend"
	@echo "  restart        - Reinicia os serviços"
	@echo "  status         - Status dos containers"
	@echo "  health         - Verifica saúde dos serviços"
	@echo ""

# Build das imagens Docker
build:
	@echo "🐳 Building Docker images..."
	@docker-compose build --no-cache

# Iniciar todos os serviços
up:
	@echo "🚀 Iniciando serviços..."
	@docker-compose up -d
	@echo "✅ Serviços iniciados!"
	@echo ""
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "⚡ Backend API: http://localhost:3001"
	@echo "🗃️  Database: localhost:5432"
	@echo "🔴 Redis: localhost:6379"
	@echo "📁 MinIO: http://localhost:9001"
	@echo ""

# Parar todos os serviços
down:
	@echo "🛑 Parando serviços..."
	@docker-compose down

# Mostrar logs
logs:
	@docker-compose logs -f

# Restart dos serviços
restart:
	@echo "🔄 Reiniciando serviços..."
	@docker-compose restart

# Status dos containers
status:
	@docker-compose ps

# Limpar volumes e imagens
clean:
	@echo "🧹 Limpando recursos Docker..."
	@docker-compose down -v
	@docker system prune -f
	@docker volume prune -f

# Verificar saúde dos serviços
health:
	@echo "🏥 Verificando saúde dos serviços..."
	@curl -s http://localhost:3001/health | jq '.' || echo "❌ Backend não respondeu"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend não respondeu"

# Desenvolvimento - watch logs
dev:
	@echo "👨‍💻 Modo desenvolvimento - monitorando logs..."
	@docker-compose up --build

# Instalar tudo do zero
fresh-install: clean
	@echo "🆕 Instalação limpa do sistema..."
	@$(MAKE) build
	@$(MAKE) up
	@echo "🎉 Sistema instalado e iniciado!"
