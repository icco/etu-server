import { createClient } from "@connectrpc/connect"
import { createGrpcTransport } from "@connectrpc/connect-node"
import { Code, ConnectError } from "@connectrpc/connect"
import {
  NotesService,
  TagsService,
  AuthService,
  ApiKeysService,
  UserSettingsService,
  type Note as ProtoNote,
  type NoteImage as ProtoNoteImage,
  type Tag as ProtoTag,
  type User as ProtoUser,
  type ApiKey as ProtoApiKey,
} from "@icco/etu-proto"
import type { Timestamp as ProtoTimestamp } from "@bufbuild/protobuf/wkt"
import {
  mockNotesService,
  mockTagsService,
  mockAuthService,
  mockUserSettingsService,
  mockApiKeysService,
  isMockMode,
} from "./mock"

// Get backend URL from environment
const rawGrpcUrl = process.env.GRPC_BACKEND_URL || "http://localhost:50051"
// Ensure URL has protocol prefix
const GRPC_URL = rawGrpcUrl.startsWith("http") ? rawGrpcUrl : `http://${rawGrpcUrl}`

// Create gRPC transport (uses HTTP/2 by default)
function createTransport() {
  return createGrpcTransport({
    baseUrl: GRPC_URL,
  })
}

// Create transport per-request to avoid stale connections
function getTransport() {
  return createTransport()
}

// Create service clients
function getNotesClient() {
  return createClient(NotesService, getTransport())
}

function getTagsClient() {
  return createClient(TagsService, getTransport())
}

function getAuthClient() {
  return createClient(AuthService, getTransport())
}

function getApiKeysClient() {
  return createClient(ApiKeysService, getTransport())
}

function getUserSettingsClient() {
  return createClient(UserSettingsService, getTransport())
}

// Re-export types for compatibility
export interface Timestamp {
  seconds: string | bigint
  nanos: number
}

export interface NoteImage {
  id: string
  url: string
  extractedText: string
  mimeType: string
  createdAt?: Timestamp
}

export interface ImageUpload {
  data: Uint8Array
  mimeType: string
}

