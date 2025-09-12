# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Install dependencies needed for native modules and chromium
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV JWT_SECRET_CURRENT="temp-build-secret-32-chars-minimum-for-build-only"

# Build the application with verbose logging
RUN echo "Starting build process..." && \
    npm --version && \
    node --version && \
    echo "Environment variables:" && \
    env | grep -E "(NODE|NPM|NEXT|PUPPETEER|JWT)" && \
    echo "Running build:docker..." && \
    npm run build:docker && \
    echo "Build completed, copying static files for standalone..." && \
    cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create directories and set permissions  
RUN mkdir -p /app/propostas /app/database && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Set runtime environment variables
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

# Change to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["sh", "./start-server.sh"]