"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  DocumentTextIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes"
import { NoteCard } from "@/components/note-card"
import { NoteDialog } from "@/components/note-dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import type { Tag } from "@/lib/grpc/client"
import type { Note } from "@/lib/types"

interface NotesViewProps {
  initialNotes: Note[]
  initialTags: Tag[]
}

export function NotesView({ initialNotes, initialTags }: NotesViewProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const notes = initialNotes
  const allTags = initialTags.map((t) => t.name)
  const gridNotes = notes.slice(0, 6)
  const mostRecent = notes[0]

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

  const handleSaveNote = async (
    content: string,
    tags: string[],
    newImages: { data: string; mimeType: string }[]
  ) => {
    try {
      if (editingNote) {
        await updateNote({
          id: editingNote.id,
          content,
          tags,
          addImages: newImages.length > 0 ? newImages : undefined,
        })
        toast.success("Blip updated")
      } else {
        await createNote({
          content,
          tags,
          images: newImages.length > 0 ? newImages : undefined,
        })
        toast.success("Blip saved")
      }
      setDialogOpen(false)
      setEditingNote(null)
      router.refresh()
    } catch {
      toast.error("Failed to save blip")
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setDialogOpen(true)
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id)
      toast.success("Blip deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete blip")
    }
  }

  return (
    <>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Header logoHref="/">
          <Link href="/history" className="btn btn-ghost gap-2">
            <ClockIcon className="h-5 w-5" />
            History
          </Link>
          <UserMenu />
        </Header>

        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <DocumentTextIcon className="h-16 w-16 text-base-content/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No blips yet</h2>
              <p className="text-base-content/60 mb-6 max-w-md">
                Start your interstitial journaling journey by capturing your first thought.
              </p>
              <button onClick={() => setDialogOpen(true)} className="btn btn-primary gap-2">
                <PlusIcon className="h-5 w-5" />
                Create Your First Blip
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* 3×2 grid of truncated blips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    compact
                  />
                ))}
              </div>

              {/* Most recent blip in full form */}
              {mostRecent && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Latest blip</h3>
                  <NoteCard
                    note={mostRecent}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        <div className="fab">
          <button
            onClick={() => {
              setEditingNote(null)
              setDialogOpen(true)
            }}
            className="btn btn-lg btn-circle btn-primary"
            aria-label="Create new note"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>

        <Footer />
      </div>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingNote(null)
        }}
        onSave={handleSaveNote}
        initialContent={editingNote?.content}
        initialTags={editingNote?.tags}
        initialImages={editingNote?.images}
        existingTags={allTags}
        title={editingNote ? "Edit Blip" : "New Blip"}
      />
    </>
  )
}