export interface Note {
  id: string
  content: string
  tags: string[]
  images: NoteImage[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface Tag {
  id: string
  name: string
  count: number
  createdAt?: Timestamp
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  subscriptionStatus: string
  subscriptionEnd?: Timestamp
  createdAt?: Timestamp
  updatedAt?: Timestamp
  stripeCustomerId?: string
  notionKey?: string
}

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  createdAt?: Timestamp
  lastUsed?: Timestamp
}

// Request/Response types
export interface ListNotesRequest {
  userId: string
  search?: string
  tags?: string[]
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface ListNotesResponse {
  notes: Note[]
  total: number
  limit: number
  offset: number
}

export interface CreateNoteRequest {
  userId: string
  content: string
  tags?: string[]
  images?: ImageUpload[]
}

export interface CreateNoteResponse {
  note: Note
}

export interface GetNoteRequest {
  userId: string
  id: string
}

export interface GetNoteResponse {
  note: Note
}

export interface UpdateNoteRequest {
  userId: string
  id: string
  content?: string
  tags?: string[]
  updateTags?: boolean
  addImages?: ImageUpload[]
}

export interface UpdateNoteResponse {
  note: Note
}

export interface DeleteNoteRequest {
  userId: string
  id: string
}

export interface DeleteNoteResponse {
  success: boolean
}

export interface GetRandomNotesRequest {
  userId: string
  count?: number
}

export interface GetRandomNotesResponse {
  notes: Note[]
}

export interface ListTagsRequest {
  userId: string
}

export interface ListTagsResponse {
  tags: Tag[]
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface RegisterResponse {
  user: User
}

export interface AuthenticateRequest {
  email: string
  password: string
}

export interface AuthenticateResponse {
  success: boolean
  user?: User
}

export interface GetUserRequest {
  userId: string
}

export interface GetUserResponse {
  user: User
}

export interface GetUserSettingsRequest {
  userId: string
}

export interface GetUserSettingsResponse {
  user: User
}

export interface UpdateUserSettingsRequest {
  userId: string
  notionKey?: string
  name?: string
  image?: string
  password?: string
}

export interface UpdateUserSettingsResponse {
  user: User
}

export interface GetUserByStripeCustomerIdRequest {
  stripeCustomerId: string
}

export interface GetUserByStripeCustomerIdResponse {
  user?: User
}

export interface UpdateUserSubscriptionRequest {
  userId: string
  subscriptionStatus: string
  stripeCustomerId?: string
  subscriptionEnd?: Timestamp
}

export interface UpdateUserSubscriptionResponse {
  user: User
}

export interface CreateApiKeyRequest {
  userId: string
  name: string
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey
  rawKey: string
}

export interface ListApiKeysRequest {
  userId: string
}

export interface ListApiKeysResponse {
  apiKeys: ApiKey[]
}

export interface DeleteApiKeyRequest {
  userId: string
  keyId: string
}

export interface DeleteApiKeyResponse {
  success: boolean
}

export interface VerifyApiKeyRequest {
  rawKey: string
}

export interface VerifyApiKeyResponse {
  valid: boolean
  userId?: string
}

// Helper to create headers with API key
function createHeaders(apiKey: string): HeadersInit {
  // Debug: log presence of API key without exposing its value
  if (process.env.NODE_ENV !== "production") {
    console.log(`gRPC auth header configured: ${apiKey ? "present" : "absent"}`)
  }
  // Use Authorization header with the API key (backend expects raw key, not Bearer format)
  return {
    Authorization: apiKey,
  }
}

// Convert proto types to our interface types
function convertNoteImage(image: ProtoNoteImage): NoteImage {
  return {
    id: image.id,
    url: image.url,
    extractedText: image.extractedText,
    mimeType: image.mimeType,
    createdAt: image.createdAt ? convertTimestamp(image.createdAt) : undefined,
  }
}

function convertNote(note: ProtoNote | undefined): Note {
  if (!note) {
    return { id: "", content: "", tags: [], images: [] }
  }
  return {
    id: note.id,
    content: note.content,
    tags: [...note.tags],
    images: note.images.map(convertNoteImage),
    createdAt: note.createdAt ? convertTimestamp(note.createdAt) : undefined,
    updatedAt: note.updatedAt ? convertTimestamp(note.updatedAt) : undefined,
  }
}

function convertTag(tag: ProtoTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
    count: tag.count,
    createdAt: tag.createdAt ? convertTimestamp(tag.createdAt) : undefined,
  }
}

function convertUser(user: ProtoUser | undefined): User {
  if (!user) {
    return { id: "", email: "", subscriptionStatus: "" }
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEnd: user.subscriptionEnd ? convertTimestamp(user.subscriptionEnd) : undefined,
    createdAt: user.createdAt ? convertTimestamp(user.createdAt) : undefined,
    updatedAt: user.updatedAt ? convertTimestamp(user.updatedAt) : undefined,
    stripeCustomerId: user.stripeCustomerId,
    notionKey: user.notionKey,
  }
}

function convertApiKey(key: ProtoApiKey | undefined): ApiKey {
  if (!key) {
    return { id: "", name: "", keyPrefix: "" }
  }
  return {
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    createdAt: key.createdAt ? convertTimestamp(key.createdAt) : undefined,
    lastUsed: key.lastUsed ? convertTimestamp(key.lastUsed) : undefined,
  }
}

function convertTimestamp(ts: ProtoTimestamp): Timestamp {
  return {
    seconds: ts.seconds.toString(),
    nanos: ts.nanos,
  }
}

// Wrap calls with error handling
async function withErrorHandling<T>(fn: () => Promise<T>, methodName?: string): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ConnectError) {
      console.error(`gRPC error in ${methodName || 'unknown'}:`, error.code, error.message)
      throw new GrpcError(error)
    }
    throw error
  }
}

