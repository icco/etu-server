// Shared view-layer types for notes across the application
// These types transform gRPC Timestamp fields to Date objects for easier use in React components

import {
  timestampToDate,
  type Note as GrpcNote,
  type NoteImage as GrpcNoteImage,
  type NoteAudio as GrpcNoteAudio,
  type Tag as GrpcTag,
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

// =============================================================================
// Converter functions: gRPC types -> View types
// =============================================================================

/** Convert gRPC NoteImage to view NoteImage (Timestamp -> Date) */
export function toNoteImage(img: GrpcNoteImage): NoteImage {
  return {
    id: img.id,
    url: img.url,
    extractedText: img.extractedText,
    mimeType: img.mimeType,
    createdAt: img.createdAt ? timestampToDate(img.createdAt) : undefined,
  }
}

/** Convert gRPC NoteAudio to view NoteAudio (Timestamp -> Date) */
export function toNoteAudio(audio: GrpcNoteAudio): NoteAudio {
  return {
    id: audio.id,
    url: audio.url,
    transcribedText: audio.transcribedText,
    mimeType: audio.mimeType,
    createdAt: audio.createdAt ? timestampToDate(audio.createdAt) : undefined,
  }
}

/** Convert gRPC Note to view Note (Timestamp -> Date) */
export function toNote(note: GrpcNote): Note {
  return {
    id: note.id,
    content: note.content,
    createdAt: timestampToDate(note.createdAt),
    updatedAt: timestampToDate(note.updatedAt),
    tags: note.tags,
    images: note.images.map(toNoteImage),
    audios: note.audios.map(toNoteAudio),
  }
}
