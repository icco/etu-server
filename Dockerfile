# syntax=docker/dockerfile:1
# =============================================================================
# Etu Server - Next.js Full Stack Application
# =============================================================================

FROM node:25-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
# NPM_TOKEN is required for @icco/etu-proto from GitHub Packages (use secrets, not build-args)
COPY package.json yarn.lock* .npmrc ./
RUN --mount=type=secret,id=npm_token \
    if [ ! -s /run/secrets/npm_token ]; then \
      echo "ERROR: NPM_TOKEN secret is required for @icco/etu-proto"; \
      echo "Usage: docker build --secret id=npm_token,env=NPM_TOKEN ..."; \
      exit 1; \
    fi && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npm_token)" >> .npmrc && \
    yarn install --frozen-lockfile && \
    rm -f .npmrc

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]