// Notes Service
const realNotesService = {
  async listNotes(request: ListNotesRequest, apiKey: string): Promise<ListNotesResponse> {
    return withErrorHandling(async () => {
      const client = getNotesClient()
      const response = await client.listNotes(
        {
          userId: request.userId,
          search: request.search ?? "",
          tags: request.tags ?? [],
          startDate: request.startDate ?? "",
          endDate: request.endDate ?? "",
          limit: request.limit ?? 50,
          offset: request.offset ?? 0,
        },
        { headers: createHeaders(apiKey) }
      )
      return {
        notes: response.notes.map(convertNote),
        total: response.total,
        limit: response.limit,
        offset: response.offset,
      }
    }, "NotesService.listNotes")
  },

  async createNote(request: CreateNoteRequest, apiKey: string): Promise<CreateNoteResponse> {
    return withErrorHandling(async () => {
      const client = getNotesClient()
      const response = await client.createNote(
        {
          userId: request.userId,
          content: request.content,
          tags: request.tags ?? [],
          images: request.images ?? [],
        },
        { headers: createHeaders(apiKey) }
      )
      return { note: convertNote(response.note) }
    }, "NotesService.createNote")
  },

  async getNote(request: GetNoteRequest, apiKey: string): Promise<GetNoteResponse> {
    return withErrorHandling(async () => {
      const client = getNotesClient()
      const response = await client.getNote(
        {
          userId: request.userId,
          id: request.id,
        },
        { headers: createHeaders(apiKey) }
      )
      return { note: convertNote(response.note) }
    }, "NotesService.getNote")
  },

  async updateNote(request: UpdateNoteRequest, apiKey: string): Promise<UpdateNoteResponse> {
    return withErrorHandling(async () => {
      const client = getNotesClient()
      const response = await client.updateNote(
        {
          userId: request.userId,
          id: request.id,
          content: request.content,
          tags: request.tags ?? [],
          updateTags: request.updateTags ?? false,
          addImages: request.addImages ?? [],
        },
        { headers: createHeaders(apiKey) }
      )
      return { note: convertNote(response.note) }
    }, "NotesService.updateNote")
  },

  async deleteNote(request: DeleteNoteRequest, apiKey: string): Promise<DeleteNoteResponse> {
    return withErrorHandling(async () => {
      const client = getNotesClient()
      const response = await client.deleteNote(
        {
          userId: request.userId,
          id: request.id,
        },
        { headers: createHeaders(apiKey) }
      )
      return { success: response.success }
    }, "NotesService.deleteNote")
  },

  async getRandomNotes(request: GetRandomNotesRequest, apiKey: string): Promise<GetRandomNotesResponse> {
    return withErrorHandling(async () => {
      const client = getNotesClient()
      const response = await client.getRandomNotes(
        {
          userId: request.userId,
          count: request.count ?? 5,
        },
        { headers: createHeaders(apiKey) }
      )
      return {
        notes: response.notes.map(convertNote),
      }
    }, "NotesService.getRandomNotes")
  },
}

// Tags Service
const realTagsService = {
  async listTags(request: ListTagsRequest, apiKey: string): Promise<ListTagsResponse> {
    return withErrorHandling(async () => {
      const client = getTagsClient()
      const response = await client.listTags(
        { userId: request.userId },
        { headers: createHeaders(apiKey) }
      )
      return { tags: response.tags.map(convertTag) }
    }, "TagsService.listTags")
  },
}

// Auth Service
const realAuthService = {
  async register(request: RegisterRequest, apiKey: string): Promise<RegisterResponse> {
    return withErrorHandling(async () => {
      const client = getAuthClient()
      const response = await client.register(
        {
          email: request.email,
          password: request.password,
        },
        { headers: createHeaders(apiKey) }
      )
      return { user: convertUser(response.user) }
    }, "AuthService.register")
  },

  async authenticate(request: AuthenticateRequest, apiKey: string): Promise<AuthenticateResponse> {
    return withErrorHandling(async () => {
      const client = getAuthClient()
      const response = await client.authenticate(
        {
          email: request.email,
          password: request.password,
        },
        { headers: createHeaders(apiKey) }
      )
      return {
        success: response.success,
        user: response.user ? convertUser(response.user) : undefined,
      }
    }, "AuthService.authenticate")
  },

  async getUser(request: GetUserRequest, apiKey: string): Promise<GetUserResponse> {
    return withErrorHandling(async () => {
      const client = getAuthClient()
      const response = await client.getUser(
        { userId: request.userId },
        { headers: createHeaders(apiKey) }
      )
      return { user: convertUser(response.user) }
    }, "AuthService.getUser")
  },

  async getUserByStripeCustomerId(
    request: GetUserByStripeCustomerIdRequest,
    apiKey: string
  ): Promise<GetUserByStripeCustomerIdResponse> {
    return withErrorHandling(async () => {
      const client = getAuthClient()
      const response = await client.getUserByStripeCustomerId(
        { stripeCustomerId: request.stripeCustomerId },
        { headers: createHeaders(apiKey) }
      )
      return { user: response.user ? convertUser(response.user) : undefined }
    }, "AuthService.getUserByStripeCustomerId")
  },

  async updateUserSubscription(
    request: UpdateUserSubscriptionRequest,
    apiKey: string
  ): Promise<UpdateUserSubscriptionResponse> {
    return withErrorHandling(async () => {
      const client = getAuthClient()
      const response = await client.updateUserSubscription(
        {
          userId: request.userId,
          subscriptionStatus: request.subscriptionStatus,
          stripeCustomerId: request.stripeCustomerId,
          subscriptionEnd: request.subscriptionEnd
            ? {
                seconds: BigInt(request.subscriptionEnd.seconds.toString()),
                nanos: request.subscriptionEnd.nanos,
              }
            : undefined,
        },
        { headers: createHeaders(apiKey) }
      )
      return { user: convertUser(response.user) }
    }, "AuthService.updateUserSubscription")
  },

}

