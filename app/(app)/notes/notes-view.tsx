"use client"

import { useState, useEffect, useCallback, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TagIcon,
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
  searchParams: { search?: string; tags?: string; from?: string; to?: string }
}

function groupNotesByDate(notes: Note[]): Map<string, Note[]> {
  const grouped = new Map<string, Note[]>()

  notes.forEach((note) => {
    // Use UTC date string as key for consistent server/client grouping
    const d = new Date(note.createdAt)
    const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(note)
  })

  return grouped
}

export function NotesView({ initialNotes, initialTags, searchParams }: NotesViewProps) {
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const selectedTags = searchParams.tags?.split(",").filter(Boolean) || []

  const notes = initialNotes
  const allTags = initialTags.map(t => t.name)
  const groupedNotes = groupNotesByDate(notes)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setEditingNote(null)
        setDialogOpen(true)
      }

      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        document.getElementById("search-notes")?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Update URL with filters
  const updateFilters = useCallback((newSearch?: string, newTags?: string[]) => {
    const params = new URLSearchParams()
    if (newSearch) params.set("search", newSearch)
    if (newTags?.length) params.set("tags", newTags.join(","))

    startTransition(() => {
      router.push(`/notes?${params.toString()}`)
    })
  }, [router])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    // Debounce the URL update
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters(value, selectedTags)
    }, 300)
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push("/notes")
  }

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

  const hasFilters = searchQuery || selectedTags.length > 0

  return (
    <>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Header logoHref="/notes">
          <input
            id="search-notes"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input input-bordered"
          />
          <UserMenu />
        </Header>

        {/* Active tag filters */}
        {selectedTags.length > 0 && (
          <div className="bg-base-100 border-b border-base-300">
            <div className="container mx-auto px-4 md:px-6 py-3">
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-sm text-base-content/60 shrink-0">Filtering by:</span>
                {selectedTags.map((tag) => (
                  <span key={tag} className="badge badge-primary badge-lg">
                    {tag}
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-xs gap-1 ml-2"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                  Clear
                </button>
                <Link href="/tags" className="btn btn-ghost btn-xs gap-1 ml-auto">
                  <TagIcon className="h-3.5 w-3.5" />
                  All Tags
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          {notes.length === 0 && !hasFilters ? (
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
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MagnifyingGlassIcon className="h-16 w-16 text-base-content/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No matching blips</h2>
              <p className="text-base-content/60 mb-6">Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className="btn btn-ghost">
                Clear Filters
              </button>
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
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* FAB - New note button */}
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
