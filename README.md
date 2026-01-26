# Etu Server

Etu is an interstitial journaling platform that helps you capture life's moments through quick, tagged markdown notes called "blips."

This is the webapp for Etu. For more reading on our ideas see:

 - https://writing.natwelch.com/post/765
 - [BLIPS.md](./BLIPS.md)

## Features

- **Quick Capture**: Write notes in Markdown with live preview (Cmd+Enter to save)
- **Tag System**: Organize notes with custom tags and autocomplete
- **Search & Filter**: Find notes by content, tags, or date
- **Timeline View**: Browse notes chronologically with date grouping
- **Full Note View**: Click any note to see rendered markdown
- **Settings**: Manage account, view stats, and manage API keys
- **Keyboard Shortcuts**: `n` for new note, `/` to search
- **Mobile Support**: Responsive design with bottom navigation
- **API Keys**: Generate keys for CLI and mobile app access
- **Stripe Subscriptions**: $5/year with Stripe integration

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Backend**: Connect RPC client for etu-backend service
- **Proto Types**: `@icco/etu-proto` package (shared TypeScript types)
- **Auth**: Auth.js v5 (NextAuth) with credentials via gRPC backend
- **Styling**: Tailwind CSS 4 + daisyUI 5
- **Icons**: Heroicons
- **Markdown**: marked + DOMPurify
- **Payments**: Stripe

## Quick Start

### Prerequisites

- Node.js 25+ (see `.nvmrc`)
- Yarn
- Running [etu-backend](https://github.com/icco/etu-backend) gRPC service
- GitHub Packages authentication (for `@icco/etu-proto`)

### Development

```bash
# Configure npm for @icco scope (if not already done)
# Add to ~/.npmrc: //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your gRPC backend URL and secrets

# Start development server
yarn dev
```

Open http://localhost:3000

### Environment Variables

```env
# Auth.js
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"

# gRPC Backend (Connect RPC)
GRPC_BACKEND_URL="http://localhost:50051"
GRPC_API_KEY="your-service-api-key"  # Required

# Stripe (optional)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
```

## Docker

```bash
# Development with docker-compose
docker-compose up -d

# Production build (requires GitHub token for @icco/etu-proto)
docker build --build-arg NPM_TOKEN=$GITHUB_TOKEN -t etu-server .
docker run -p 3000:3000 \
  -e AUTH_SECRET="..." \
  -e GRPC_BACKEND_URL="http://backend:50051" \
  -e GRPC_API_KEY="..." \
  etu-server
```

## Project Structure

```
├── app/
│   ├── (auth)/           # Login/register pages
│   │   ├── login/
│   │   └── register/
│   ├── (app)/            # Protected app pages
│   │   ├── notes/        # Notes timeline
│   │   └── settings/     # User settings
│   ├── api/
│   │   ├── auth/         # NextAuth handlers
│   │   └── stripe/       # Stripe webhooks
│   ├── layout.tsx
│   ├── page.tsx          # Landing page
│   └── globals.css
├── components/
│   ├── note-card.tsx
│   └── note-dialog.tsx
├── lib/
│   ├── actions/          # Server actions (use gRPC backend)
│   │   ├── auth.ts
│   │   ├── notes.ts
│   │   └── api-keys.ts
│   ├── grpc/
│   │   └── client.ts     # Connect RPC client for etu-backend
│   ├── auth.ts           # Auth.js config
│   └── stripe.ts
├── middleware.ts         # Auth middleware
└── next.config.ts
```

## Architecture

This webapp follows a microservice architecture:

- **etu-web** (this repo): Frontend webapp (no direct database access)
- **[etu-backend](https://github.com/icco/etu-backend)**: gRPC service for all data storage (users, notes, tags, API keys)

The webapp communicates with the backend via [Connect RPC](https://connectrpc.com/). TypeScript types are shared via the `@icco/etu-proto` package (published from etu-backend).

### API Access

For programmatic access to notes and tags, use:
- **CLI**: https://github.com/icco/etu
- **Mobile**: https://github.com/icco/etu-mobile

Generate API keys in Settings to use with these clients.
