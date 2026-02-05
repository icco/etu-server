// Shared view-layer types for notes across the application
// These types transform gRPC Timestamp fields to Date objects for easier use in React components

import type {
  Note as GrpcNote,
  NoteImage as GrpcNoteImage,
  NoteAudio as GrpcNoteAudio,
  Tag as GrpcTag,
} from "@/lib/grpc/client"

// View layer type for NoteImage: converts Timestamp createdAt to Date
export type NoteImage = Omit<GrpcNoteImage, "createdAt"> & {
  createdAt?: Date
}

// View layer type for NoteAudio: converts Timestamp createdAt to Date
export type NoteAudio = Omit<GrpcNoteAudio, "createdAt"> & {
  createdAt?: Date
}

// View layer type for Note: converts Timestamp fields to Date
export type Note = Omit<GrpcNote, "createdAt" | "updatedAt" | "images" | "audios"> & {
  createdAt: Date
  updatedAt: Date
  images: NoteImage[]
  audios: NoteAudio[]
}

// View layer type for Tag: omits Timestamp createdAt (not needed in views)
export type Tag = Omit<GrpcTag, "createdAt"> & {
  id: string
  name: string
  count: number
}
