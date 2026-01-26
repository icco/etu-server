import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import path from "path"

// Load proto file
const PROTO_PATH = path.join(process.cwd(), "proto", "etu.proto")

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as unknown as {
  etu: {
    NotesService: typeof grpc.Client
    TagsService: typeof grpc.Client
    AuthService: typeof grpc.Client
    ApiKeysService: typeof grpc.Client
  }
}

// Get backend URL from environment
const GRPC_URL = process.env.GRPC_BACKEND_URL || "localhost:50051"

// Use TLS in production, insecure credentials for local development
function getGrpcCredentials(): grpc.ChannelCredentials {
  if (process.env.NODE_ENV === "production") {
    return grpc.credentials.createSsl()
  }
  return grpc.credentials.createInsecure()
}

// Check if a client connection is still usable
function isClientUsable(client: grpc.Client | null): boolean {
  if (!client) {
    return false
  }
  const state = client.getChannel().getConnectivityState(false)
  return state !== grpc.connectivityState.SHUTDOWN
}

// Create clients
function createNotesClient() {
  return new protoDescriptor.etu.NotesService(GRPC_URL, getGrpcCredentials())
}

function createTagsClient() {
  return new protoDescriptor.etu.TagsService(GRPC_URL, getGrpcCredentials())
}

function createAuthClient() {
  return new protoDescriptor.etu.AuthService(GRPC_URL, getGrpcCredentials())
}

function createApiKeysClient() {
  return new protoDescriptor.etu.ApiKeysService(GRPC_URL, getGrpcCredentials())
}

// Singleton clients
let notesClient: InstanceType<typeof protoDescriptor.etu.NotesService> | null = null
let tagsClient: InstanceType<typeof protoDescriptor.etu.TagsService> | null = null
let authClient: InstanceType<typeof protoDescriptor.etu.AuthService> | null = null
let apiKeysClient: InstanceType<typeof protoDescriptor.etu.ApiKeysService> | null = null

function getNotesClient(): InstanceType<typeof protoDescriptor.etu.NotesService> {
  if (!isClientUsable(notesClient)) {
    notesClient = createNotesClient()
  }
  return notesClient!
}

function getTagsClient(): InstanceType<typeof protoDescriptor.etu.TagsService> {
  if (!isClientUsable(tagsClient)) {
    tagsClient = createTagsClient()
  }
  return tagsClient!
}

function getAuthClient(): InstanceType<typeof protoDescriptor.etu.AuthService> {
  if (!isClientUsable(authClient)) {
    authClient = createAuthClient()
  }
  return authClient!
}

function getApiKeysClient(): InstanceType<typeof protoDescriptor.etu.ApiKeysService> {
  if (!isClientUsable(apiKeysClient)) {
    apiKeysClient = createApiKeysClient()
  }
  return apiKeysClient!
}

// Types
export interface Timestamp {
  seconds: string
  nanos: number
}

export interface Note {
  id: string
  content: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Tag {
  id: string
  name: string
  count: number
  createdAt: Timestamp
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  subscriptionStatus: string
  subscriptionEnd?: Timestamp
  createdAt: Timestamp
  stripeCustomerId?: string
}

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  createdAt: Timestamp
  lastUsed?: Timestamp
}

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

// Auth types
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

// API Keys types
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

// Helper to create metadata with API key
function createMetadata(apiKey: string): grpc.Metadata {
  const metadata = new grpc.Metadata()
  metadata.set("authorization", apiKey)
  return metadata
}

// Promisified gRPC calls with user-friendly error handling
function promisify<TRequest, TResponse>(
  client: grpc.Client,
  method: string,
  request: TRequest,
  metadata: grpc.Metadata
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const fn = (client as unknown as Record<string, (...args: unknown[]) => void>)[method]
    if (!fn) {
      reject(new Error(`Method ${method} not found on client`))
      return
    }
    fn.call(client, request, metadata, (error: grpc.ServiceError | null, response: TResponse) => {
      if (error) {
        reject(new GrpcError(error))
      } else {
        resolve(response)
      }
    })
  })
}

