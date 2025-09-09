# Multi-stage build para Next.js
FROM node:18-slim AS base

# Instalar dependências do sistema
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

WORKDIR /app

# Instalar dependências para build (incluindo devDependencies)
FROM base AS builder
COPY package*.json ./
RUN npm ci

# Copiar código e fazer build
COPY . .

# Configurar variáveis para build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV REACT_EDITOR=""
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm run build:docker

# Estágio de produção
FROM base AS runner

# Configurar variáveis de produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV REACT_EDITOR=""
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar arquivos de build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Criar diretório para PDFs
RUN mkdir -p /app/propostas && chmod 755 /app/propostas

# Expor porta
EXPOSE 3000

# Comando para produção
CMD ["node", "server.js"]