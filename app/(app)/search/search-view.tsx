"use client"

import { format } from "date-fns"
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline"
import { NoteCard } from "@/components/note-card"
import { NoteDialog } from "@/components/note-dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NavSearch } from "@/components/nav-search"
import { UserMenu } from "@/components/user-menu"
import { AppNav } from "@/components/app-nav"
import { MobileNav } from "@/components/mobile-nav"
import { useNoteActions } from "@/lib/hooks/use-note-actions"
import { groupNotesByDate } from "@/lib/utils/group-notes"
import type { Tag } from "@/lib/grpc/client"
import type { Note } from "@/lib/types"

interface SearchViewProps {
  initialNotes: Note[]
  initialTags: Tag[]
  query: string
}

export function SearchView({ initialNotes, initialTags, query }: SearchViewProps) {
  const notes = initialNotes
  const allTags = initialTags.map((t) => t.name)
  const groupedNotes = groupNotesByDate(notes)

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
          <NavSearch defaultValue={query} />
          <UserMenu />
        </Header>

        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <MagnifyingGlassIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Search</h1>
            </div>
          </div>

          {!query ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MagnifyingGlassIcon className="h-16 w-16 text-base-content/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Search your blips</h2>
              <p className="text-base-content/60 mb-6 max-w-md">
                Use the search box above to find notes by content or keywords.
              </p>
              <NavSearch defaultValue="" className="input input-bordered w-full max-w-md" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MagnifyingGlassIcon className="h-16 w-16 text-base-content/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No matching blips</h2>
              <p className="text-base-content/60 mb-6">Try a different search term.</p>
              <NavSearch defaultValue={query} className="input input-bordered w-full max-w-md" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              <p className="text-base-content/60">
                {notes.length} result{notes.length === 1 ? "" : "s"} for &quot;{query}&quot;
              </p>
              {Array.from(groupedNotes.entries()).map(([dateKey, dateNotes]) => (
                <div key={dateKey}>
                  <div className="sticky top-16 bg-base-200/95 backdrop-blur-sm py-2 mb-4 z-10">
                    <h3 className="text-lg font-semibold" suppressHydrationWarning>
                      {format(new Date(dateNotes[0].createdAt), "MMMM d, yyyy")}
                    </h3>
                    <div className="divider my-0" />
                  </div>
                  <div className="space-y-4">
                    {dateNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                      />
                    ))}
                  </div>
                </div>
              ))}
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
