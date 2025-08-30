# Dockerfile para Lotus Project
FROM nginx:alpine

# Instalar dependências necessárias
RUN apk add --no-cache \
    curl \
    ca-certificates

# Criar diretórios necessários
RUN mkdir -p /var/www/lotus \
    && mkdir -p /var/www/lotus/propostas \
    && mkdir -p /var/log/nginx \
    && mkdir -p /etc/nginx/conf.d

# Copiar arquivos do projeto
COPY . /var/www/lotus/

# Configurar permissões
RUN chmod -R 755 /var/www/lotus \
    && chown -R nginx:nginx /var/www/lotus

# Criar configuração do Nginx
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /var/www/lotus; \
    index index.html; \
    \
    # Configuração para servir arquivos estáticos \
    location / { \
        try_files $uri $uri/ =404; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
    \
    # Servir propostas geradas \
    location /propostas/ { \
        alias /var/www/lotus/propostas/; \
        autoindex on; \
        add_header Content-Disposition "attachment"; \
    } \
    \
    # Headers de segurança \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Configurações para mobile \
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Log de acesso \
    access_log /var/log/nginx/lotus_access.log; \
    error_log /var/log/nginx/lotus_error.log; \
}' > /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]