// Notes Service
export const notesService = {
  async listNotes(request: ListNotesRequest, apiKey: string): Promise<ListNotesResponse> {
    const client = getNotesClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "listNotes", request, metadata)
  },

  async createNote(request: CreateNoteRequest, apiKey: string): Promise<CreateNoteResponse> {
    const client = getNotesClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "createNote", request, metadata)
  },

  async getNote(request: GetNoteRequest, apiKey: string): Promise<GetNoteResponse> {
    const client = getNotesClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "getNote", request, metadata)
  },

  async updateNote(request: UpdateNoteRequest, apiKey: string): Promise<UpdateNoteResponse> {
    const client = getNotesClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "updateNote", request, metadata)
  },

  async deleteNote(request: DeleteNoteRequest, apiKey: string): Promise<DeleteNoteResponse> {
    const client = getNotesClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "deleteNote", request, metadata)
  },
}

// Tags Service
export const tagsService = {
  async listTags(request: ListTagsRequest, apiKey: string): Promise<ListTagsResponse> {
    const client = getTagsClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "listTags", request, metadata)
  },
}

// Auth Service
export const authService = {
  async register(request: RegisterRequest, apiKey: string): Promise<RegisterResponse> {
    const client = getAuthClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "register", request, metadata)
  },

  async authenticate(request: AuthenticateRequest, apiKey: string): Promise<AuthenticateResponse> {
    const client = getAuthClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "authenticate", request, metadata)
  },

  async getUser(request: GetUserRequest, apiKey: string): Promise<GetUserResponse> {
    const client = getAuthClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "getUser", request, metadata)
  },

  async getUserByStripeCustomerId(
    request: GetUserByStripeCustomerIdRequest,
    apiKey: string
  ): Promise<GetUserByStripeCustomerIdResponse> {
    const client = getAuthClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "getUserByStripeCustomerId", request, metadata)
  },

  async updateUserSubscription(
    request: UpdateUserSubscriptionRequest,
    apiKey: string
  ): Promise<UpdateUserSubscriptionResponse> {
    const client = getAuthClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "updateUserSubscription", request, metadata)
  },
}

// API Keys Service
export const apiKeysService = {
  async createApiKey(request: CreateApiKeyRequest, apiKey: string): Promise<CreateApiKeyResponse> {
    const client = getApiKeysClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "createApiKey", request, metadata)
  },

  async listApiKeys(request: ListApiKeysRequest, apiKey: string): Promise<ListApiKeysResponse> {
    const client = getApiKeysClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "listApiKeys", request, metadata)
  },

  async deleteApiKey(request: DeleteApiKeyRequest, apiKey: string): Promise<DeleteApiKeyResponse> {
    const client = getApiKeysClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "deleteApiKey", request, metadata)
  },

  async verifyApiKey(request: VerifyApiKeyRequest, apiKey: string): Promise<VerifyApiKeyResponse> {
    const client = getApiKeysClient()
    const metadata = createMetadata(apiKey)
    return promisify(client, "verifyApiKey", request, metadata)
  },
}

// Convert gRPC timestamp to Date
export function timestampToDate(ts: Timestamp | undefined): Date {
  if (!ts) return new Date()

  // Handle both string and number types for seconds/nanos
  const seconds =
    typeof ts.seconds === "string" ? parseInt(ts.seconds, 10) : Number(ts.seconds)
  const nanos = typeof ts.nanos === "string" ? parseInt(ts.nanos, 10) : Number(ts.nanos ?? 0)

  if (!Number.isFinite(seconds) || !Number.isFinite(nanos)) {
    return new Date()
  }

  return new Date(seconds * 1000 + nanos / 1000000)
}

// Custom error class for gRPC errors with user-friendly messages
export class GrpcError extends Error {
  public readonly code: grpc.status
  public readonly details: string

  constructor(error: grpc.ServiceError) {
    const message = grpcStatusToMessage(error.code, error.details)
    super(message)
    this.name = "GrpcError"
    this.code = error.code
    this.details = error.details
  }
}

function grpcStatusToMessage(code: grpc.status, details: string): string {
  switch (code) {
    case grpc.status.UNAUTHENTICATED:
      return "Authentication required"
    case grpc.status.PERMISSION_DENIED:
      return "Permission denied"
    case grpc.status.NOT_FOUND:
      return "Resource not found"
    case grpc.status.ALREADY_EXISTS:
      return "Resource already exists"
    case grpc.status.INVALID_ARGUMENT:
      return details || "Invalid request"
    case grpc.status.UNAVAILABLE:
      return "Service temporarily unavailable"
    case grpc.status.DEADLINE_EXCEEDED:
      return "Request timed out"
    default:
      return details || "An unexpected error occurred"
  }
}
