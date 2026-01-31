// Mock gRPC services for e2e testing
// Used when E2E_MOCK=true environment variable is set

import type {
  ListNotesRequest,
  ListNotesResponse,
  CreateNoteRequest,
  CreateNoteResponse,
  GetNoteRequest,
  GetNoteResponse,
  UpdateNoteRequest,
  UpdateNoteResponse,
  DeleteNoteRequest,
  DeleteNoteResponse,
  ListTagsRequest,
  ListTagsResponse,
  RegisterRequest,
  RegisterResponse,
  AuthenticateRequest,
  AuthenticateResponse,
  GetUserRequest,
  GetUserResponse,
  UpdateUserSubscriptionRequest,
  UpdateUserSubscriptionResponse,
  GetUserByStripeCustomerIdRequest,
  GetUserByStripeCustomerIdResponse,
  GetUserSettingsRequest,
  GetUserSettingsResponse,
  UpdateUserSettingsRequest,
  UpdateUserSettingsResponse,
  Note,
  Tag,
  User,
  UserSettings,
  Timestamp,
} from "./client"

// Mock data
const mockTimestamp = (date: Date): Timestamp => ({
  seconds: Math.floor(date.getTime() / 1000).toString(),
  nanos: 0,
})

const mockNotes: Note[] = [
  {
    id: "mock-note-1",
    content:
      "This is my first thought about **building** something great.\n\nIt has multiple paragraphs and supports markdown.",
    tags: ["ideas", "projects"],
    createdAt: mockTimestamp(new Date("2026-01-25T10:00:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-25T10:00:00Z")),
  },
  {
    id: "mock-note-2",
    content: "Meeting notes from today:\n- Discussed roadmap\n- Aligned on priorities\n- Next steps identified",
    tags: ["work", "meetings"],
    createdAt: mockTimestamp(new Date("2026-01-24T14:30:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-24T14:30:00Z")),
  },
  {
    id: "mock-note-3",
    content: "Remember to call mom on Sunday",
    tags: ["personal", "reminders"],
    createdAt: mockTimestamp(new Date("2026-01-23T09:15:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-23T09:15:00Z")),
  },
  {
    id: "mock-note-4",
    content: "Book recommendations:\n- The Pragmatic Programmer\n- Clean Code\n- Design Patterns",
    tags: ["reading", "personal"],
    createdAt: mockTimestamp(new Date("2026-01-22T16:45:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-22T16:45:00Z")),
  },
  {
    id: "mock-note-5",
    content: "Quick idea: what if we added dark mode to the app?",
    tags: ["ideas"],
    createdAt: mockTimestamp(new Date("2026-01-21T11:20:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-21T11:20:00Z")),
  },
]

const mockTags: Tag[] = [
  { id: "tag-1", name: "ideas", count: 2 },
  { id: "tag-2", name: "projects", count: 1 },
  { id: "tag-3", name: "work", count: 1 },
  { id: "tag-4", name: "meetings", count: 1 },
  { id: "tag-5", name: "personal", count: 2 },
  { id: "tag-6", name: "reminders", count: 1 },
  { id: "tag-7", name: "reading", count: 1 },
]

let mockUser: User = {
  id: "mock-user-1",
  email: "test@example.com",
  name: "Test User",
  subscriptionStatus: "active",
  createdAt: mockTimestamp(new Date("2026-01-01T00:00:00Z")),
}

let mockUserSettings: UserSettings = {
  userId: "mock-user-1",
  username: "Test User",
  notionKey: undefined,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-15T00:00:00Z"),
}

