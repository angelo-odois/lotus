# Dockerfile otimizado para Coolify
FROM node:20-slim

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    wget \
    curl \
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

# Configurar para build
ENV NEXT_TELEMETRY_DISABLED=1 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Construir aplicação (sem turbopack)
RUN npm run build:docker

# Definir NODE_ENV para produção após o build
ENV NODE_ENV=production

# Criar diretório para PDFs
RUN mkdir -p /app/propostas && chown -R node:node /app

# Usar usuário não-root
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["npm", "start"]