# Node.js 20 Alpine Base Image
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose HTTP API Port
EXPOSE 5000

# Environment Defaults
ENV NODE_ENV=production
ENV PORT=5000

# Health check using script
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node scripts/healthcheck.js || exit 1

# Start Server
CMD ["node", "src/server.js"]
