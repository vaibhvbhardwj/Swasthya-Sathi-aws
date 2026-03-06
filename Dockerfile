# Multi-stage build for optimized image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY package*.json ./

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules

# Copy backend application code
COPY --chown=nodejs:nodejs backend ./backend

# Copy frontend static files
COPY --chown=nodejs:nodejs frontend ./frontend

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set working directory to backend
WORKDIR /app/backend

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
