# =============================================================================
# Etu Server - Next.js Full Stack Application
# =============================================================================

FROM node:25-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
# NPM_TOKEN is required for @icco/etu-proto from GitHub Packages
ARG NPM_TOKEN
COPY package.json yarn.lock* .npmrc ./
RUN if [ -z "$NPM_TOKEN" ]; then \
      echo "ERROR: NPM_TOKEN build arg is required for @icco/etu-proto"; \
      echo "Usage: docker build --build-arg NPM_TOKEN=\$GITHUB_TOKEN ..."; \
      exit 1; \
    fi && \
    echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc && \
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