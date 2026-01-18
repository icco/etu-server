# Etu Server

Etu is an interstitial journaling platform that helps you capture life's moments through quick, tagged markdown notes called "blips."

Read more about the concept at https://writing.natwelch.com/post/765

## Features

### 🎨 Landing Page
A modern marketing page that introduces Etu, explains interstitial journaling, and showcases features with honest pricing ($5/year).

### 📝 Web Client
A full-featured journaling application with:
- **Quick Capture**: Write notes in Markdown with live preview
- **Tag System**: Organize notes with custom tags
- **Search & Filter**: Find notes by content, tags, or date
- **Timeline View**: Browse notes chronologically with date grouping
- **Settings**: Manage account, subscription, and API keys

### 🔌 API Server
_(Coming in a separate PR)_

The backend API server will provide:
- gRPC and HTTP/JSON APIs
- Authentication with API keys
- Persistent storage
- Stripe payment integration
- Multi-client support (web, CLI, mobile)

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Radix UI + Tailwind CSS 4
- **Icons**: Phosphor Icons
- **Markdown**: marked library
- **State Management**: GitHub Spark KV (browser storage)

## Development

### Prerequisites
- Node.js 18+ 
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start at http://localhost:5000

## Project Structure

```
src/
├── components/
│   ├── LandingPage.tsx      # Marketing landing page
│   ├── AppView.tsx           # Main application view
│   ├── NoteCard.tsx          # Individual note display
│   ├── NoteDialog.tsx        # Note creation/editing modal
│   ├── SettingsDialog.tsx    # User settings
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── note-utils.ts         # Note manipulation utilities
│   └── utils.ts              # General utilities
├── App.tsx                   # Root application component
└── main.tsx                  # Application entry point
```

## Current Limitations

This implementation currently uses browser-based local storage. For production use, it requires:

1. **Backend API Server** - RESTful/gRPC API for data persistence
2. **Authentication** - Proper user authentication system
3. **Payment Integration** - Stripe integration for subscriptions
4. **Database** - Persistent storage (PostgreSQL recommended)

See the [API Server Roadmap](#api-server-roadmap) section below.

## Related Projects

- **CLI Client**: https://github.com/icco/etu
- **Mobile App**: https://github.com/icco/etu-mobile

## API Server Roadmap

The API server will be implemented in a separate PR with:

### Core Features
- [ ] Protocol Buffer definitions based on icco/etu
- [ ] gRPC server implementation
- [ ] HTTP/JSON gateway
- [ ] JWT + API key authentication
- [ ] PostgreSQL database integration
- [ ] Note CRUD operations
- [ ] Full-text search
- [ ] Tag management

### Payment & Users
- [ ] Stripe subscription integration
- [ ] User registration and management
- [ ] Subscription status tracking
- [ ] Payment webhook handling

### DevOps
- [ ] Docker containerization
- [ ] Database migrations
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Integration tests
- [ ] CI/CD pipeline

## Design Philosophy

Etu follows these experience qualities:

1. **Effortless** - Capturing thoughts should be friction-free
2. **Purposeful** - Every element serves quick capture and easy retrieval
3. **Trustworthy** - Stable, secure, and respectful of user content

## License

MIT License - Copyright (c) 2024 Etu

GitHub Spark Template resources are licensed under the MIT license, Copyright GitHub, Inc.
