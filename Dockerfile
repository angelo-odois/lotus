# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Install dependencies for building Node.js native modules and Puppeteer
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ca-certificates \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV DATABASE_URL="postgres://temp:temp@localhost:5432/temp"
ENV JWT_SECRET_CURRENT="build-temp-secret-32-chars-minimum-for-build-only"

# Build the application
RUN echo "Starting build process..." && \
    npm --version && \
    node --version && \
    echo "Running build..." && \
    npm run build:docker && \
    echo "Build completed, preparing standalone..." && \
    cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create directories and set permissions  
RUN mkdir -p /app/data && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Set runtime environment variables
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Change to non-root user
USER nextjs

# Health check using simple endpoint
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["sh", "./start-server.sh"]