# 🔌 Configuração de Portas - Lotus Docker

## 📋 Mapeamento de Portas Atualizado

Para evitar conflitos com outros serviços no servidor, as portas foram alteradas para a faixa 809X:

| Serviço | Porta Externa | Porta Interna | URL de Acesso | Descrição |
|---------|---------------|---------------|---------------|-----------|
| **Lotus App** | `8090` | `80` | http://localhost:8090 | Formulário principal |
| **Redis** | `8092` | `6379` | localhost:8092 | Cache e sessões |
| **Traefik HTTP** | `8093` | `80` | http://localhost:8093 | Proxy HTTP |
| **Traefik HTTPS** | `8094` | `443` | https://localhost:8094 | Proxy HTTPS |
| **Traefik Dashboard** | `8095` | `8080` | http://localhost:8095 | Dashboard do proxy |
| **File Browser** | `8096` | `80` | http://localhost:8096 | Gerenciador de arquivos |

## 🔧 Alterações Realizadas

### Docker Compose
```yaml
lotus-app:
  ports:
    - "8090:80"    # Era 3000:80

redis:
  ports:
    - "8092:6379"  # Era 6379:6379

traefik:
  ports:
    - "8093:80"    # Era 80:80
    - "8094:443"   # Era 443:443  
    - "8095:8080"  # Era 8080:8080

filebrowser:
  ports:
    - "8096:80"    # Era 8081:80
```

## 🎯 Acesso aos Serviços

### 🌐 Aplicação Principal
```
http://localhost:8090
```
- Formulário de propostas
- Upload de documentos
- Interface do cliente

### 📁 Gerenciador de Arquivos
```
http://localhost:8096
```
- Visualizar propostas salvas
- Fazer download de PDFs
- Gerenciar documentos

### 🔧 Dashboard Traefik
```
http://localhost:8095
```
- Monitorar serviços
- Ver rotas ativas
- Status dos containers

### 🗄️ Redis (CLI)
```bash
redis-cli -h localhost -p 8092
```

## 🚀 Comandos Atualizados

### Iniciar Projeto
```bash
make up
# ou
docker-compose up -d
```

### Verificar Saúde
```bash
make health
```

### Logs
```bash
make logs           # Todos os serviços
make logs-app       # Apenas aplicação
```

## 🔄 Migração de Portas

Se você tinha o projeto rodando nas portas antigas:

### 1. Parar serviços antigos
```bash
make down
```

### 2. Limpar containers
```bash
make clean
```

### 3. Reconstruir com novas portas
```bash
make build
make up
```

## 🌍 Configuração de Produção

### Proxy Reverso (Nginx/Apache)
Configure seu proxy principal para redirecionar:

```nginx
# Nginx principal do servidor
location /lotus/ {
    proxy_pass http://localhost:8090/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Firewall
Abra apenas as portas necessárias:
```bash
# Apenas aplicação principal
ufw allow 8090/tcp

# Para acesso externo ao File Browser (opcional)
ufw allow 8096/tcp
```

## 🔍 Troubleshooting

### Conflito de Portas
Se ainda houver conflitos, altere no `docker-compose.yml`:
```yaml
ports:
  - "NOVA_PORTA:PORTA_INTERNA"
```

### Verificar Portas em Uso
```bash
netstat -tlnp | grep :809
```

### Logs de Erro
```bash
make logs-app | grep ERROR
```

---

**🏗️ Configuração otimizada para servidores compartilhados**  
*Evita conflitos de porta e facilita o gerenciamento*