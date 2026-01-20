"use client"

import { useState, useEffect, useCallback, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  XMarkIcon,
  HomeIcon
} from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes"
import { NoteCard } from "@/components/note-card"
import { NoteDialog } from "@/components/note-dialog"

interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface Tag {
  id: string
  name: string
  count: number
}

interface NotesViewProps {
  initialNotes: Note[]
  initialTags: Tag[]
  searchParams: { search?: string; tags?: string; from?: string; to?: string }
}

function groupNotesByDate(notes: Note[]): Map<string, Note[]> {
  const grouped = new Map<string, Note[]>()
  
  notes.forEach((note) => {
    const dateKey = format(new Date(note.createdAt), "MMMM d, yyyy")
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.tags?.split(",").filter(Boolean) || []
  )

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

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)
    updateFilters(searchQuery, newTags)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    router.push("/notes")
  }

  const handleSaveNote = async (content: string, tags: string[]) => {
    try {
      if (editingNote) {
        await updateNote({ id: editingNote.id, content, tags })
        toast.success("Blip updated")
      } else {
        await createNote({ content, tags })
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
        {/* Header */}
        <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
          <div className="navbar-start">
          </div>

          <div className="navbar-center flex-1 max-w-2xl px-4 hidden md:block">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/60 pointer-events-none z-10" />
              <input
                id="search-notes"
                type="search"
                placeholder="Search blips... (press /)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="input input-bordered w-full pl-10 bg-base-100 text-base-content placeholder:text-base-content/50"
              />
            </div>
          </div>

          <div className="navbar-end gap-1">
            <button
              onClick={() => {
                setEditingNote(null)
                setDialogOpen(true)
              }}
              className="btn btn-primary gap-2"
            >
              <PencilSquareIcon className="h-5 w-5" />
              <span className="hidden sm:inline">New Blip</span>
            </button>
            <Link href="/settings" className="btn btn-ghost btn-square">
              <Cog6ToothIcon className="h-6 w-6" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn btn-ghost btn-square"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Mobile search section */}
        {mobileSearchOpen && (
          <div className="bg-base-100 border-b border-base-300 md:hidden">
            <div className="container mx-auto px-4 py-3">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/60 pointer-events-none z-10" />
                <input
                  id="search-notes-mobile"
                  type="search"
                  placeholder="Search blips..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input input-bordered w-full pl-10 bg-base-100 text-base-content placeholder:text-base-content/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="bg-base-100 border-b border-base-300">
            <div className="container mx-auto px-4 md:px-6 py-3">
              <div className="flex gap-2 items-center overflow-x-auto">
                <span className="text-sm text-base-content/60 shrink-0">Tags:</span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`badge badge-lg cursor-pointer transition-colors shrink-0 ${
                      selectedTags.includes(tag) ? "badge-primary" : "badge-ghost hover:badge-neutral"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost btn-xs gap-1 ml-2"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          {notes.length === 0 && !hasFilters ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PencilSquareIcon className="h-16 w-16 text-base-content/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No blips yet</h2>
              <p className="text-base-content/60 mb-6 max-w-md">
                Start your interstitial journaling journey by capturing your first thought.
              </p>
              <button onClick={() => setDialogOpen(true)} className="btn btn-primary gap-2">
                <PencilSquareIcon className="h-5 w-5" />
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
              {Array.from(groupedNotes.entries()).map(([date, dateNotes]) => (
                <div key={date}>
                  <div className="sticky top-[73px] bg-base-200/95 backdrop-blur-sm py-2 mb-4 z-10">
                    <h3 className="text-lg font-semibold">{date}</h3>
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

        {/* Mobile bottom nav */}
        <div className="btm-nav btm-nav-sm md:hidden z-50">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <HomeIcon className="h-5 w-5" />
            <span className="btm-nav-label">Home</span>
          </button>
          <button 
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen)
              if (!mobileSearchOpen) {
                setTimeout(() => document.getElementById("search-notes-mobile")?.focus(), 100)
              }
            }}
            className={mobileSearchOpen ? "active" : ""}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="btm-nav-label">Search</span>
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            className="active bg-primary text-primary-content"
          >
            <PencilSquareIcon className="h-6 w-6" />
            <span className="btm-nav-label">New</span>
          </button>
          <button onClick={() => (window.location.href = "/settings")}>
            <Cog6ToothIcon className="h-5 w-5" />
            <span className="btm-nav-label">Settings</span>
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })}>
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="btm-nav-label">Logout</span>
          </button>
        </div>
        <div className="h-16 md:hidden" />
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
        existingTags={allTags}
        title={editingNote ? "Edit Blip" : "New Blip"}
      />
    </>
  )
}
