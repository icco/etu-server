# Etu Server

Etu is an interstitial journaling platform that helps you capture life's moments through quick, tagged markdown notes called "blips."

Read more about the concept at https://writing.natwelch.com/post/765

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
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Auth.js v5 (NextAuth) with credentials
- **Styling**: Tailwind CSS 4
- **Icons**: Phosphor Icons
- **Markdown**: marked + DOMPurify
- **Payments**: Stripe

## Quick Start

### Prerequisites

- Node.js 25+ (see `.nvmrc`)
- PostgreSQL database
- Yarn

### Development

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and secrets

# Push database schema
yarn db:push

# Start development server
yarn dev
```

Open http://localhost:3000

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/etu"

# Auth.js
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
```

## Docker

```bash
# Development with docker-compose
docker-compose up -d

# Production build
docker build -t etu-server .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
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
│   ├── actions/          # Server actions
│   │   ├── auth.ts
│   │   ├── notes.ts
│   │   └── api-keys.ts
│   ├── auth.ts           # Auth.js config
│   ├── db.ts             # Prisma client
│   └── stripe.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts         # Auth middleware
└── next.config.ts
```

## API Keys

Generate API keys in Settings to use with:
- **CLI**: https://github.com/icco/etu
- **Mobile**: https://github.com/icco/etu-mobile

```bash
# Use API key with curl
curl -H "Authorization: etu_your_key_here" \
  https://your-domain.com/api/notes
```

## Database

Uses Prisma with PostgreSQL. Key models:

- **User**: Account with subscription status
- **Note**: Markdown content with timestamps
- **Tag**: User-scoped tags
- **NoteTag**: Many-to-many junction
- **ApiKey**: Hashed API keys for external access

## License

MIT License - Copyright (c) 2024 Etu
