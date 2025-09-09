# Dockerfile simplificado para Coolify
FROM node:18-slim

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libgtk-4-1 \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV REACT_EDITOR=""
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copiar código
COPY . .

# Debug: listar arquivos
RUN ls -la

# Fazer build com log detalhado
RUN npm run build:docker || (echo "Build falhou, listando arquivos:" && ls -la .next && exit 1)

# Criar diretório para PDFs
RUN mkdir -p /app/propostas && chmod 755 /app/propostas

# Expor porta
EXPOSE 3000

# Comando para produção
CMD ["npm", "start"]