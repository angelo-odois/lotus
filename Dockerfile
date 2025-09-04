# Dockerfile para Lotus Project
FROM nginx:alpine

# Instalar dependências necessárias incluindo PHP
RUN apk add --no-cache \
    curl \
    ca-certificates \
    php82 \
    php82-fpm \
    php82-json \
    php82-mbstring \
    supervisor

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

# Configurar PHP-FPM
RUN echo '[www]' > /etc/php82/php-fpm.d/www.conf && \
    echo 'user = nginx' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'group = nginx' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'listen = /var/run/php-fpm82.sock' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'listen.owner = nginx' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'listen.group = nginx' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'pm = dynamic' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'pm.max_children = 5' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'pm.start_servers = 2' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'pm.min_spare_servers = 1' >> /etc/php82/php-fpm.d/www.conf && \
    echo 'pm.max_spare_servers = 3' >> /etc/php82/php-fpm.d/www.conf

# Criar configuração do Nginx com suporte a PHP
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /var/www/lotus; \
    index index.html index.php; \
    \
    # Configuração para servir arquivos estáticos \
    location / { \
        try_files $uri $uri/ =404; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
    \
    # Processar arquivos PHP \
    location ~ \.php$ { \
        fastcgi_pass unix:/var/run/php-fpm82.sock; \
        fastcgi_index index.php; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi_params; \
        fastcgi_param PHP_VALUE "upload_max_filesize=50M \n post_max_size=50M"; \
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

# Configurar supervisor
RUN echo '[supervisord]' > /etc/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:php-fpm]' >> /etc/supervisord.conf && \
    echo 'command=php-fpm82 -F' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar supervisor (nginx + php-fpm)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]