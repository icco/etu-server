# =============================================================================
# Etu Server Dockerfile
# Builds both the frontend (React) and backend (Node.js API)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build the frontend
# -----------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy frontend source and build
COPY index.html tsconfig.json vite.config.ts tailwind.config.js components.json ./
COPY src ./src
COPY public ./public 2>/dev/null || true

# Set API URL for production build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN yarn build

# -----------------------------------------------------------------------------
# Stage 2: Build the API server
# -----------------------------------------------------------------------------
FROM node:22-alpine AS api-builder

WORKDIR /app/server

# Copy server package files
COPY server/package.json ./
RUN npm install --production=false

# Copy server source and build
COPY server/tsconfig.json ./
COPY server/src ./src

RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 3: Production image with both frontend and API
# -----------------------------------------------------------------------------
FROM node:22-alpine AS production

WORKDIR /app

# Install nginx for serving frontend
RUN apk add --no-cache nginx supervisor

# Copy built frontend
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy built API server
COPY --from=api-builder /app/server/dist ./server/dist
COPY --from=api-builder /app/server/node_modules ./server/node_modules
COPY --from=api-builder /app/server/package.json ./server/

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R node:node /app/data

# Create supervisord config
RUN echo '[supervisord]' > /etc/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisord.conf && \
    echo 'user=root' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:api]' >> /etc/supervisord.conf && \
    echo 'command=node /app/server/dist/index.js' >> /etc/supervisord.conf && \
    echo 'directory=/app/server' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'user=node' >> /etc/supervisord.conf && \
    echo 'environment=NODE_ENV="production",DATABASE_URL="/app/data/etu.db",PORT="3001",FRONTEND_URL="http://localhost"' >> /etc/supervisord.conf

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/health || exit 1

# Start both services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]