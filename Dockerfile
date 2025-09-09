# Dockerfile ultra-simples para Coolify
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
    && rm -rf /var/lib/apt/lists/*

# Configurar Puppeteer
ENV NODE_ENV=development \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copiar e instalar
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Criar diretório
RUN mkdir -p /app/propostas

# Expor porta
EXPOSE 3000

# Iniciar em modo dev (mais tolerante a erros)
CMD ["npm", "run", "dev"]