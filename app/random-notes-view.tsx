"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SparklesIcon, ClockIcon, PlusIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { updateNote, deleteNote } from "@/lib/actions/notes"
import { NoteCard } from "@/components/note-card"
import { NoteDialog } from "@/components/note-dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import type { Note as GrpcNote, NoteImage as GrpcNoteImage, Tag } from "@/lib/grpc/client"

// View layer types: with Timestamp fields converted to Date
type NoteImage = Omit<GrpcNoteImage, "createdAt"> & {
  createdAt?: Date
}

type Note = Omit<GrpcNote, "createdAt" | "updatedAt" | "images"> & {
  createdAt: Date
  updatedAt: Date
  images: NoteImage[]
}

interface RandomNotesViewProps {
  notes: Note[]
  tags: Tag[]
}

export function RandomNotesView({ notes, tags }: RandomNotesViewProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const allTags = tags.map(t => t.name)

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
          <Link href="/notes" className="btn btn-ghost gap-2">
            <ClockIcon className="h-5 w-5" />
            History
          </Link>
          <UserMenu />
        </Header>

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Random Blips</h1>
              </div>
              <p className="text-base-content/60">
                A selection of notes resurfaced for you to review and refine.
              </p>
            </div>

            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <SparklesIcon className="h-16 w-16 text-base-content/40 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No blips yet</h2>
                <p className="text-base-content/60 mb-6 max-w-md">
                  Start your interstitial journaling journey by capturing your first thought.
                </p>
                <Link href="/notes" className="btn btn-primary gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Create Your First Blip
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                  />
                ))}

                {/* Refresh prompt */}
                <div className="text-center py-8">
                  <p className="text-base-content/60 mb-4">
                    Want to see different blips?
                  </p>
                  <button
                    onClick={() => router.refresh()}
                    className="btn btn-outline btn-sm gap-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Refresh Random Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

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
