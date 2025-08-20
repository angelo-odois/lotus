# Nginx simples para servir HTML estático
FROM nginx:alpine

# Copiar arquivos HTML
COPY . /usr/share/nginx/html/

# Copiar configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Nginx já inicia automaticamente
CMD ["nginx", "-g", "daemon off;"]
