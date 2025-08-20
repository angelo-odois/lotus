# Use a imagem base do nginx
FROM nginx:alpine

# Remove a configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia o arquivo de configuração customizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos da aplicação
COPY . /usr/share/nginx/html

# Expõe a porta 8080
EXPOSE 8080

# Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
