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
  GetRandomNotesRequest,
  GetRandomNotesResponse,
  SearchNotesRequest,
  SearchNotesResponse,
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
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ListApiKeysRequest,
  ListApiKeysResponse,
  DeleteApiKeyRequest,
  DeleteApiKeyResponse,
  VerifyApiKeyRequest,
  VerifyApiKeyResponse,
  GetStatsRequest,
  GetStatsResponse,
  ApiKey,
  Note,
  NoteImage,
  NoteAudio,
  Tag,
  User,
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
      "This is my first thought about **building** something great. I have many ideas for new features.\n\nIt has multiple paragraphs and supports markdown.",
    tags: ["ideas", "projects"],
    images: [],
    audios: [],
    createdAt: mockTimestamp(new Date("2026-01-25T10:00:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-25T10:00:00Z")),
  },
  {
    id: "mock-note-2",
    content: "Meeting notes from today:\n- Discussed roadmap\n- Aligned on priorities\n- Next steps identified",
    tags: ["work", "meetings"],
    images: [],
    audios: [],
    createdAt: mockTimestamp(new Date("2026-01-24T14:30:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-24T14:30:00Z")),
  },
  {
    id: "mock-note-3",
    content: "Personal reminder: call mom on Sunday",
    tags: ["personal", "reminders"],
    images: [],
    audios: [],
    createdAt: mockTimestamp(new Date("2026-01-23T09:15:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-23T09:15:00Z")),
  },
  {
    id: "mock-note-4",
    content: "Personal book recommendations:\n- The Pragmatic Programmer\n- Clean Code\n- Design Patterns",
    tags: ["reading", "personal"],
    images: [],
    audios: [],
    createdAt: mockTimestamp(new Date("2026-01-22T16:45:00Z")),
    updatedAt: mockTimestamp(new Date("2026-01-22T16:45:00Z")),
  },
  {
    id: "mock-note-5",
    content: "Quick idea: what if we added dark mode to the app?",
    tags: ["ideas"],
    images: [],
    audios: [],
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
  notionKey: undefined,
}

const mockApiKeys: ApiKey[] = [
  {
    id: "mock-key-1",
    name: "My Laptop CLI",
    keyPrefix: "etu_abc123",
    createdAt: mockTimestamp(new Date("2026-01-15T10:00:00Z")),
    lastUsed: mockTimestamp(new Date("2026-01-20T14:30:00Z")),
  },
]


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
    // Convert uploaded images to NoteImage objects (mock URLs)
    const images: NoteImage[] = (request.images || []).map((img, idx) => ({
      id: `mock-image-${Date.now()}-${idx}`,
      url: `data:${img.mimeType};base64,${Buffer.from(img.data).toString("base64")}`,
      extractedText: "",
      mimeType: img.mimeType,
      createdAt: mockTimestamp(now),
    }))
    // Convert uploaded audios to NoteAudio objects (mock URLs)
    const audios: NoteAudio[] = (request.audios || []).map((audio, idx) => ({
      id: `mock-audio-${Date.now()}-${idx}`,
      url: `data:${audio.mimeType};base64,${Buffer.from(audio.data).toString("base64")}`,
      transcribedText: "",
      mimeType: audio.mimeType,
      createdAt: mockTimestamp(now),
    }))
    const note: Note = {
      id: `mock-note-${Date.now()}`,
      content: request.content,
      tags: request.tags || [],
      images,
      audios,
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
    const now = new Date()
    if (request.content !== undefined) {
      note.content = request.content
    }
    if (request.updateTags && request.tags !== undefined) {
      note.tags = request.tags
    }
    // Add new images if provided
    if (request.addImages && request.addImages.length > 0) {
      const newImages: NoteImage[] = request.addImages.map((img, idx) => ({
        id: `mock-image-${Date.now()}-${idx}`,
        url: `data:${img.mimeType};base64,${Buffer.from(img.data).toString("base64")}`,
        extractedText: "",
        mimeType: img.mimeType,
        createdAt: mockTimestamp(now),
      }))
      note.images = [...note.images, ...newImages]
    }
    // Add new audios if provided
    if (request.addAudios && request.addAudios.length > 0) {
      const newAudios: NoteAudio[] = request.addAudios.map((audio, idx) => ({
        id: `mock-audio-${Date.now()}-${idx}`,
        url: `data:${audio.mimeType};base64,${Buffer.from(audio.data).toString("base64")}`,
        transcribedText: "",
        mimeType: audio.mimeType,
        createdAt: mockTimestamp(now),
      }))
      note.audios = [...note.audios, ...newAudios]
    }
    note.updatedAt = mockTimestamp(now)
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

  async getRandomNotes(request: GetRandomNotesRequest, _apiKey: string): Promise<GetRandomNotesResponse> {
    const count = request.count || 5
    // Return random notes - server is responsible for randomization
    // Just return the first N notes from mock data for testing
    return { notes: mockNotes.slice(0, Math.min(count, mockNotes.length)) }
  },

  async searchNotes(request: SearchNotesRequest, _apiKey: string): Promise<SearchNotesResponse> {
    const query = (request.query || "").toLowerCase()
    const filtered = query
      ? mockNotes.filter((n) => n.content.toLowerCase().includes(query))
      : [...mockNotes]
    const offset = request.offset || 0
    const limit = request.limit || 50
    const notes = filtered.slice(offset, offset + limit)
    return { notes, total: filtered.length }
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
    return { user: mockUser }
  },

  async updateUserSettings(
    request: UpdateUserSettingsRequest,
    _apiKey: string
  ): Promise<UpdateUserSettingsResponse> {
    // Update mock user with new settings
    mockUser = {
      ...mockUser,
      name: request.name ?? mockUser.name,
      image: request.image ?? mockUser.image,
      notionKey: request.notionKey ?? mockUser.notionKey,
    }
    return { user: mockUser }
  },
}

