# Multi-stage build para produção otimizada
FROM node:18-slim AS base

# Instalar dependências necessárias para Puppeteer e build
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

# Configurar Puppeteer para produção
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    REACT_EDITOR="" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código e fazer build
COPY . .
RUN npm run build:docker

# Criar diretório para PDFs
RUN mkdir -p /app/propostas && chmod 755 /app/propostas

# Expor porta
EXPOSE 3000

# Comando para produção
CMD ["npm", "start"]