// Mock Notes Service
export const mockNotesService = {
  async listNotes(request: ListNotesRequest, _apiKey: string): Promise<ListNotesResponse> {
    let filtered = [...mockNotes]

    // Filter by search
    if (request.search) {
      const search = request.search.toLowerCase()
      filtered = filtered.filter((n) => n.content.toLowerCase().includes(search))
    }

    // Filter by tags
    if (request.tags && request.tags.length > 0) {
      filtered = filtered.filter((n) => request.tags!.some((t) => n.tags.includes(t)))
    }

    const offset = request.offset || 0
    const limit = request.limit || 50
    const paginated = filtered.slice(offset, offset + limit)

    return {
      notes: paginated,
      total: filtered.length,
      limit,
      offset,
    }
  },

  async createNote(request: CreateNoteRequest, _apiKey: string): Promise<CreateNoteResponse> {
    const now = new Date()
    const note: Note = {
      id: `mock-note-${Date.now()}`,
      content: request.content,
      tags: request.tags || [],
      createdAt: mockTimestamp(now),
      updatedAt: mockTimestamp(now),
    }
    mockNotes.unshift(note)
    return { note }
  },

  async getNote(request: GetNoteRequest, _apiKey: string): Promise<GetNoteResponse> {
    const note = mockNotes.find((n) => n.id === request.id)
    if (!note) {
      throw new Error("Note not found")
    }
    return { note }
  },

  async updateNote(request: UpdateNoteRequest, _apiKey: string): Promise<UpdateNoteResponse> {
    const index = mockNotes.findIndex((n) => n.id === request.id)
    if (index === -1) {
      throw new Error("Note not found")
    }
    const note = mockNotes[index]
    if (request.content !== undefined) {
      note.content = request.content
    }
    if (request.updateTags && request.tags !== undefined) {
      note.tags = request.tags
    }
    note.updatedAt = mockTimestamp(new Date())
    return { note }
  },

  async deleteNote(request: DeleteNoteRequest, _apiKey: string): Promise<DeleteNoteResponse> {
    const index = mockNotes.findIndex((n) => n.id === request.id)
    if (index === -1) {
      throw new Error("Note not found")
    }
    mockNotes.splice(index, 1)
    return { success: true }
  },
}

// Mock Tags Service
export const mockTagsService = {
  async listTags(_request: ListTagsRequest, _apiKey: string): Promise<ListTagsResponse> {
    return { tags: mockTags }
  },
}

// Mock Auth Service
export const mockAuthService = {
  async register(request: RegisterRequest, _apiKey: string): Promise<RegisterResponse> {
    return {
      user: {
        ...mockUser,
        email: request.email,
      },
    }
  },

  async authenticate(request: AuthenticateRequest, _apiKey: string): Promise<AuthenticateResponse> {
    // Accept any credentials in mock mode
    return {
      success: true,
      user: {
        ...mockUser,
        email: request.email,
      },
    }
  },

  async getUser(_request: GetUserRequest, _apiKey: string): Promise<GetUserResponse> {
    return { user: mockUser }
  },

  async getUserByStripeCustomerId(
    _request: GetUserByStripeCustomerIdRequest,
    _apiKey: string
  ): Promise<GetUserByStripeCustomerIdResponse> {
    return { user: mockUser }
  },

  async updateUserSubscription(
    request: UpdateUserSubscriptionRequest,
    _apiKey: string
  ): Promise<UpdateUserSubscriptionResponse> {
    // Update mock user subscription status
    const updatedUser = {
      ...mockUser,
      subscriptionStatus: request.subscriptionStatus || mockUser.subscriptionStatus,
      stripeCustomerId: request.stripeCustomerId,
      subscriptionEnd: request.subscriptionEnd,
    }
    return { user: updatedUser }
  },

}

// Mock User Settings Service
export const mockUserSettingsService = {
  async getUserSettings(
    _request: GetUserSettingsRequest,
    _apiKey: string
  ): Promise<GetUserSettingsResponse> {
    return { settings: mockUserSettings }
  },

  async updateUserSettings(
    request: UpdateUserSettingsRequest,
    _apiKey: string
  ): Promise<UpdateUserSettingsResponse> {
    mockUserSettings = {
      ...mockUserSettings,
      username: request.username ?? mockUserSettings.username,
      notionKey: request.notionKey ?? mockUserSettings.notionKey,
      updatedAt: new Date(),
    }
    // Also update the mock user name for consistency
    if (request.username) {
      mockUser = { ...mockUser, name: request.username }
    }
    return { settings: mockUserSettings }
  },
}

export function isMockMode(): boolean {
  return process.env.E2E_MOCK === "true"
}
