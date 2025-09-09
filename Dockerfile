# Dockerfile simplificado para Coolify + Puppeteer
FROM node:18-alpine

# Instalar dependências necessárias para Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wget \
    && rm -rf /var/cache/apk/*

# Configurar Puppeteer
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copiar package files e instalar dependências
COPY package*.json ./
RUN npm ci --frozen-lockfile --ignore-scripts

# Copiar código fonte
COPY . .

# Build da aplicação (desabilitando verificações para acelerar)
ENV NEXT_PRIVATE_SKIP_VALIDATION=1
RUN npm run build:docker

# Criar diretório para PDFs
RUN mkdir -p /app/propostas

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Comando para iniciar
CMD ["npm", "start"]