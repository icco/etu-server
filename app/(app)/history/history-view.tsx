"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  DocumentTextIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import { getNotes } from "@/lib/actions/notes"
import { NoteCard } from "@/components/note-card"
import { NoteDialog } from "@/components/note-dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import { AppNav } from "@/components/app-nav"
import { MobileNav } from "@/components/mobile-nav"
import { useNoteActions } from "@/lib/hooks/use-note-actions"
import { groupNotesByDate } from "@/lib/utils/group-notes"
import type { Tag } from "@/lib/grpc/client"
import type { Note } from "@/lib/types"

interface HistoryViewProps {
  initialNotes: Note[]
  initialTotal: number
  initialTags: Tag[]
}

export function HistoryView({ initialNotes, initialTotal, initialTags }: HistoryViewProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasLoadedMoreRef = useRef(false)

  const allTags = initialTags.map((t) => t.name)
  const groupedNotes = groupNotesByDate(notes)
  const hasMore = notes.length < total

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

  // Sync with server after refresh when we haven't loaded more pages (so mutations show up)
  useEffect(() => {
    if (!hasLoadedMoreRef.current) {
      setNotes(initialNotes)
      setTotal(initialTotal)
    }
  }, [initialNotes, initialTotal])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    hasLoadedMoreRef.current = true
    try {
      const result = await getNotes({ limit: 10, offset: notes.length })
      setNotes((prev) => [...prev, ...result.notes])
      setTotal(result.total)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, notes.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) loadMore()
      },
      { rootMargin: "100px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

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
              <h1 className="text-3xl font-bold">History</h1>
            </div>
          </div>

          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <DocumentTextIcon className="h-16 w-16 text-base-content/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No blips yet</h2>
              <p className="text-base-content/60 mb-6 max-w-md">
                Create your first blip from the Notes page or use the button below.
              </p>
              <Link href="/notes" className="btn btn-primary gap-2">
                <ArrowLeftIcon className="h-5 w-5" />
                Notes
              </Link>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
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

              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" aria-hidden />
              {loading && (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-md" />
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
        existingTags={allTags}
        title={editingNote ? "Edit Blip" : "New Blip"}
      />
    </>
  )
}
