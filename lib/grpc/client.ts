import { createClient } from "@connectrpc/connect"
import { createGrpcTransport } from "@connectrpc/connect-node"
import { Code, ConnectError } from "@connectrpc/connect"
import {
  NotesService,
  TagsService,
  AuthService,
  ApiKeysService,
  type Timestamp as ProtoTimestamp,
  type Note as ProtoNote,
  type Tag as ProtoTag,
  type User as ProtoUser,
  type ApiKey as ProtoApiKey,
} from "@icco/etu-proto"

// Get backend URL from environment
const GRPC_URL = process.env.GRPC_BACKEND_URL || "http://localhost:50051"

// Create gRPC transport (uses HTTP/2 by default)
function createTransport() {
  return createGrpcTransport({
    baseUrl: GRPC_URL,
  })
}

// Lazy-initialized transport
let transport: ReturnType<typeof createGrpcTransport> | null = null

function getTransport() {
  if (!transport) {
    transport = createTransport()
  }
  return transport
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

// Re-export types for compatibility
export interface Timestamp {
  seconds: string | bigint
  nanos: number
}

export interface Note {
  id: string
  content: string
  tags: string[]
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
  stripeCustomerId?: string
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
  return {
    authorization: apiKey,
  }
}

// Convert proto types to our interface types
function convertNote(note: ProtoNote | undefined): Note {
  if (!note) {
    return { id: "", content: "", tags: [] }
  }
  return {
    id: note.id,
    content: note.content,
    tags: [...note.tags],
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
    stripeCustomerId: user.stripeCustomerId,
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
async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ConnectError) {
      throw new GrpcError(error)
    }
    throw error
  }
}

// Notes Service
export const notesService = {
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
    })
  },

  async createNote(request: CreateNoteRequest, apiKey: string): Promise<CreateNoteResponse> {
    return withErrorHandling(async () => {
      const client = getNotesClient()
      const response = await client.createNote(
        {
          userId: request.userId,
          content: request.content,
          tags: request.tags ?? [],
        },
        { headers: createHeaders(apiKey) }
      )
      return { note: convertNote(response.note) }
    })
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
    })
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
        },
        { headers: createHeaders(apiKey) }
      )
      return { note: convertNote(response.note) }
    })
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
    })
  },
}

// Tags Service
export const tagsService = {
  async listTags(request: ListTagsRequest, apiKey: string): Promise<ListTagsResponse> {
    return withErrorHandling(async () => {
      const client = getTagsClient()
      const response = await client.listTags(
        { userId: request.userId },
        { headers: createHeaders(apiKey) }
      )
      return { tags: response.tags.map(convertTag) }
    })
  },
}

// Auth Service
export const authService = {
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
    })
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
    })
  },

  async getUser(request: GetUserRequest, apiKey: string): Promise<GetUserResponse> {
    return withErrorHandling(async () => {
      const client = getAuthClient()
      const response = await client.getUser(
        { userId: request.userId },
        { headers: createHeaders(apiKey) }
      )
      return { user: convertUser(response.user) }
    })
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
    })
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
    })
  },
}

// API Keys Service
export const apiKeysService = {
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
    })
  },

  async listApiKeys(request: ListApiKeysRequest, apiKey: string): Promise<ListApiKeysResponse> {
    return withErrorHandling(async () => {
      const client = getApiKeysClient()
      const response = await client.listApiKeys(
        { userId: request.userId },
        { headers: createHeaders(apiKey) }
      )
      return { apiKeys: response.apiKeys.map(convertApiKey) }
    })
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
    })
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
    })
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
