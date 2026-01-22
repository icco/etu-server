"use client"

/**
 * Client-side API wrapper for Etu
 * Uses server actions for all data operations
 */

import {
  createNote as createNoteAction,
  updateNote as updateNoteAction,
  deleteNote as deleteNoteAction,
  getNotes as getNotesAction,
  getTags as getTagsAction,
} from "@/lib/actions/notes"

export interface Note {
  id: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  count: number
}

export interface ListNotesResponse {
  notes: Note[]
  total: number
}

export interface ListTagsResponse {
  tags: Tag[]
}

class ApiClient {
  async listNotes(params?: {
    search?: string
    tags?: string[]
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<ListNotesResponse & { limit: number; offset: number }> {
    const result = await getNotesAction(params)
    return {
      ...result,
      limit: params?.limit || 50,
      offset: params?.offset || 0,
    }
  }

  async createNote(data: { content: string; tags?: string[] }): Promise<{ id: string }> {
    return createNoteAction({
      content: data.content,
      tags: data.tags || [],
    })
  }

  async getNote(id: string): Promise<Note> {
    const result = await getNotesAction({ limit: 1 })
    const note = result.notes.find((n) => n.id === id)
    if (!note) {
      throw new Error("Note not found")
    }
    return note
  }

  async updateNote(
    id: string,
    data: { content?: string; tags?: string[] }
  ): Promise<{ success: boolean }> {
    return updateNoteAction({
      id,
      ...data,
    })
  }

  async deleteNote(id: string): Promise<{ success: boolean }> {
    return deleteNoteAction(id)
  }

  async listTags(): Promise<ListTagsResponse> {
    const tags = await getTagsAction()
    return { tags }
  }
}

// Export singleton instance
export const api = new ApiClient()
