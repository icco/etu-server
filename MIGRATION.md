# Web UI Migration Guide

This document explains how to migrate the web UI from server actions to REST API calls.

## Overview

The web UI currently uses Next.js server actions from `lib/actions/notes.ts`. To use the REST API instead, we need to:

1. Replace server action imports with the API client
2. Update components to use async/await with the API client
3. Handle loading and error states client-side

## Changes Required

### Current Architecture

```typescript
// Server-side rendering with server actions
import { getNotes, createNote } from "@/lib/actions/notes"

export default async function NotesPage() {
  const data = await getNotes()
  return <NotesView notes={data.notes} />
}
```

### Target Architecture

```typescript
// Client-side rendering with API calls
"use client"
import { api } from "@/lib/client/api"
import { useState, useEffect } from "react"

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listNotes().then(data => {
      setNotes(data.notes)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>
  return <NotesView notes={notes} />
}
```

## Benefits of REST API Migration

1. **Consistency**: Web UI uses same API as external clients
2. **Testing**: Can test UI and API independently
3. **Caching**: Can leverage standard HTTP caching
4. **Monitoring**: Easier to monitor API usage across all clients
5. **Development**: Can develop UI and API separately

## API Client Usage

The API client is available at `lib/client/api.ts`:

```typescript
import { api } from "@/lib/client/api"

// List notes
const { notes, total } = await api.listNotes({
  search: "query",
  tags: ["work", "important"],
  limit: 50,
  offset: 0
})

// Create note
const note = await api.createNote({
  content: "My note content",
  tags: ["tag1", "tag2"]
})

// Update note
const updated = await api.updateNote(noteId, {
  content: "Updated content",
  tags: ["new", "tags"]
})

// Delete note
await api.deleteNote(noteId)

// List tags
const { tags } = await api.listTags()
```

## Migration Steps

### 1. Update NotesPage Component

**File:** `app/(app)/notes/page.tsx`

Change from server component to client component that fetches data on mount.

### 2. Update NotesView Component

**File:** `app/(app)/notes/notes-view.tsx`

Replace server action calls with API client calls:

```typescript
// Before
import { createNote } from "@/lib/actions/notes"
await createNote({ content, tags })

// After
import { api } from "@/lib/client/api"
await api.createNote({ content, tags })
```

### 3. Add Error Handling

Wrap API calls in try/catch:

```typescript
try {
  await api.createNote({ content, tags })
  toast.success("Note created")
} catch (error) {
  toast.error(error.message)
}
```

### 4. Add Loading States

Use React state to manage loading:

```typescript
const [loading, setLoading] = useState(false)

const handleCreate = async () => {
  setLoading(true)
  try {
    await api.createNote({ content, tags })
  } finally {
    setLoading(false)
  }
}
```

## Authentication

The API endpoints support both:
- **Session auth** (automatic for web UI via cookies)
- **API key auth** (for external clients via Authorization header)

Web UI requests will automatically use session authentication, so no code changes needed for auth.

## Testing

Before migrating, ensure:

1. API endpoints work with session auth
2. CORS is configured if needed
3. Error responses are consistent
4. Loading states don't cause UI flicker

## Rollout Strategy

1. **Phase 1**: Keep both server actions and API available
2. **Phase 2**: Migrate one component at a time
3. **Phase 3**: Test thoroughly after each component
4. **Phase 4**: Remove server actions once migration complete

## Status

- [x] REST API endpoints created
- [x] API client wrapper created
- [x] Dual authentication (session + API key) implemented
- [ ] NotesPage component migrated
- [ ] NotesView component migrated
- [ ] Settings page migrated
- [ ] Server actions removed

## Next Steps

1. Migrate `app/(app)/notes/page.tsx` to use API client
2. Update `app/(app)/notes/notes-view.tsx` to use API client
3. Test all CRUD operations work correctly
4. Update settings page to use API client for API key management
5. Remove old server actions once migration is complete
