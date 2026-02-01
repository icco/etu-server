// Shared view-layer types for notes across the application
// These types transform gRPC Timestamp fields to Date objects for easier use in React components

import type { Note as GrpcNote, NoteImage as GrpcNoteImage } from "@/lib/grpc/client"

// View layer type for NoteImage: converts Timestamp createdAt to Date
export type NoteImage = Omit<GrpcNoteImage, "createdAt"> & {
  createdAt?: Date
}

// View layer type for Note: converts Timestamp fields to Date
export type Note = Omit<GrpcNote, "createdAt" | "updatedAt" | "images"> & {
  createdAt: Date
  updatedAt: Date
  images: NoteImage[]
}