// Mock API Keys Service
export const mockApiKeysService = {
  async createApiKey(
    request: CreateApiKeyRequest,
    _apiKey: string
  ): Promise<CreateApiKeyResponse> {
    const newKey: ApiKey = {
      id: `mock-key-${Date.now()}`,
      name: request.name,
      keyPrefix: `etu_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: mockTimestamp(new Date()),
    }
    mockApiKeys.push(newKey)
    return {
      apiKey: newKey,
      rawKey: `etu_${Math.random().toString(36).substring(2, 40)}`,
    }
  },

  async listApiKeys(
    _request: ListApiKeysRequest,
    _apiKey: string
  ): Promise<ListApiKeysResponse> {
    return { apiKeys: mockApiKeys }
  },

  async deleteApiKey(
    request: DeleteApiKeyRequest,
    _apiKey: string
  ): Promise<DeleteApiKeyResponse> {
    const index = mockApiKeys.findIndex((k) => k.id === request.keyId)
    if (index !== -1) {
      mockApiKeys.splice(index, 1)
    }
    return { success: true }
  },

  async verifyApiKey(
    _request: VerifyApiKeyRequest,
    _apiKey: string
  ): Promise<VerifyApiKeyResponse> {
    return { valid: true, userId: mockUser.id }
  },
}

// Mock Stats Service
export const mockStatsService = {
  async getStats(_request: GetStatsRequest, _apiKey: string): Promise<GetStatsResponse> {
    // Calculate mock stats based on mock data
    // Note: This mock ignores userId and always returns stats for all mock data
    // In a real implementation, you might filter by userId when provided
    const totalBlips = BigInt(mockNotes.length)
    const uniqueTags = BigInt(mockTags.length)
    
    // Calculate total words
    const wordsWritten = BigInt(
      mockNotes.reduce((total, note) => {
        return total + note.content.split(/\s+/).filter((w) => w.length > 0).length
      }, 0)
    )

    return {
      totalBlips,
      uniqueTags,
      wordsWritten,
    }
  },
}

export function isMockMode(): boolean {
  return process.env.E2E_MOCK === "true"
}
