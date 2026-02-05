"use client"

import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline"
import { NoteCard } from "@/components/note-card"
import { NoteDialog } from "@/components/note-dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import { AppNav } from "@/components/app-nav"
import { MobileNav } from "@/components/mobile-nav"
import { useNoteActions } from "@/lib/hooks/use-note-actions"
import type { Tag } from "@/lib/grpc/client"
import type { Note } from "@/lib/types"

interface NotesViewProps {
  initialRandomNotes: Note[]
  initialRecentNote?: Note
  initialTags: Tag[]
}

export function NotesView({ initialRandomNotes, initialRecentNote, initialTags }: NotesViewProps) {
  const allTags = initialTags.map((t) => t.name)
  const gridNotes = initialRandomNotes
  const mostRecent = initialRecentNote
  const hasNotes = initialRandomNotes.length > 0 || initialRecentNote !== undefined

  const {
    dialogOpen,
    setDialogOpen,
    editingNote,
    handleSaveNote,
    handleEditNote,
    handleDeleteNote,
    openNewNoteDialog,
    closeDialog,
  } = useNoteActions({ existingTags: allTags })

  return (
    <>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Header logoHref="/" nav={<AppNav />}>
          <MobileNav />
          <UserMenu />
        </Header>

        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <DocumentTextIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Notes</h1>
            </div>
          </div>

          {!hasNotes ? (
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
            onClick={openNewNoteDialog}
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
          if (!open) closeDialog()
          else setDialogOpen(open)
        }}
        onSave={handleSaveNote}
        initialContent={editingNote?.content}
        initialTags={editingNote?.tags}
        initialImages={editingNote?.images}
        initialAudios={editingNote?.audios}
        existingTags={allTags}
        title={editingNote ? "Edit Blip" : "New Blip"}
      />
    </>
  )
}
