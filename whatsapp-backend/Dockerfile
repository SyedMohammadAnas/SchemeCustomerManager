# WhatsApp Backend Dockerfile
# Multi-stage build for optimized production image with persistent volumes

# Use official Node.js LTS image as base
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Clear any existing node_modules and install dependencies fresh
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm ci --only=production && \
    npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install additional packages needed for Puppeteer and Chrome
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S whatsapp -u 1001

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY --chown=whatsapp:nodejs . .

# Make startup script executable
RUN chmod +x start.sh

# Set Puppeteer to use installed Chromium with proper paths
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/bin/chromium-browser

# Create directories for sessions and logs with proper permissions
# These will be mounted as persistent volumes
RUN mkdir -p /app/tokens /app/logs /app/sessions && \
    chown -R whatsapp:nodejs /app/tokens /app/logs /app/sessions && \
    chmod -R 755 /app/tokens /app/logs /app/sessions

# Create symbolic links for persistent storage
RUN ln -sf /app/tokens ./tokens && \
    ln -sf /app/logs ./logs && \
    ln -sf /app/sessions ./sessions

# Switch to non-root user
USER whatsapp

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application using the startup script
CMD ["./start.sh"]
