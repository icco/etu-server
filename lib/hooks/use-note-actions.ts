"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes"
import type { Note } from "@/lib/types"

interface UseNoteActionsOptions {
  existingTags: string[]
}

export function useNoteActions({ existingTags }: UseNoteActionsOptions) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Keyboard shortcut: n for new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setEditingNote(null)
        setDialogOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSaveNote = useCallback(
    async (
      content: string,
      tags: string[],
      newImages: { data: string; mimeType: string }[],
      newAudios: { data: string; mimeType: string }[]
    ) => {
      try {
        if (editingNote) {
          await updateNote({
            id: editingNote.id,
            content,
            tags,
            addImages: newImages.length > 0 ? newImages : undefined,
            addAudios: newAudios.length > 0 ? newAudios : undefined,
          })
          toast.success("Blip updated")
        } else {
          await createNote({
            content,
            tags,
            images: newImages.length > 0 ? newImages : undefined,
            audios: newAudios.length > 0 ? newAudios : undefined,
          })
          toast.success("Blip saved")
        }
        setDialogOpen(false)
        setEditingNote(null)
        router.refresh()
      } catch {
        toast.error("Failed to save blip")
      }
    },
    [editingNote, router]
  )

  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note)
    setDialogOpen(true)
  }, [])

  const handleDeleteNote = useCallback(
    async (id: string) => {
      try {
        await deleteNote(id)
        toast.success("Blip deleted")
        router.refresh()
      } catch {
        toast.error("Failed to delete blip")
      }
    },
    [router]
  )

  const openNewNoteDialog = useCallback(() => {
    setEditingNote(null)
    setDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingNote(null)
  }, [])

  return {
    dialogOpen,
    setDialogOpen,
    editingNote,
    existingTags,
    handleSaveNote,
    handleEditNote,
    handleDeleteNote,
    openNewNoteDialog,
    closeDialog,
  }
}
