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
  }
}

// Get backend URL from environment
const GRPC_URL = process.env.GRPC_BACKEND_URL || "localhost:50051"

// Create clients
function createNotesClient() {
  return new protoDescriptor.etu.NotesService(
    GRPC_URL,
    grpc.credentials.createInsecure()
  )
}

function createTagsClient() {
  return new protoDescriptor.etu.TagsService(
    GRPC_URL,
    grpc.credentials.createInsecure()
  )
}

// Singleton clients
let notesClient: InstanceType<typeof protoDescriptor.etu.NotesService> | null = null
let tagsClient: InstanceType<typeof protoDescriptor.etu.TagsService> | null = null

function getNotesClient() {
  if (!notesClient) {
    notesClient = createNotesClient()
  }
  return notesClient
}

function getTagsClient() {
  if (!tagsClient) {
    tagsClient = createTagsClient()
  }
  return tagsClient
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

// Helper to create metadata with API key
function createMetadata(apiKey: string): grpc.Metadata {
  const metadata = new grpc.Metadata()
  metadata.set("authorization", apiKey)
  return metadata
}

// Promisified gRPC calls
function promisify<TRequest, TResponse>(
  client: grpc.Client,
  method: string,
  request: TRequest,
  metadata: grpc.Metadata
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const fn = (client as unknown as Record<string, Function>)[method]
    if (!fn) {
      reject(new Error(`Method ${method} not found on client`))
      return
    }
    fn.call(client, request, metadata, (error: grpc.ServiceError | null, response: TResponse) => {
      if (error) {
        reject(error)
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

// Convert gRPC timestamp to Date
export function timestampToDate(ts: Timestamp | undefined): Date {
  if (!ts) return new Date()
  return new Date(parseInt(ts.seconds) * 1000 + ts.nanos / 1000000)
}
