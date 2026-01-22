# =============================================================================
# Etu Server - Next.js Full Stack Application
# =============================================================================

FROM node:25-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Generate Prisma client (requires prisma.config.ts and a dummy DATABASE_URL)
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" yarn db:generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client again (needed for build)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" yarn db:generate

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

# Copy API documentation for /docs endpoint
COPY --from=builder /app/API.md ./

# Copy prisma files and full node_modules for db push at startup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=deps /app/node_modules ./node_modules

# Copy startup script
COPY --chmod=755 start.sh ./

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Run database schema push and start the server
CMD ["/app/start.sh"]