// API Keys Service
const realApiKeysService = {
  async createApiKey(request: CreateApiKeyRequest, apiKey: string): Promise<CreateApiKeyResponse> {
    return withErrorHandling(async () => {
      const client = getApiKeysClient()
      const response = await client.createApiKey(
        {
          userId: request.userId,
          name: request.name,
        },
        { headers: createHeaders(apiKey) }
      )
      return {
        apiKey: convertApiKey(response.apiKey),
        rawKey: response.rawKey,
      }
    }, "ApiKeysService.createApiKey")
  },

  async listApiKeys(request: ListApiKeysRequest, apiKey: string): Promise<ListApiKeysResponse> {
    return withErrorHandling(async () => {
      const client = getApiKeysClient()
      const response = await client.listApiKeys(
        { userId: request.userId },
        { headers: createHeaders(apiKey) }
      )
      return { apiKeys: response.apiKeys.map(convertApiKey) }
    }, "ApiKeysService.listApiKeys")
  },

  async deleteApiKey(request: DeleteApiKeyRequest, apiKey: string): Promise<DeleteApiKeyResponse> {
    return withErrorHandling(async () => {
      const client = getApiKeysClient()
      const response = await client.deleteApiKey(
        {
          userId: request.userId,
          keyId: request.keyId,
        },
        { headers: createHeaders(apiKey) }
      )
      return { success: response.success }
    }, "ApiKeysService.deleteApiKey")
  },

  async verifyApiKey(request: VerifyApiKeyRequest, apiKey: string): Promise<VerifyApiKeyResponse> {
    return withErrorHandling(async () => {
      const client = getApiKeysClient()
      const response = await client.verifyApiKey(
        { rawKey: request.rawKey },
        { headers: createHeaders(apiKey) }
      )
      return {
        valid: response.valid,
        userId: response.userId,
      }
    }, "ApiKeysService.verifyApiKey")
  },
}

// Convert gRPC timestamp to Date
export function timestampToDate(ts: Timestamp | undefined): Date {
  if (!ts) return new Date()

  const seconds =
    typeof ts.seconds === "bigint"
      ? Number(ts.seconds)
      : typeof ts.seconds === "string"
        ? parseInt(ts.seconds, 10)
        : Number(ts.seconds)
  const nanos = typeof ts.nanos === "string" ? parseInt(ts.nanos, 10) : Number(ts.nanos ?? 0)

  if (!Number.isFinite(seconds) || !Number.isFinite(nanos)) {
    return new Date()
  }

  return new Date(seconds * 1000 + nanos / 1000000)
}

// Custom error class for gRPC errors with user-friendly messages
export class GrpcError extends Error {
  public readonly code: Code
  public readonly details: string

  constructor(error: ConnectError) {
    const message = grpcStatusToMessage(error.code, error.message)
    super(message)
    this.name = "GrpcError"
    this.code = error.code
    this.details = error.message
  }
}

function grpcStatusToMessage(code: Code, details: string): string {
  switch (code) {
    case Code.Unauthenticated:
      return "Authentication required"
    case Code.PermissionDenied:
      return "Permission denied"
    case Code.NotFound:
      return "Resource not found"
    case Code.AlreadyExists:
      return "Resource already exists"
    case Code.InvalidArgument:
      return details || "Invalid request"
    case Code.Unavailable:
      return "Service temporarily unavailable"
    case Code.DeadlineExceeded:
      return "Request timed out"
    default:
      return details || "An unexpected error occurred"
  }
}

// Export services - use mock in E2E test mode
export const notesService = isMockMode() ? mockNotesService : realNotesService
export const tagsService = isMockMode() ? mockTagsService : realTagsService
export const authService = isMockMode() ? mockAuthService : realAuthService
export const apiKeysService = isMockMode() ? mockApiKeysService : realApiKeysService

// User Settings Service
const realUserSettingsService = {
  async getUserSettings(
    request: GetUserSettingsRequest,
    apiKey: string
  ): Promise<GetUserSettingsResponse> {
    return withErrorHandling(async () => {
      const client = getUserSettingsClient()
      const response = await client.getUserSettings(
        { userId: request.userId },
        { headers: createHeaders(apiKey) }
      )
      return { user: convertUser(response.user) }
    }, "UserSettingsService.getUserSettings")
  },

  async updateUserSettings(
    request: UpdateUserSettingsRequest,
    apiKey: string
  ): Promise<UpdateUserSettingsResponse> {
    return withErrorHandling(async () => {
      const client = getUserSettingsClient()
      const response = await client.updateUserSettings(
        {
          userId: request.userId,
          notionKey: request.notionKey,
          name: request.name,
          image: request.image,
          password: request.password,
        },
        { headers: createHeaders(apiKey) }
      )
      return { user: convertUser(response.user) }
    }, "UserSettingsService.updateUserSettings")
  },
}

export const userSettingsService = isMockMode() ? mockUserSettingsService : realUserSettingsService
